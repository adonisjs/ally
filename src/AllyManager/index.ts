/*
 * @adonisjs/core
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
	GoogleDriverConfig,
	GithubDriverConfig,
	AllyManagerContract,
	ExtendDriverCallback,
} from '@ioc:Adonis/Addons/Ally'

import { Ally } from '../Ally'

/**
 * Manages the lifecycle of ally drivers and instantiates new instances
 * for a given HTTP request
 */
export class AllyManager implements AllyManagerContract {
	/**
	 * Extend set of ally driver
	 */
	private extendedDrivers: Map<string, ExtendDriverCallback> = new Map()

	constructor(private application: ApplicationContract, private config: any) {}

	/**
	 * Returns the config for a given mapping from the config file
	 */
	protected getMappingConfig(name: string) {
		const config = this.config[name]

		if (!config) {
			throw new Exception(
				`Missing social provider "${name}". Make sure it is defined inside the "config/ally" file`
			)
		}

		if (!config.driver) {
			throw new Exception(`Missing driver property on social provider "${name}"`)
		}

		return config
	}

	/**
	 * Make the google driver
	 */
	protected makeGoogle(config: GoogleDriverConfig, ctx: HttpContextContract) {
		const { GoogleDriver } = require('../Drivers/Google')
		return new GoogleDriver(config, ctx)
	}

	/**
	 * Make the github driver
	 */
	protected makeGithub(config: GithubDriverConfig, ctx: HttpContextContract) {
		const { GithubDriver } = require('../Drivers/Github')
		return new GithubDriver(config, ctx)
	}

	/**
	 * Makes an instance of the extended driver
	 */
	protected makeExtendedDriver(mapping: string, config: any, ctx: HttpContextContract) {
		const extendedCallback = this.extendedDrivers.get(config.driver)
		if (extendedCallback) {
			return extendedCallback(this.application, mapping, config, ctx)
		}

		throw new Exception(`Unknown ally driver "${config.driver}"`)
	}

	/**
	 * Returns an instance of a mapping
	 */
	protected makeMappingInstance(mapping: string, ctx: HttpContextContract) {
		const config = this.getMappingConfig(mapping)
		switch (config.driver) {
			case 'google':
				return this.makeGoogle(config, ctx)
			case 'github':
				return this.makeGithub(config, ctx)
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
		this.extendedDrivers[driverName] = callback
	}
}
