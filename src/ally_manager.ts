/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils'
import type { HttpContext } from '@adonisjs/core/http'
import type { AllyDriverContract, AllyManagerDriverFactory } from './types.js'

/**
 * AllyManager is used to create instances of a social drivers during an
 * HTTP request. The drivers are cached during the lifecycle of a request.
 */
export class AllyManager<KnownSocialProviders extends Record<string, AllyManagerDriverFactory>> {
  /**
   * Config with the list of social providers
   */
  #config: KnownSocialProviders
  #ctx: HttpContext
  #driversCache: Map<keyof KnownSocialProviders, AllyDriverContract<any, any>> = new Map()

  constructor(config: KnownSocialProviders, ctx: HttpContext) {
    this.#ctx = ctx
    this.#config = config
  }

  /**
   * Returns the driver instance of a social provider
   */
  use<SocialProvider extends keyof KnownSocialProviders>(
    provider: SocialProvider
  ): ReturnType<KnownSocialProviders[SocialProvider]> {
    if (this.#driversCache.has(provider)) {
      return this.#driversCache.get(provider) as ReturnType<KnownSocialProviders[SocialProvider]>
    }

    const driver = this.#config[provider]
    if (!driver) {
      throw new RuntimeException(
        `Unknown ally provider "${String(
          provider
        )}". Make sure it is registered inside the config/ally.ts file`
      )
    }

    return driver(this.#ctx) as ReturnType<KnownSocialProviders[SocialProvider]>
  }
}
