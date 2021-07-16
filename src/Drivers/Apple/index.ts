/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  AppleScopes,
  AppleToken,
  AppleTokenDecoded,
  AppleUserContract,
  ApiRequestContract,
  AppleDriverConfig,
  AppleDriverContract,
  RedirectRequestContract,
} from '@ioc:Adonis/Addons/Ally'
import { Oauth2Driver } from '../../AbstractDrivers/Oauth2'
import { OauthException } from '../../Exceptions'
import JWT from 'jsonwebtoken'
import JWKS, { CertSigningKey, JwksClient, RsaSigningKey } from 'jwks-rsa'

/**
 * Apple driver to login user via Apple
 */
export class AppleDriver
  extends Oauth2Driver<AppleToken, AppleScopes>
  implements AppleDriverContract
{
  protected accessTokenUrl = 'https://appleid.apple.com/auth/token'
  protected authorizeUrl = 'https://appleid.apple.com/auth/authorize'
  protected jwksClient: JwksClient | null = null

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "apple_oauth_state"
   */
  protected stateCookieName = 'apple_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state
   * from Apple
   */
  protected stateParamName = 'state'

  /**
   * Parameter name for defining the scopes
   */
  protected scopeParamName = 'scope'

  /**
   * Scopes separator
   */
  protected scopesSeparator = ' '

  constructor(ctx: HttpContextContract, public config: AppleDriverConfig) {
    super(ctx, config)

    /**
     * Initiate JWKS client
     */
    this.jwksClient = JWKS({
      rateLimit: true,
      cache: true,
      cacheMaxEntries: 100,
      cacheMaxAge: 1000 * 60 * 60 * 24,
      jwksUri: 'https://appleid.apple.com/auth/keys',
    })

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request
     */
    this.loadState()
  }

  /**
   * Configuring the redirect request with defaults
   * https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/incorporating_sign_in_with_apple_into_other_platforms
   */
  protected configureRedirectRequest(request: RedirectRequestContract<AppleScopes>) {
    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['email'])

    request.param('response_type', 'code')
    request.param('response_mode', 'form_post')
    request.param('grant_type', 'authorization_code')
  }

  /**
   * Get Apple Signning Keys to verify token
   * @param token an id_token receoived from Apple
   * @returns signing key
   */
  protected async getAppleSigningKey(token): Promise<string> {
    const decodedToken = JWT.decode(token, { complete: true })
    const key = await this.jwksClient?.getSigningKey(decodedToken?.header.kid)
    return (key as CertSigningKey)?.publicKey || (key as RsaSigningKey)?.rsaPublicKey
  }

  /**
   * Parses user info from the Apple Token
   */
  protected async getUserInfo(token: string): Promise<AppleUserContract> {
    const signingKey = await this.getAppleSigningKey(token)
    const decodedUser = JWT.verify(token, signingKey, {
      issuer: 'https://appleid.apple.com',
      audience: this.config.clientId,
    })
    const firstName = (decodedUser as AppleTokenDecoded)?.user?.name?.firstName || ''
    const lastName = (decodedUser as AppleTokenDecoded)?.user?.name?.lastName || ''

    return {
      id: (decodedUser as AppleTokenDecoded).sub,
      avatarUrl: null,
      original: null,
      nickName: (decodedUser as AppleTokenDecoded).sub,
      name: `${firstName}${lastName ? ` ${lastName}` : ''}`,
      email: (decodedUser as AppleTokenDecoded).email,
      emailVerificationState:
        (decodedUser as AppleTokenDecoded).email_verified === 'true' ? 'verified' : 'unverified',
    }
  }

  /**
   * Generates Client Secret
   * https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens
   * @returns clientSecret
   */
  protected generateClientSecret(): string {
    const clientSecret = JWT.sign({}, this.config.key, {
      algorithm: 'ES256',
      keyid: this.config.keyId,
      issuer: this.config.teamId,
      audience: 'https://appleid.apple.com',
      subject: this.config.clientId,
      expiresIn: 60,
      header: { alg: 'ES256', kid: this.config.keyId },
    })
    return clientSecret
  }

  /**
   * Get access token
   */
  public async accessToken(callback?: (request: ApiRequestContract) => void): Promise<AppleToken> {
    /**
     * We expect the user to handle errors before calling this method
     */
    if (this.hasError()) {
      throw OauthException.missingAuthorizationCode(this.codeParamName)
    }

    /**
     * We expect the user to properly handle the state mis-match use case before
     * calling this method
     */
    if (this.stateMisMatch()) {
      throw OauthException.stateMisMatch()
    }

    return this.getAccessToken((request) => {
      request.header('Content-Type', 'application/x-www-form-urlencoded')
      request.field('client_secret', this.generateClientSecret())
      request.field(this.codeParamName, this.getCode())

      if (typeof callback === 'function') {
        callback(request)
      }
    })
  }

  /**
   * Find if the current error code is for access denied
   */
  public accessDenied(): boolean {
    const error = this.getError()
    if (!error) {
      return false
    }

    return error === 'access_denied'
  }

  /**
   * Returns details for the authorized user
   */
  public async user(callback?: (request: ApiRequestContract) => void) {
    const token = await this.accessToken(callback)
    const user = await this.getUserInfo(token.id_token)

    return {
      ...user,
      token,
    }
  }

  /**
   * Finds the user by the access token
   */
  public async userFromToken(token: string) {
    const user = await this.getUserInfo(token)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }
}
