/*
 * @adonisjs/ally
 *
 * (c) Ally
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { configProvider } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { ConfigProvider } from '@adonisjs/core/types'

import type { GoogleDriver } from './drivers/google.ts'
import type { GithubDriver } from './drivers/github.ts'
import type { SpotifyDriver } from './drivers/spotify.ts'
import type { TwitterDriver } from './drivers/twitter.ts'
import type { TwitterXDriver } from './drivers/twitter_x.ts'
import type { DiscordDriver } from './drivers/discord.ts'
import type { FacebookDriver } from './drivers/facebook.ts'
import type { LinkedInDriver } from './drivers/linked_in.ts'
import type { LinkedInOpenidConnectDriver } from './drivers/linked_in_openid_connect.ts'
import type {
  GoogleDriverConfig,
  GithubDriverConfig,
  SpotifyDriverConfig,
  DiscordDriverConfig,
  TwitterDriverConfig,
  TwitterXDriverConfig,
  LinkedInDriverConfig,
  LinkedInOpenidConnectDriverConfig,
  FacebookDriverConfig,
  AllyManagerDriverFactory,
} from './types.ts'

/**
 * Shape of config after it has been resolved from
 * the config provider
 *
 * Maps config providers to their resolved driver factory values.
 */
type ResolvedConfig<
  KnownSocialProviders extends Record<
    string,
    AllyManagerDriverFactory | ConfigProvider<AllyManagerDriverFactory>
  >,
> = {
  [K in keyof KnownSocialProviders]: KnownSocialProviders[K] extends ConfigProvider<infer A>
    ? A
    : KnownSocialProviders[K]
}

/**
 * Define configuration for Ally social authentication providers.
 * This function accepts a map of provider names to their factory
 * functions or config providers.
 *
 * @param config - An object mapping provider names to driver factories
 * @returns A config provider that resolves all registered providers.
 *
 * @example
 * ```ts
 * export default defineConfig({
 *   github: services.github({
 *     clientId: env.get('GITHUB_CLIENT_ID'),
 *     clientSecret: env.get('GITHUB_CLIENT_SECRET'),
 *     callbackUrl: 'http://localhost:3333/github/callback'
 *   }),
 *   google: services.google({
 *     clientId: env.get('GOOGLE_CLIENT_ID'),
 *     clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
 *     callbackUrl: 'http://localhost:3333/google/callback'
 *   })
 * })
 * ```
 */
export function defineConfig<
  KnownSocialProviders extends Record<
    string,
    AllyManagerDriverFactory | ConfigProvider<AllyManagerDriverFactory>
  >,
>(config: KnownSocialProviders): ConfigProvider<ResolvedConfig<KnownSocialProviders>> {
  return configProvider.create(async (app) => {
    const serviceNames = Object.keys(config)
    const services = {} as Record<string, AllyManagerDriverFactory>

    for (let serviceName of serviceNames) {
      const service = config[serviceName]
      if (typeof service === 'function') {
        services[serviceName] = service
      } else {
        services[serviceName] = await service.resolver(app)
      }
    }

    return services as ResolvedConfig<KnownSocialProviders>
  })
}

/**
 * Pre-configured helpers for setting up built-in social authentication
 * providers. Each method accepts provider-specific configuration and
 * returns a config provider that lazily loads and instantiates the driver.
 *
 * @example
 * ```ts
 * const github = services.github({
 *   clientId: env.get('GITHUB_CLIENT_ID'),
 *   clientSecret: env.get('GITHUB_CLIENT_SECRET'),
 *   callbackUrl: 'http://localhost:3333/github/callback',
 *   disallowLocalSignup: true,
 * })
 * ```
 *
 * @example
 * ```ts
 * export default defineConfig({
 *   github: services.github({
 *     clientId: env.get('GITHUB_CLIENT_ID'),
 *     clientSecret: env.get('GITHUB_CLIENT_SECRET'),
 *     callbackUrl: 'http://localhost:3333/github/callback',
 *     scopes: ['user', 'user:email']
 *   })
 * })
 * ```
 */
