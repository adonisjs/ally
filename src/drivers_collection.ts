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
import { GithubDriver } from './drivers/github.js'
import { GoogleDriver } from './drivers/google.js'
import { SpotifyDriver } from './drivers/spotify.js'
import { TwitterDriver } from './drivers/twitter.js'
import { DiscordDriver } from './drivers/discord.js'
import { FacebookDriver } from './drivers/facebook.js'
import { LinkedInDriver } from './drivers/linked_in.js'

class AllyDriversCollection {
  /**
   * List of registered drivers
   */
  list: Partial<AllyDriversList> = {
    discord: (config, ctx) => new DiscordDriver(ctx, config),
    facebook: (config, ctx) => new FacebookDriver(ctx, config),
    github: (config, ctx) => new GithubDriver(ctx, config),
    google: (config, ctx) => new GoogleDriver(ctx, config),
    linkedin: (config, ctx) => new LinkedInDriver(ctx, config),
    spotify: (config, ctx) => new SpotifyDriver(ctx, config),
    twitter: (config, ctx) => new TwitterDriver(ctx, config),
  }

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
