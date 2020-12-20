/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import nock from 'nock'
import { HttpClient } from '../src/HttpClient'

test.group('HttpClient', () => {
	test('make post request', async (assert) => {
		nock('https://www.foo.com')
			.post('/request')
			.reply(function () {
				return [200, 'Handled']
			})

		const client = new HttpClient('https://www.foo.com/request')
		const response = await client.post()
		assert.equal(response, 'Handled')
	})

	test('send request body', async (assert) => {
		assert.plan(2)

		nock('https://www.foo.com')
			.post('/request')
			.reply(function (_, body) {
				assert.deepEqual(body, 'username=virk')
				return [200, 'Handled']
			})

		const client = new HttpClient('https://www.foo.com/request')
		client.field('username', 'virk')

		const response = await client.post()
		assert.equal(response, 'Handled')
	})

	test('send request body as json', async (assert) => {
		assert.plan(2)

		nock('https://www.foo.com')
			.post('/request')
			.reply(function (_, body) {
				assert.deepEqual(body, { username: 'virk' })
				return [200, 'Handled']
			})

		const client = new HttpClient('https://www.foo.com/request')
		client.field('username', 'virk')
		client.requestType('json')

		const response = await client.post()
		assert.equal(response, 'Handled')
	})

	test('send headers', async (assert) => {
		assert.plan(2)

		nock('https://www.foo.com')
			.post('/request')
			.reply(function () {
				assert.equal(this.req.headers.authorization, 'Bearer foo=bar')
				return [200, 'Handled']
			})

		const client = new HttpClient('https://www.foo.com/request')
		client.header('Authorization', 'Bearer foo=bar')

		const response = await client.post()
		assert.equal(response, 'Handled')
	})

	test('send query params', async (assert) => {
		assert.plan(2)

		nock('https://www.foo.com')
			.post('/request')
			.reply(function () {
				assert.equal(this.req.headers.authorization, 'Bearer foo=bar')
				return [200, 'Handled']
			})

		const client = new HttpClient('https://www.foo.com/request')
		client.header('Authorization', 'Bearer foo=bar')

		const response = await client.post()
		assert.equal(response, 'Handled')
	})

	test('parse response as json', async (assert) => {
		assert.plan(2)

		nock('https://www.foo.com')
			.post('/request')
			.reply(function (_, body) {
				assert.deepEqual(body, { username: 'virk' })
				return [200, { username: 'virk' }]
			})

		const client = new HttpClient('https://www.foo.com/request')
		client.field('username', 'virk')
		client.requestType('json')
		client.parseResponseAs('json')

		const response = await client.post()
		assert.deepEqual(response, { username: 'virk' })
	})

	test('get response as buffer', async (assert) => {
		nock('https://www.foo.com')
			.get('/request')
			.reply(function () {
				return [200, 'Handled']
			})

		const client = new HttpClient('https://www.foo.com/request')
		const response = await client.parseResponseAs('buffer').get()
		assert.equal(response.toString('utf-8'), 'Handled')
	})
})
