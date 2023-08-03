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
import type { AllyDriversList } from './types.js'

/**
 * A global collection of ally drivers.
 */
class AllyDriversCollection {
  async registerBundledDrivers(drivers: Set<keyof AllyDriversList>) {
    if (drivers.has('discord') && !this.list['discord']) {
      const { DiscordDriver } = await import('../src/drivers/discord.js')
      this.extend('discord', (config, ctx) => new DiscordDriver(ctx, config))
    }

    if (drivers.has('facebook') && !this.list['facebook']) {
      const { FacebookDriver } = await import('../src/drivers/facebook.js')
      this.extend('facebook', (config, ctx) => new FacebookDriver(ctx, config))
    }

    if (drivers.has('github') && !this.list['github']) {
      const { GithubDriver } = await import('../src/drivers/github.js')
      this.extend('github', (config, ctx) => new GithubDriver(ctx, config))
    }

    if (drivers.has('google') && !this.list['google']) {
      const { GoogleDriver } = await import('../src/drivers/google.js')
      this.extend('google', (config, ctx) => new GoogleDriver(ctx, config))
    }

    if (drivers.has('linkedin') && !this.list['linkedin']) {
      const { LinkedInDriver } = await import('../src/drivers/linked_in.js')
      this.extend('linkedin', (config, ctx) => new LinkedInDriver(ctx, config))
    }

    if (drivers.has('spotify') && !this.list['spotify']) {
      const { SpotifyDriver } = await import('../src/drivers/spotify.js')
      this.extend('spotify', (config, ctx) => new SpotifyDriver(ctx, config))
    }

    if (drivers.has('twitter') && !this.list['twitter']) {
      const { TwitterDriver } = await import('../src/drivers/twitter.js')
      this.extend('twitter', (config, ctx) => new TwitterDriver(ctx, config))
    }
  }

  /**
   * List of registered drivers
   */
  list: Partial<AllyDriversList> = {}

  /**
   * Extend drivers collection and add a custom
   * driver to it.
   */
  extend<Name extends keyof AllyDriversList>(
    driverName: Name,
    factoryCallback: AllyDriversList[Name]
  ): this {
    this.list[driverName] = factoryCallback
    return this
  }

  /**
   * Creates the driver instance with config
   */
  create<Name extends keyof AllyDriversList>(
    name: Name,
    config: Parameters<AllyDriversList[Name]>[0],
    ctx: HttpContext
  ): ReturnType<AllyDriversList[Name]> {
    const driverFactory = this.list[name]
    if (!driverFactory) {
      throw new RuntimeException(
        `Unknown ally driver "${String(name)}". Make sure the driver is registered`
      )
    }

    return driverFactory(config as any, ctx) as ReturnType<AllyDriversList[Name]>
  }
}

const allyDriversCollection = new AllyDriversCollection()
export default allyDriversCollection
