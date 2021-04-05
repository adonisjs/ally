/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Route from '@ioc:Adonis/Core/Route'

Route.get('/google', async ({ response }) => {
	return response.send('<a href="/google/redirect"> Login with Google </a>')
})

Route.get('/google/redirect', async ({ ally }) => {
	return ally.use('google').redirect((request) => {
		request
			.prompt('consent')
			.accessType('offline')
			.scopes(['calendar.events', 'userinfo.email', 'userinfo.profile'])
			.hostedDomain('adonisjs.com')
	})
})

Route.get('/google/callback', async ({ request, ally }) => {
	console.log(request.cookiesList())

	const driver = ally.use('google')
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
})