export const services: {
  discord: (config: DiscordDriverConfig) => ConfigProvider<(ctx: HttpContext) => DiscordDriver>
  facebook: (config: FacebookDriverConfig) => ConfigProvider<(ctx: HttpContext) => FacebookDriver>
  github: (config: GithubDriverConfig) => ConfigProvider<(ctx: HttpContext) => GithubDriver>
  google: (config: GoogleDriverConfig) => ConfigProvider<(ctx: HttpContext) => GoogleDriver>
  linkedin: (config: LinkedInDriverConfig) => ConfigProvider<(ctx: HttpContext) => LinkedInDriver>
  linkedinOpenidConnect: (
    config: LinkedInOpenidConnectDriverConfig
  ) => ConfigProvider<(ctx: HttpContext) => LinkedInOpenidConnectDriver>
  spotify: (config: SpotifyDriverConfig) => ConfigProvider<(ctx: HttpContext) => SpotifyDriver>
  twitter: (config: TwitterDriverConfig) => ConfigProvider<(ctx: HttpContext) => TwitterDriver>
  twitterX: (config: TwitterXDriverConfig) => ConfigProvider<(ctx: HttpContext) => TwitterXDriver>
} = {
  /**
   * Create a config provider for the Discord OAuth2 driver.
   *
   * @param config - Discord driver configuration.
   * @returns A lazily resolved config provider for the Discord driver.
   */
  discord(config) {
    return configProvider.create(async () => {
      const { DiscordDriver } = await import('./drivers/discord.js')
      return (ctx) => new DiscordDriver(ctx, config)
    })
  },
  /**
   * Create a config provider for the Facebook OAuth2 driver.
   *
   * @param config - Facebook driver configuration.
   * @returns A lazily resolved config provider for the Facebook driver.
   */
  facebook(config) {
    return configProvider.create(async () => {
      const { FacebookDriver } = await import('./drivers/facebook.js')
      return (ctx) => new FacebookDriver(ctx, config)
    })
  },
  /**
   * Create a config provider for the GitHub OAuth2 driver.
   *
   * @param config - GitHub driver configuration.
   * @returns A lazily resolved config provider for the GitHub driver.
   */
  github(config) {
    return configProvider.create(async () => {
      const { GithubDriver } = await import('./drivers/github.js')
      return (ctx) => new GithubDriver(ctx, config)
    })
  },
  /**
   * Create a config provider for the Google OAuth2 driver.
   *
   * @param config - Google driver configuration.
   * @returns A lazily resolved config provider for the Google driver.
   */
  google(config) {
    return configProvider.create(async () => {
      const { GoogleDriver } = await import('./drivers/google.js')
      return (ctx) => new GoogleDriver(ctx, config)
    })
  },
  /**
   * Create a config provider for the LinkedIn OAuth2 driver.
   *
   * @param config - LinkedIn driver configuration.
   * @returns A lazily resolved config provider for the LinkedIn driver.
   */
  linkedin(config) {
    return configProvider.create(async () => {
      const { LinkedInDriver } = await import('./drivers/linked_in.js')
      return (ctx) => new LinkedInDriver(ctx, config)
    })
  },
  /**
   * Create a config provider for the LinkedIn OpenID Connect driver.
   *
   * @param config - LinkedIn OpenID Connect driver configuration.
   * @returns A lazily resolved config provider for the LinkedIn OpenID Connect driver.
   */
  linkedinOpenidConnect(config) {
    return configProvider.create(async () => {
      const { LinkedInOpenidConnectDriver } = await import('./drivers/linked_in_openid_connect.js')
      return (ctx) => new LinkedInOpenidConnectDriver(ctx, config)
    })
  },
  /**
   * Create a config provider for the Spotify OAuth2 driver.
   *
   * @param config - Spotify driver configuration.
   * @returns A lazily resolved config provider for the Spotify driver.
   */
  spotify(config) {
    return configProvider.create(async () => {
      const { SpotifyDriver } = await import('./drivers/spotify.js')
      return (ctx) => new SpotifyDriver(ctx, config)
    })
  },
  /**
   * Create a config provider for the Twitter OAuth1 driver.
   *
   * @param config - Twitter driver configuration.
   * @returns A lazily resolved config provider for the Twitter driver.
   */
  twitter(config) {
    return configProvider.create(async () => {
      const { TwitterDriver } = await import('./drivers/twitter.js')
      return (ctx) => new TwitterDriver(ctx, config)
    })
  },
  /**
   * Create a config provider for the X OAuth2 driver.
   *
   * @param config - X driver configuration.
   * @returns A lazily resolved config provider for the X driver.
   */
  twitterX(config) {
    return configProvider.create(async () => {
      const { TwitterXDriver } = await import('./drivers/twitter_x.js')
      return (ctx) => new TwitterXDriver(ctx, config)
    })
  },
}
