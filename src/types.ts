/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { ConfigProvider } from '@adonisjs/core/types'
import type {
  Oauth2AccessToken,
  Oauth1RequestToken,
  Oauth1AccessToken,
  Oauth1ClientConfig,
  Oauth2ClientConfig,
  ApiRequestContract,
  RedirectRequestContract as ClientRequestContract,
} from '@poppinss/oauth-client/types'
import type { AllyManager } from './ally_manager.ts'

export type { Oauth2AccessToken }
export type { Oauth1AccessToken }
export type { Oauth1RequestToken }
export type { ApiRequestContract }
export type { Oauth2ClientConfig as Oauth2DriverConfig }
export type { Oauth1ClientConfig as Oauth1DriverConfig }

/**
 * Allowed high-level intents when using a provider through `AllyManager`.
 *
 * @example
 * ```ts
 * ally.use('github', { intent: 'signup' })
 * ```
 */
export type AllyManagerIntent = 'signup' | 'login' | 'link'

/**
 * Options accepted by `AllyManager.use`.
 */
export type AllyManagerUseOptions = {
  /**
   * The interaction intent associated with the provider usage.
   */
  intent?: AllyManagerIntent
}

/**
 * Issue: https://github.com/Microsoft/TypeScript/issues/29729
 * Solution: https://github.com/sindresorhus/type-fest/blob/main/source/literal-union.d.ts
 *
 * Allows known literal values while still accepting arbitrary strings.
 *
 * @example
 * ```ts
 * const scopes: LiteralStringUnion<'email' | 'profile'>[] = ['email']
 * ```
 */
export type LiteralStringUnion<LiteralType> = LiteralType | (string & { _?: never })

/**
 * Extension of oauth-client redirect request with support
 * for defining scopes as first class citizen
 *
 * @typeParam Scopes - The known set of supported scopes for the provider.
 */
export interface RedirectRequestContract<
  Scopes extends string = string,
> extends ClientRequestContract {
  /**
   * Define a callback to transform scopes before they are defined
   * as a param
   *
   * @param callback - Callback used to transform scope values before serialization.
   * @returns The current redirect request instance.
   */
  transformScopes(callback: (scopes: LiteralStringUnion<Scopes>[]) => string[]): this

  /**
   * Define the scopes for authorization
   *
   * @param scopes - The scopes to serialize on the request.
   * @returns The current redirect request instance.
   */
  scopes(scopes: LiteralStringUnion<Scopes>[]): this

  /**
   * Merge to existing pre-defined scopes
   *
   * @param scopes - Additional scopes to merge with the existing list.
   * @returns The current redirect request instance.
   */
  mergeScopes(scopes: LiteralStringUnion<Scopes>[]): this

  /**
   * Clear existing scopes
   *
   * @returns The current redirect request instance.
   */
  clearScopes(): this
}

/**
 * The user fetched from the oauth provider.
 *
 * @typeParam Token - The access token shape returned by the provider.
 */
export interface AllyUserContract<Token extends Oauth2AccessToken | Oauth1AccessToken> {
  /**
   * Unique user identifier returned by the provider.
   */
  id: string
  /**
   * Provider-specific nickname or username.
   */
  nickName: string
  /**
   * Display name returned by the provider.
   */
  name: string
  /**
   * Primary email address returned by the provider, when available.
   */
  email: string | null
  /**
   * Email verification state as inferred from the provider payload.
   */
  emailVerificationState: 'verified' | 'unverified' | 'unsupported'
  /**
   * URL to the user's avatar, when available.
   */
  avatarUrl: string | null
  /**
   * Access token information associated with the user payload.
   */
  token: Token
  /**
   * Original provider response body.
   */
  original: any
}

/**
 * Every driver should implement this contract
 *
 * @typeParam Token - The token shape returned by the driver.
 * @typeParam Scopes - The supported authorization scopes for the driver.
 */
export interface AllyDriverContract<
  Token extends Oauth2AccessToken | Oauth1AccessToken,
  Scopes extends string,
