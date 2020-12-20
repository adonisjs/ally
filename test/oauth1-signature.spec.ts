/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Oauth1Signature } from '../src/Spec/Oauth1Signature'

test.group('Oauth1Signature', () => {
	test('create signature for the oauth1 request token', (assert) => {
		const timestamp = 1582326295

		const { oauthParams, params, signature, oauthHeader } = new Oauth1Signature({
			nonce: '123456',
			consumerKey: 'a-sample-oauth-key',
			consumerSecret: 'a-sample-oauth-secret',
			method: 'POST',
			url: 'http://example.com/wp-json/wp/v2/posts',
			unixTimestamp: timestamp,
		}).generate()

		assert.deepEqual(oauthParams, {
			oauth_signature: '1yZxHeatgLgRvfgk3gXo8DbYHC0=',
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.deepEqual(params, {
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.equal(
			oauthHeader,
			'oauth_consumer_key="a-sample-oauth-key",oauth_nonce="123456",oauth_signature="1yZxHeatgLgRvfgk3gXo8DbYHC0%3D",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1582326295",oauth_version="1.0"'
		)
		assert.equal(signature, '1yZxHeatgLgRvfgk3gXo8DbYHC0=')
	})

	test('do not add non "oauth_" tokens to the oauthParams', (assert) => {
		const timestamp = 1582326295

		const { oauthParams, params, signature, oauthHeader } = new Oauth1Signature({
			nonce: '123456',
			consumerKey: 'a-sample-oauth-key',
			consumerSecret: 'a-sample-oauth-secret',
			method: 'POST',
			url: 'http://example.com/wp-json/wp/v2/posts',
			unixTimestamp: timestamp,
			params: {
				name: 'foo',
			},
		}).generate()

		assert.deepEqual(oauthParams, {
			oauth_signature: 'Pn2gu172CDNq2Isq56jOzWyUX9Y=',
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.deepEqual(params, {
			name: 'foo',
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.equal(
			oauthHeader,
			'oauth_consumer_key="a-sample-oauth-key",oauth_nonce="123456",oauth_signature="Pn2gu172CDNq2Isq56jOzWyUX9Y%3D",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1582326295",oauth_version="1.0"'
		)
		assert.equal(signature, 'Pn2gu172CDNq2Isq56jOzWyUX9Y=')
	})

	test('allow extra oauth_ values', (assert) => {
		const timestamp = 1582326295

		const { oauthParams, params, signature, oauthHeader } = new Oauth1Signature({
			nonce: '123456',
			consumerKey: 'a-sample-oauth-key',
			consumerSecret: 'a-sample-oauth-secret',
			method: 'POST',
			url: 'http://example.com/wp-json/wp/v2/posts',
			unixTimestamp: timestamp,
			params: {
				oauth_callback: 'http://localhost:3000',
			},
		}).generate()

		assert.deepEqual(oauthParams, {
			oauth_callback: 'http://localhost:3000',
			oauth_signature: 'O1NuGi8umAwm2EQnF7XwlWUBHnc=',
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.deepEqual(params, {
			oauth_callback: 'http://localhost:3000',
			oauth_consumer_key: 'a-sample-oauth-key',
			oauth_nonce: '123456',
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_version: '1.0',
		})

		assert.equal(
			oauthHeader,
			'oauth_callback="http%3A%2F%2Flocalhost%3A3000",oauth_consumer_key="a-sample-oauth-key",oauth_nonce="123456",oauth_signature="O1NuGi8umAwm2EQnF7XwlWUBHnc%3D",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1582326295",oauth_version="1.0"'
		)
		assert.equal(signature, 'O1NuGi8umAwm2EQnF7XwlWUBHnc=')
	})
})
