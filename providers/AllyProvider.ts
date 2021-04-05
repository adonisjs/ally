/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/index.ts" />

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { AllyManager } from '../src/AllyManager'

/**
 * Ally provider to hook into an AdonisJS application
 */
export default class AllyProvider {
	protected static needsApplication = true
	constructor(private application: ApplicationContract) {}

	/**
	 * Register the binding
	 */
	public register() {
		this.application.container.bind('Adonis/Addons/Ally', (container) => {
			const config = container.resolveBinding('Adonis/Core/Config').get('ally', {})
			return new AllyManager(this.application, config)
		})
	}

	/**
	 * Stick an instance to the current HTTP request
	 */
	public boot() {
		this.application.container.withBindings(
			['Adonis/Core/HttpContext', 'Adonis/Addons/Ally'],
			(HttpContext, Ally) => {
				HttpContext.getter(
					'ally',
					function auth() {
						return Ally.getAllyForRequest(this)
					},
					true
				)
			}
		)
	}
}