> {
  /**
   * OAuth protocol version supported by the driver.
   */
  version: 'oauth1' | 'oauth2'

  /**
   * Driver configuration. Drivers may expose their config publicly so
   * the manager can inspect runtime capabilities.
   */
  config?: any

  /**
   * Perform stateless authentication. Only applicable for Oauth2 clients
   *
   * @returns The current driver instance.
   */
  stateless(): this

  /**
   * Set the origin URL to redirect the user back to when an error
   * occurs during the OAuth callback.
   *
   * @param url - The URL to redirect to on error
   * @returns The current driver instance.
   */
  setOriginUrl(url: string): this

  /**
   * Get the origin URL that was set before the redirect and persisted
   * via a cookie. Available during the callback phase after `loadState`
   * has been called.
   *
   * @returns The origin URL, or `undefined` when none was set.
   */
  getOriginUrl(): string | undefined

  /**
   * Redirect user for authorization
   *
   * @param callback - Optional callback used to customize the redirect request.
   * @returns A promise that resolves after the redirect response is prepared.
   */
  redirect(callback?: (request: RedirectRequestContract<Scopes>) => void): Promise<void>

  /**
   * Get redirect url. You must manage the state yourself when redirecting
   * manually
   *
   * @param callback - Optional callback used to customize the redirect request.
   * @returns A promise resolving to the computed redirect URL.
   */
  redirectUrl(callback?: (request: RedirectRequestContract<Scopes>) => void): Promise<string>

  /**
   * Find if the current request has authorization code or oauth token
   *
   * @returns `true` when the current request contains an authorization code or token.
   */
  hasCode(): boolean

  /**
   * Get the current request authorization code or oauth token. Returns
   * null if there no code
   *
   * @returns The current authorization code or token value.
   */
  getCode(): string | null

  /**
   * Find if the current error code is for access denied
   *
   * @returns `true` when the provider reported an access-denied response.
   */
  accessDenied(): boolean

  /**
   * Find if there is a state mismatch
   *
   * @returns `true` when the request state does not match the stored state.
   */
  stateMisMatch(): boolean

  /**
   * Find if there is an error post redirect
   *
   * @returns `true` when the callback request contains a provider error.
   */
  hasError(): boolean

  /**
   * Get the post redirect error
   *
   * @returns The provider error code or message, when present.
   */
  getError(): string | null

  /**
   * Get access token
   *
   * @param callback - Optional callback used to customize the token request.
   * @returns A promise resolving to the access token payload.
   */
  accessToken(callback?: (request: ApiRequestContract) => void): Promise<Token>

  /**
   * Returns details for the authorized user
   *
   * @param callback - Optional callback used to customize downstream API requests.
   * @returns A promise resolving to the authenticated user profile.
   */
  user(callback?: (request: ApiRequestContract) => void): Promise<AllyUserContract<Token>>

  /**
   * Finds the user by access token. Applicable with "Oauth2" only
   *
   * @param token - The access token to use.
   * @param callback - Optional callback used to customize downstream API requests.
   * @returns A promise resolving to the authenticated user profile.
   */
  userFromToken(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; type: 'bearer' }>>

  /**
   * Finds the user by access token. Applicable with "Oauth1" only
   *
   * @param token - The OAuth1 token to use.
   * @param secret - The OAuth1 token secret to use.
   * @param callback - Optional callback used to customize downstream API requests.
   * @returns A promise resolving to the authenticated user profile.
   */
  userFromTokenAndSecret(
    token: string,
    secret: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; secret: string }>>
}

/**
 * The manager driver factory method is called by the AllyManager to create
 * an instance of a driver during an HTTP request
 *
 * @param ctx - The current HTTP context.
 * @returns A social authentication driver instance.
 */
export type AllyManagerDriverFactory = (ctx: HttpContext) => AllyDriverContract<any, any>

/**
 * ----------------------------------------
 * Discord driver
 * ----------------------------------------
 */

/**
 * Available discord scopes
 * https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
 */
export type DiscordScopes =
  | 'activities.read'
  | 'activities.write'
  | 'applications.builds.read'
  | 'applications.builds.upload'
  | 'applications.commands'
  | 'applications.commands.update'
  | 'applications.entitlements'
  | 'applications.store.update'
  | 'bot'
  | 'connections'
  | 'email'
  | 'gdm.join'
  | 'guilds'
  | 'guilds.join'
  | 'identify'
  | 'messages.read'
  | 'relationships.read'
  | 'rpc'
  | 'rpc.activities.write'
  | 'rpc.notifications.read'
  | 'rpc.voice.read'
  | 'rpc.voice.write'
  | 'webhook.incoming'

