/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { string } from '@poppinss/utils/build/helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Manages and verifies the state set during Oauth request lifecycle
 */
export class StateManager {
	private existingState?: string

	constructor(
		private identifier: string,
		private queryStringName: string,
		private ctx: HttpContextContract
	) {
		this.existingState = this.ctx.request.cookie(this.identifier)
		this.ctx.response.clearCookie(this.identifier)
	}

	/**
	 * Set state inside cookie
	 */
	public setState(): string {
		const state = string.generateRandom(32)
		this.ctx.response.cookie(this.identifier, state, {
			sameSite: false,
			maxAge: '30min',
		})

		return state
	}

	/**
	 * Returns a boolean telling if state has a mis-match
	 */
	public stateMisMatch(): boolean {
		return (
			!this.existingState || this.existingState !== this.ctx.request.input(this.queryStringName)
		)
	}
}
