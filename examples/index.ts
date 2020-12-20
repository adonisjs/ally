import dotenv from 'dotenv'
import { createServer } from 'http'
import { parse } from 'querystring'
import { UrlBuilder } from '../src/UrlBuilder'
import { Oauth1Request } from '../src/Spec/Oauth1Request'

dotenv.config()
console.log(process.env)

const requestTokenUrl = 'https://api.twitter.com/oauth/request_token'
const clientId = process.env.TWITTER_API_KEY!
const clientSecret = process.env.TWITTER_APP_SECRET!

const redirectUrl = 'https://api.twitter.com/oauth/authenticate'
const accessTokenUrl = 'https://api.twitter.com/oauth/access_token'
const callbackUrl = 'http://localhost:3000/twitter/callback'

createServer(async (req, res) => {
	if (req.url === '/') {
		const requestToken = new Oauth1Request(requestTokenUrl, {
			consumerKey: clientId,
			consumerSecret: clientSecret,
		})
		requestToken.oauthParam('oauth_callback', callbackUrl)
		const token = await requestToken.getRequestToken()

		const redirectRequest = new UrlBuilder(redirectUrl)
		redirectRequest.param('oauth_token', token.oauthToken)
		redirectRequest.makeUrl()

		res.writeHead(200, { 'content-type': 'text/html' })
		res.end(`<a href="${redirectRequest.makeUrl()}">Login with twitter</a>`)
	} else {
		const qs = parse(req.url!.split('?')[1]!)

		const requestToken = new Oauth1Request(accessTokenUrl, {
			consumerKey: clientId,
			consumerSecret: clientSecret,
			oAuthToken: qs.oauth_token as string,
		})

		requestToken.oauthParam('oauth_verifier', qs.oauth_verifier)
		const token = await requestToken.getAccessToken()

		res.writeHead(200, { 'content-type': 'application/json' })
		res.end(JSON.stringify(token))
	}
}).listen(3000)