/**
 * Shape of the Discord access token
 */
export type DiscordToken = {
  token: string
  type: string
  scope: string
  expiresIn: number
  expiresAt: Exclude<Oauth2AccessToken['expiresAt'], undefined>
  refreshToken: string
}

/**
 * Extra options available for Discord
 */
export type DiscordDriverConfig = Oauth2ClientConfig & {
  disallowLocalSignup?: boolean
  userInfoUrl?: string
  scopes?: LiteralStringUnion<DiscordScopes>[]
  prompt?: 'consent' | 'none'
  guildId?: `${bigint}` // a snowflake
  disableGuildSelect?: boolean
  permissions?: number
}

/**
 * ----------------------------------------
 * Github driver
 * ----------------------------------------
 */

/**
 * Available github scopes
 * https://docs.github.com/en/free-pro-team@latest/developers/apps/scopes-for-oauth-apps#available-scopes
 */
export type GithubScopes =
  | 'repo'
  | 'repo:status'
  | 'repo_deployment'
  | 'public_repo'
  | 'repo:invite'
  | 'security_events'
  | 'admin:repo_hook'
  | 'write:repo_hook'
  | 'read:repo_hook'
  | 'admin:org'
  | 'write:org'
  | 'read:org'
  | 'admin:public_key'
  | 'write:public_key'
  | 'read:public_key'
  | 'admin:org_hook'
  | 'gist'
  | 'notifications'
  | 'user'
  | 'read:user'
  | 'user:email'
  | 'user:follow'
  | 'delete_repo'
  | 'write:discussion'
  | 'read:discussion'
  | 'write:packages'
  | 'read:packages'
  | 'delete:packages'
  | 'admin:gpg_key'
  | 'write:gpg_key'
  | 'read:gpg_key'
  | 'workflow'

/**
 * Shape of the Github access token
 */
export type GithubToken = {
  token: string
  type: string
  scope: string
}

/**
 * Extra options available for Github
 */
export type GithubDriverConfig = Oauth2ClientConfig & {
  disallowLocalSignup?: boolean
  login?: string
  scopes?: LiteralStringUnion<GithubScopes>[]
  allowSignup?: boolean
  userInfoUrl?: string
  userEmailUrl?: string
}

/**
 * ----------------------------------------
 * Twitter driver
 * ----------------------------------------
 */

/**
 * Shape of the twitter token
 */
export type TwitterToken = {
  token: string
  secret: string
  userId: string
  screenName: string
}

/**
 * Extra options available for twitter
 */
export type TwitterDriverConfig = Oauth1ClientConfig & {
  disallowLocalSignup?: boolean
  userInfoUrl?: string
}

/**
 * ----------------------------------------
 * Twitter X driver
 * ----------------------------------------
 */

/**
 * Common X OAuth2 scopes.
 * https://docs.x.com/fundamentals/authentication/oauth-2.0/user-access-token
 */
export type TwitterXScopes =
  | 'tweet.read'
  | 'tweet.write'
  | 'tweet.moderate.write'
  | 'users.email'
  | 'users.read'
  | 'follows.read'
  | 'follows.write'
  | 'offline.access'
  | 'space.read'
  | 'mute.read'
  | 'mute.write'
  | 'like.read'
  | 'like.write'
  | 'list.read'
  | 'list.write'
  | 'block.read'
  | 'block.write'
  | 'bookmark.read'
  | 'bookmark.write'
  | 'dm.read'
  | 'dm.write'
  | 'media.write'

/**
 * Shape of the X access token
 */
export type TwitterXToken = Oauth2AccessToken & {
  scope: string
}

/**
 * Extra options available for X
 */
export type TwitterXDriverConfig = Oauth2ClientConfig & {
  disallowLocalSignup?: boolean
  userInfoUrl?: string
  scopes?: LiteralStringUnion<TwitterXScopes>[]
}

/**
 * ----------------------------------------
 * Google driver
 * ----------------------------------------
 */

/**
 * Most popular google scopes. You can find rest of them on the following link
 * https://developers.google.com/identity/protocols/oauth2/scopes
 */
