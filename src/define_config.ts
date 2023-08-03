/*
 * @adonisjs/ally
 *
 * (c) Ally
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '@adonisjs/core/http'

import type { AllyDriversList } from './types.js'
import allyDriversCollection from './drivers_collection.js'

/**
 * Define config for the ally
 */
export function defineConfig<
  KnownSocialProviders extends Record<
    string,
    {
      [K in keyof AllyDriversList]: { driver: K } & Parameters<AllyDriversList[K]>[0]
    }[keyof AllyDriversList]
  >,
>(
  config: KnownSocialProviders
): {
  services: {
    [K in keyof KnownSocialProviders]: (
      ctx: HttpContext
    ) => ReturnType<AllyDriversList[KnownSocialProviders[K]['driver']]>
  }
  driversInUse: Set<keyof AllyDriversList>
} {
  /**
   * Converting user defined config to an object of services
   * that can be injected into the AllyManager class
   */
  const driversInUse: Set<keyof AllyDriversList> = new Set()

  const services = Object.keys(config).reduce(
    (result, provider: keyof KnownSocialProviders) => {
      const providerConfig = config[provider]
      driversInUse.add(providerConfig.driver)

      result[provider] = (ctx: HttpContext) => {
        return allyDriversCollection.create<KnownSocialProviders[typeof provider]['driver']>(
          providerConfig.driver,
          providerConfig,
          ctx
        )
      }
      return result
    },
    {} as {
      [K in keyof KnownSocialProviders]: (
        ctx: HttpContext
      ) => ReturnType<AllyDriversList[KnownSocialProviders[K]['driver']]>
    }
  )

  return {
    services,
    driversInUse,
  }
}
