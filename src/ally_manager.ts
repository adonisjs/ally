/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '@adonisjs/core/http'
import type {
  AllyDriverContract,
  AllyManagerDriverFactory,
  AllyManagerUseOptions,
} from './types.ts'
import { E_LOCAL_SIGNUP_DISALLOWED, E_UNKNOWN_ALLY_PROVIDER } from './errors.ts'

/**
 * AllyManager is used to create and manage social authentication driver
 * instances during an HTTP request. The drivers are cached during the
 * lifecycle of a request to avoid creating duplicate instances.
 *
 * @example
 * ```ts
 * router.get('/github/redirect', ({ ally }) => {
 *   return ally.use('github').redirect()
 * })
 *
 * router.get('/github/callback', async ({ ally }) => {
 *   const github = ally.use('github')
 *   const user = await github.user()
 *   return user
 * })
 * ```
 */
export class AllyManager<KnownSocialProviders extends Record<string, AllyManagerDriverFactory>> {
  #ctx: HttpContext
  #driversCache: Map<keyof KnownSocialProviders, AllyDriverContract<any, any>> = new Map()

  /**
   * @param config - Map of provider names to driver factory functions
   * @param ctx - The current HTTP context
   */
  constructor(
    public config: KnownSocialProviders,
    ctx: HttpContext
  ) {
    this.#ctx = ctx
  }

  /**
   * Find if a provider has been configured.
   */
  has(provider: string): provider is Extract<keyof KnownSocialProviders, string> {
    return provider in this.config
  }

  /**
   * Find if a provider allows local signup.
   */
  allowsLocalSignup(provider: keyof KnownSocialProviders & string): boolean {
    if (!this.has(provider)) {
      throw new E_UNKNOWN_ALLY_PROVIDER([provider])
    }

    const driver = this.use(provider)
    return !driver.config?.disallowLocalSignup
  }

  /**
   * Returns configured provider names.
   */
  configuredProviderNames(): Array<Extract<keyof KnownSocialProviders, string>> {
    return Object.keys(this.config) as Array<Extract<keyof KnownSocialProviders, string>>
  }

  /**
   * Returns provider names that allow local signup.
   */
  signupProviderNames(): Array<Extract<keyof KnownSocialProviders, string>> {
    return this.configuredProviderNames().filter((provider) => this.allowsLocalSignup(provider))
  }

  /**
   * Get a driver instance for the specified social provider. The driver
   * instance is cached for the duration of the HTTP request.
   *
   * @param provider - The name of the social provider (e.g., 'github', 'google')
   *
   * @example
   * ```ts
   * const github = ally.use('github')
   * await github.redirect()
   * ```
   */
  use<SocialProvider extends keyof KnownSocialProviders>(
    provider: SocialProvider,
    options?: AllyManagerUseOptions
  ): ReturnType<KnownSocialProviders[SocialProvider]> {
    if (this.#driversCache.has(provider)) {
      return this.#driversCache.get(provider) as ReturnType<KnownSocialProviders[SocialProvider]>
    }

    if (!this.has(String(provider))) {
      throw new E_UNKNOWN_ALLY_PROVIDER([provider as string])
    }

    const driver = this.config[provider]
    if (options?.intent === 'signup' && !this.allowsLocalSignup(provider as string)) {
      throw new E_LOCAL_SIGNUP_DISALLOWED([provider as string])
    }

    const driverInstance = driver(this.#ctx) as ReturnType<KnownSocialProviders[SocialProvider]>
    this.#driversCache.set(provider, driverInstance)

    return driverInstance
  }
}