export type GoogleScopes =
  | 'userinfo.email'
  | 'userinfo.profile'
  | 'openid'
  | 'contacts'
  | 'contacts.other.readonly'
  | 'contacts.readonly'
  | 'directory.readonly'
  | 'user.addresses.read'
  | 'user.birthday.read'
  | 'user.emails.read'
  | 'user.gender.read'
  | 'user.organization.read'
  | 'user.phonenumbers.read'
  | 'analytics'
  | 'analytics.readonly'
  | 'documents'
  | 'documents.readonly'
  | 'forms'
  | 'forms.currentonly'
  | 'groups'
  | 'spreadsheets'
  | 'calendar'
  | 'calendar.events'
  | 'calendar.events.readonly'
  | 'calendar.readonly'
  | 'calendar.settings.readonly'
  | 'drive'
  | 'drive.appdata'
  | 'drive.file'
  | 'drive.metadata'
  | 'drive.metadata.readonly'
  | 'drive.photos.readonly'
  | 'drive.readonly'
  | 'drive.scripts'

/**
 * Shape of the Google access token
 */
export type GoogleToken = Oauth2AccessToken & {
  /**
   * @deprecated
   * Use `idToken` instead
   */
  id_token: string
  idToken: string
  grantedScopes: string[]
}

/**
 * Config accepted by the google driver. Most of the options can be
 * overwritten at runtime
 * https://developers.google.com/identity/protocols/oauth2/openid-connect#re-consent
 */
export type GoogleDriverConfig = Oauth2ClientConfig & {
  disallowLocalSignup?: boolean
  userInfoUrl?: string

  /**
   * Can be configured at runtime
   */
  scopes?: LiteralStringUnion<GoogleScopes>[]
  prompt?: 'none' | 'consent' | 'select_account'
  accessType?: 'online' | 'offline'
  hostedDomain?: string
  display?: 'page' | 'popup' | 'touch' | 'wrap'
}

/**
 * ----------------------------------------
 * LinkedIn driver
 * ----------------------------------------
 */

/**
 * A list of LinkedIn scopes. You can find the scopes available
 * to your app from the LinkedIn dasbhoard.
 * https://www.linkedin.com/developers/apps/<appId>/auth
 */
export type LinkedInScopes =
  | 'r_emailaddress'
  | 'r_liteprofile'
  | 'w_member_social'
  | 'r_fullprofile'
  | 'r_basicprofile_app'
  | 'r_primarycontact'
  | 'rw_organization_admin'

/**
 * Shape of the Linked access token
 */
export type LinkedInToken = {
  token: string
  type: string
  expiresIn: number
  expiresAt: Exclude<Oauth2AccessToken['expiresAt'], undefined>
}

/**
 * Config accepted by the linkedin driver. Most of the options can be
 * overwritten at runtime
 * https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow?context=linkedin%2Fcontext&tabs=HTTPS#step-2-request-an-authorization-code
 */
export type LinkedInDriverConfig = Oauth2ClientConfig & {
  disallowLocalSignup?: boolean
  userInfoUrl?: string
  userEmailUrl?: string

  /**
   * Can be configured at runtime
   */
  scopes?: LiteralStringUnion<LinkedInScopes>[]
}

/**
 * ----------------------------------------
 * LinkedIn openid connect driver
 * ----------------------------------------
 */

/**
 * Shape of the LinkedIn openid connect access token
 */
export type LinkedInOpenidConnectAccessToken = {
  token: string
  type: 'bearer'
  expiresIn: number
  expiresAt: Exclude<Oauth2AccessToken['expiresAt'], undefined>
}

/**
 * Config accepted by the linkedIn openid connect driver. Most of the options can be
 * overwritten at runtime
 * https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2#authenticating-members
 */
export type LinkedInOpenidConnectScopes = 'openid' | 'profile' | 'email'

/**
 * The configuration accepted by the driver implementation.
 */
export type LinkedInOpenidConnectDriverConfig = {
  disallowLocalSignup?: boolean
  clientId: string
  clientSecret: string
  callbackUrl: string
  authorizeUrl?: string
  accessTokenUrl?: string
  userInfoUrl?: string

  /**
   * Can be configured at runtime
   */
  scopes?: LiteralStringUnion<LinkedInOpenidConnectScopes>[]
}

/**
 * ----------------------------------------
 * Facebook driver
 * ----------------------------------------
 */

