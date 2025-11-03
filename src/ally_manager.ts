/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '@adonisjs/core/http'
import { RuntimeException } from '@adonisjs/core/exceptions'
import type { AllyDriverContract, AllyManagerDriverFactory } from './types.ts'

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
    provider: SocialProvider
  ): ReturnType<KnownSocialProviders[SocialProvider]> {
    if (this.#driversCache.has(provider)) {
      return this.#driversCache.get(provider) as ReturnType<KnownSocialProviders[SocialProvider]>
    }

    const driver = this.config[provider]
    if (!driver) {
      throw new RuntimeException(
        `Unknown ally provider "${String(
          provider
        )}". Make sure it is registered inside the config/ally.ts file`
      )
    }

    const driverInstance = driver(this.#ctx) as ReturnType<KnownSocialProviders[SocialProvider]>
    this.#driversCache.set(provider, driverInstance)

    return driverInstance
  }
}
