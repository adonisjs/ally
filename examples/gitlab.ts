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
import { gitlab } from '../src/Config'
import { UrlBuilder } from '../src/UrlBuilder'
import { Oauth2Request } from '../src/Spec/Oauth2Request'

dotenv.config()

/**
 * Required config
 */
const CLIENT_ID = process.env.GITLAB_CLIENT_ID!
const CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET!
const BASE_URL = `http://localhost:${process.env.PORT}`
const CALLBACK_URL = `${BASE_URL}/gitlab/callback`

/**
 * Returns the redirect url for the twitter request
 */
async function getRedirectUrl(): Promise<string> {
	const redirectRequest = new UrlBuilder(gitlab.REDIRECT_URL)
	redirectRequest.param('client_id', CLIENT_ID)
	redirectRequest.param('redirect_uri', CALLBACK_URL)
	redirectRequest.param('response_type', 'code')
	redirectRequest.param('scope', 'read_user')
	return redirectRequest.makeUrl()
}

/**
 * Returns the access token for the twitter request
 */
async function getAccessToken(code: string) {
	const requestToken = new Oauth2Request(gitlab.ACCESS_TOKEN_URL, {
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		code: code,
		redirectUri: CALLBACK_URL,
	})
	return requestToken.getAccessToken()
}

createServer(async (req, res) => {
	try {
		if (req.url === '/') {
			res.writeHead(200, { 'content-type': 'text/html' })
			res.end(`<a href="${await getRedirectUrl()}">Login with gitlab</a>`)
		} else {
			const params = parse(url.parse(req.url!).query!)
			const accessToken = await getAccessToken(params.code as string)
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
