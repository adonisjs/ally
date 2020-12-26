/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AllyContract, AllyManagerContract, SocialDriverContract } from '@ioc:Adonis/Addons/Ally'

/**
 * Ally allows constructing drivers for a given HTTP request. Use is the only
 * method we need.
 */
export class Ally implements AllyContract {
	private mappingsCache: Map<string, SocialDriverContract> = new Map()

	constructor(private manager: AllyManagerContract, private ctx: HttpContextContract) {}

	/**
	 * Returns an instance of an ally driver. Driver instances are singleton during
	 * a given HTTP request
	 */
	public use(provider: string) {
		if (!this.mappingsCache.has(provider)) {
			this.mappingsCache.set(provider, this.manager.makeMapping(this.ctx, provider))
		}

		return this.mappingsCache.get(provider)!
	}
}
