/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Route from '@ioc:Adonis/Core/Route'

Route.get('/github', async ({ response }) => {
	return response.send('<a href="/github/redirect"> Login with Github </a>')
})

Route.get('/github/redirect', async ({ ally }) => {
	return ally.use('github').redirect((config) => {
		config.allowSignup(true)
	})
})

Route.get('/github/callback', async ({ ally, request }) => {
	console.log(request.cookiesList())

	try {
		const driver = ally.use('github')
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