/**
 * Most popular facebook scopes. You can find rest of them on the following link
 * https://developers.facebook.com/docs/permissions/reference/
 */
export type FacebookScopes =
  | 'ads_management'
  | 'ads_read'
  | 'attribution_read'
  | 'business_management'
  | 'catalog_management'
  | 'email'
  | 'groups_access_member_info'
  | 'leads_retrieval'
  | 'pages_events'
  | 'pages_manage_ads'
  | 'pages_manage_cta'
  | 'pages_manage_instant_articles'
  | 'pages_manage_engagement'
  | 'pages_manage_metadata'
  | 'pages_manage_posts'
  | 'pages_messaging'
  | 'pages_read_engagement'
  | 'pages_read_user_content'
  | 'pages_show_list'
  | 'pages_user_gender'
  | 'pages_user_locale'
  | 'pages_user_timezone'
  | 'public_profile'
  | 'publish_to_groups'
  | 'publish_video'
  | 'read_insights'
  | 'user_age_range'
  | 'user_birthday'
  | 'user_friends'
  | 'user_gender'
  | 'user_hometown'
  | 'user_likes'
  | 'user_link'
  | 'user_location'
  | 'user_photos'
  | 'user_posts'
  | 'user_videos'

/**
 * Most used user profile fields.
 * For more visit https://developers.facebook.com/docs/graph-api/reference/user
 */
export type FacebookProfileFields =
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'middle_name'
  | 'name'
  | 'name_format'
  | 'picture'
  | 'short_name'
  | 'verified'
  | 'birthday'
  | 'email'
  | 'gender'
  | 'link'

/**
 * Shape of the Facebook access token
 */
export type FacebookToken = {
  token: string
  type: string
  expiresIn: number
  expiresAt: Exclude<Oauth2AccessToken['expiresAt'], undefined>
}

/**
 * Config accepted by the facebook driver. Most of the options can be
 * overwritten at runtime
 * https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
 */
export type FacebookDriverConfig = Oauth2ClientConfig & {
  disallowLocalSignup?: boolean
  userInfoUrl?: string

  /**
   * Can be configured at runtime
   */
  scopes?: LiteralStringUnion<FacebookScopes>[]
  userFields?: LiteralStringUnion<FacebookProfileFields>[]
  display?: string
  authType?: string
}

/**
 * ----------------------------------------
 * Spotify driver
 * ----------------------------------------
 */

/**
 * Available spotify scopes
 * https://developer.spotify.com/documentation/general/guides/scopes/
 */
export type SpotifyScopes =
  | 'ugc-image-upload'
  | 'user-read-recently-played'
  | 'user-top-read'
  | 'user-read-playback-position'
  | 'user-read-playback-state'
  | 'user-modify-playback-state'
  | 'user-read-currently-playing'
  | 'app-remote-control'
  | 'streaming'
  | 'playlist-modify-public'
  | 'playlist-modify-private'
  | 'playlist-read-private'
  | 'playlist-read-collaborative'
  | 'user-follow-modify'
  | 'user-follow-read'
  | 'user-library-modify'
  | 'user-library-read'
  | 'user-read-email'
  | 'user-read-private'

/**
 * Shape of the Spotify access token
 */
export type SpotifyToken = {
  token: string
  type: string
  refreshToken: string
  expiresIn: number
  expiresAt: Exclude<Oauth2AccessToken['expiresAt'], undefined>
}

/**
 * Extra options available for Spotify
 */
export type SpotifyDriverConfig = Oauth2ClientConfig & {
  disallowLocalSignup?: boolean
  scopes?: LiteralStringUnion<SpotifyScopes>[]
  showDialog?: boolean
}
/**
 * END OF DRIVERS
 */

/**
 * Social providers are inferred inside the user application
 * from the config file
 */
export interface SocialProviders {}

/**
 * Infer the configured social providers from an Ally config provider.
 *
 * @typeParam T - The Ally config provider to inspect.
 */
export type InferSocialProviders<
  T extends ConfigProvider<Record<string, AllyManagerDriverFactory>>,
> = Awaited<ReturnType<T['resolver']>>

/**
 * Ally service is shared with the HTTP context
 */
export interface AllyService extends AllyManager<
  SocialProviders extends Record<string, AllyManagerDriverFactory> ? SocialProviders : never
> {}
