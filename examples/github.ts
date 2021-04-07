/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Route from '@ioc:Adonis/Core/Route'
import Config from '@ioc:Adonis/Core/Config'
import { GithubDriver } from '../src/Drivers/Github'

Route.get('/github', async ({ response }) => {
	return response.send('<a href="/github/redirect"> Login with Github </a>')
})

Route.get('/github/redirect', async (ctx) => {
	return new GithubDriver(ctx, Config.get('ally.github')).redirect((request) => {
		request.scopes(['admin:org', 'delete_repo', 'repo', 'user'])
	})
})

Route.get('/github/callback', async (ctx) => {
	console.log(ctx.request.cookiesList())

	try {
		const driver = new GithubDriver(ctx, Config.get('ally.github'))
		if (driver.accessDenied()) {
			return 'Access was denied'
		}

		if (driver.stateMisMatch()) {
			return 'Request expired. Retry again'
		}

		if (driver.hasError()) {
			return 'There was an error'
		}

		const user = await driver.getUser()
		return user
	} catch (error) {
		console.log({ error: error.response })
		throw error
	}
})
