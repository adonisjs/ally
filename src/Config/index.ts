/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export const twitter = {
	REQUEST_TOKEN_URL: 'https://api.twitter.com/oauth/request_token',
	REDIRECT_URL: 'https://api.twitter.com/oauth/authenticate',
	ACCESS_TOKEN_URL: 'https://api.twitter.com/oauth/access_token',
}

export const github = {
	REDIRECT_URL: 'https://github.com/login/oauth/authorize',
	ACCESS_TOKEN_URL: 'https://github.com/login/oauth/access_token',
}

export const google = {
	REDIRECT_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
	ACCESS_TOKEN_URL: 'https://oauth2.googleapis.com/token',
}

export const gitlab = {
	REDIRECT_URL: 'https://gitlab.com/oauth/authorize',
	ACCESS_TOKEN_URL: 'https://gitlab.com/oauth/token',
}

export const linkedin = {
	REDIRECT_URL: 'https://www.linkedin.com/oauth/v2/authorization',
	ACCESS_TOKEN_URL: 'https://www.linkedin.com/oauth/v2/accessToken',
}
