/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  AllyContract,
  SocialProviders,
  GithubDriverConfig,
  AllyManagerContract,
  ExtendDriverCallback,
  DiscordDriverConfig,
  TwitterDriverConfig,
  GoogleDriverConfig,
  LinkedInDriverConfig,
  FacebookDriverConfig,
  SpotifyDriverConfig,
  TwitchDriverConfig,
} from '@ioc:Adonis/Addons/Ally'

import { Ally } from '../Ally'

/**
 * Manages the lifecycle of ally drivers and instantiates new instances
 * for a given HTTP request
 */
export class AllyManager implements AllyManagerContract {
  /**
   * Extended set of ally drivers
   */
  private extendedDrivers: Map<string, ExtendDriverCallback> = new Map()

  constructor(public application: ApplicationContract, private config: any) {}

  /**
   * Returns the config for a given mapping from the config file
   */
  protected getMappingConfig(name: string) {
    const config = this.config[name]

    if (!config) {
      throw new Exception(
        `Missing config for social provider "${name}". Make sure it is defined inside the "config/ally" file`
      )
    }

    if (!config.driver) {
      throw new Exception(`Missing driver property on "${name}" provider config`)
    }

    return config
  }

  /**
   * Make the discord driver
   */
  protected makeDiscord(config: DiscordDriverConfig, ctx: HttpContextContract) {
    const { DiscordDriver } = require('../Drivers/Discord')
    return new DiscordDriver(ctx, config)
  }

  /**
   * Make the github driver
   */
  protected makeGithub(config: GithubDriverConfig, ctx: HttpContextContract) {
    const { GithubDriver } = require('../Drivers/Github')
    return new GithubDriver(ctx, config)
  }

  /**
   * Make the twitter driver
   */
  protected makeTwitter(config: TwitterDriverConfig, ctx: HttpContextContract) {
    const { TwitterDriver } = require('../Drivers/Twitter')
    return new TwitterDriver(ctx, config)
  }

  /**
   * Make the google driver
   */
  protected makeGoogle(config: GoogleDriverConfig, ctx: HttpContextContract) {
    const { GoogleDriver } = require('../Drivers/Google')
    return new GoogleDriver(ctx, config)
  }

  /**
   * Make the linkedin driver
   */
  protected makeLinkedIn(config: LinkedInDriverConfig, ctx: HttpContextContract) {
    const { LinkedInDriver } = require('../Drivers/LinkedIn')
    return new LinkedInDriver(ctx, config)
  }

  /**
   * Make the facebook driver
   */
  protected makeFacebook(config: FacebookDriverConfig, ctx: HttpContextContract) {
    const { FacebookDriver } = require('../Drivers/Facebook')
    return new FacebookDriver(ctx, config)
  }

  /**
   * Make the spotify driver
   */

  protected makeSpotify(config: SpotifyDriverConfig, ctx: HttpContextContract) {
    const { SpotifyDriver } = require('../Drivers/Spotify')
    return new SpotifyDriver(ctx, config)
  }

  /**
   * Make the twitch driver
   */

  protected makeTwitch(config: TwitchDriverConfig, ctx: HttpContextContract) {
    const { TwitchDriver } = require('../Drivers/Twitch')
    return new TwitchDriver(ctx, config)
  }

  /**
   * Makes an instance of the extended driver
   */
  protected makeExtendedDriver(mapping: string, config: any, ctx: HttpContextContract) {
    const extendedCallback = this.extendedDrivers.get(config.driver)
    if (typeof extendedCallback === 'function') {
      return extendedCallback(this, mapping, config, ctx)
    }

    throw new Exception(`Unknown ally driver "${config.driver}"`)
  }

  /**
   * Returns an instance of a mapping
   */
  protected makeMappingInstance(mapping: string, ctx: HttpContextContract) {
    const config = this.getMappingConfig(mapping)
    switch (config.driver) {
      case 'discord':
        return this.makeDiscord(config, ctx)
      case 'github':
        return this.makeGithub(config, ctx)
      case 'twitter':
        return this.makeTwitter(config, ctx)
      case 'google':
        return this.makeGoogle(config, ctx)
      case 'linkedin':
        return this.makeLinkedIn(config, ctx)
      case 'facebook':
        return this.makeFacebook(config, ctx)
      case 'spotify':
        return this.makeSpotify(config, ctx)
      case 'twitch':
        return this.makeTwitch(config, ctx)
      default:
        return this.makeExtendedDriver(mapping, config, ctx)
    }
  }

  /**
   * Makes an instance of a given mapping
   */
  public makeMapping(ctx: HttpContextContract, mapping: keyof SocialProviders) {
    return this.makeMappingInstance(mapping, ctx)
  }

  /**
   * Returns an instance of ally, which can be later used to
   * get instances of social providers for a given request
   */
  public getAllyForRequest(ctx: HttpContextContract): AllyContract {
    return new Ally(this, ctx)
  }

  /**
   * Add a new custom ally driver
   */
  public extend(driverName: string, callback: ExtendDriverCallback): void {
    if (typeof callback !== 'function') {
      throw new Exception('"Ally.extend" expects callback to be a function')
    }

    this.extendedDrivers.set(driverName, callback)
  }
}
