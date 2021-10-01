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
  AUTHORIZE_URL: 'https://api.twitter.com/oauth/authenticate',
  ACCESS_TOKEN_URL: 'https://api.twitter.com/oauth/access_token',
}

export const github = {
  AUTHORIZE_URL: 'https://github.com/login/oauth/authorize',
  ACCESS_TOKEN_URL: 'https://github.com/login/oauth/access_token',
  USER_INFO_URL: 'https://api.github.com/user',
  USER_EMAIL_URL: 'https://api.github.com/user/emails',
}

export const google = {
  AUTHORIZE_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  ACCESS_TOKEN_URL: 'https://oauth2.googleapis.com/token',
  USER_INFO_URL: 'https://www.googleapis.com/oauth2/v3/userinfo',
}

export const gitlab = {
  AUTHORIZE_URL: 'https://gitlab.com/oauth/authorize',
  ACCESS_TOKEN_URL: 'https://gitlab.com/oauth/token',
}

export const linkedin = {
  AUTHORIZE_URL: 'https://www.linkedin.com/oauth/v2/authorization',
  ACCESS_TOKEN_URL: 'https://www.linkedin.com/oauth/v2/accessToken',
}

export const patreon = {
  AUTHORIZE_URL: 'https://www.patreon.com/oauth2/authorize',
  ACCESS_TOKEN_URL: 'https://www.patreon.com/api/oauth2/token',
}

export const discord = {
  AUTHORIZE_URL: 'https://discord.com/api/oauth2/authorize',
  ACCESS_TOKEN_URL: 'https://discord.com/api/oauth2/token',
  USER_INFO_URL: 'https://discord.com/api/users/@me',
}

export const microsoft = {
  AUTHORIZE_URL: 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize',
  ACCESS_TOKEN_URL: 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token',
}

export const bitbucket = {
  AUTHORIZE_URL: 'https://bitbucket.org/site/oauth2/authorize',
  ACCESS_TOKEN_URL: 'https://bitbucket.org/site/oauth2/access_token',
}

export const facebook = {
  AUTHORIZE_URL: 'https://www.facebook.com/v10.0/dialog/oauth',
  ACCESS_TOKEN_URL: 'https://graph.facebook.com/v10.0/dialog/oauth/access_token',
}

export const spotify = {
  AUTHORIZE_URL: 'https://accounts.spotify.com/authorize',
  ACCESS_TOKEN_URL: 'https://accounts.spotify.com/api/token',
  USER_INFO_URL: 'https://api.spotify.com/v1/me',
}

export const twitch = {
  AUTHORIZE_URL: 'https://id.twitch.tv/oauth2/authorize',
  ACCESS_TOKEN_URL: 'https://id.twitch.tv/oauth2/token',
  USER_INFO_URL: 'https://api.twitch.tv/helix/users',
}
