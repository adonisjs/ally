/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import url from 'url'
import dotenv from 'dotenv'
import { parse } from 'querystring'
import { createServer } from 'http'
import { twitter } from '../src/Config'
import { UrlBuilder } from '../src/UrlBuilder'
import { Oauth1Request } from '../src/Spec/Oauth1Request'

dotenv.config()

/**
 * Required config
 */
const CLIENT_ID = process.env.TWITTER_API_KEY!
const CLIENT_SECRET = process.env.TWITTER_APP_SECRET!
const BASE_URL = `http://localhost:${process.env.PORT}`
const CALLBACK_URL = `${BASE_URL}/twitter/callback`

/**
 * Returns the redirect url for the twitter request
 */
async function getRedirectUrl(): Promise<string> {
	const requestToken = new Oauth1Request(twitter.REQUEST_TOKEN_URL, {
		consumerKey: CLIENT_ID,
		consumerSecret: CLIENT_SECRET,
	})
	requestToken.oauthParam('oauth_callback', CALLBACK_URL)
	const token = await requestToken.getRequestToken()

	const redirectRequest = new UrlBuilder(twitter.AUTHORIZE_URL)
	redirectRequest.param('oauth_token', token.oauthToken)
	return redirectRequest.makeUrl()
}

/**
 * Returns the access token for the twitter request
 */
async function getAccessToken(oauthToken: string, oauthVerifier: string) {
	const requestToken = new Oauth1Request(twitter.ACCESS_TOKEN_URL, {
		consumerKey: CLIENT_ID,
		consumerSecret: CLIENT_SECRET,
		oauthToken,
	})
	requestToken.oauthParam('oauth_verifier', oauthVerifier)
	return requestToken.getAccessToken()
}

createServer(async (req, res) => {
	try {
		if (req.url === '/') {
			res.writeHead(200, { 'content-type': 'text/html' })
			res.end(`<a href="${await getRedirectUrl()}">Login with twitter</a>`)
		} else {
			const params = parse(url.parse(req.url!).query!)
			const accessToken = await getAccessToken(
				params.oauth_token as string,
				params.oauth_verifier as string
			)
			res.writeHead(200, { 'content-type': 'application/json' })
			res.end(JSON.stringify(accessToken))
		}
	} catch (error) {
		res.writeHead(500, { 'content-type': 'application/json' })
		console.log({ error })
		res.end(error.response ? JSON.stringify(error.response.body) : error.message)
	}
}).listen(process.env.PORT!, () => {
	console.log(`Listening on ${BASE_URL}`)
})
