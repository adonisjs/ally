/**
 * Created by Raphson on 1/4/17.
 */
'use strict'

/*
 * adonis-ally
 *
 * (c) Ayeni Olusegun <nsegun5@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const CE = require('../Exceptions')
const OAuth2Scheme = require('../Schemes/OAuth2')
const AllyUser = require('../AllyUser')
const got = require('got')
const utils = require('../../lib/utils')
const _ = utils.mixLodash(require('lodash'))

class Bitbucket extends OAuth2Scheme {

    constructor (Config) {
        const config = Config.get('services.ally.bitbucket')

        if (!_.hasAll(config, ['clientId', 'clientSecret', 'redirectUri'])) {
            throw CE.OAuthException.missingConfig('bitbucket')
        }

        super(config.clientId, config.clientSecret, config.headers)

        /**
         * Oauth specific values to be used when creating the redirect
         * url or fetching user profile.
         */
        this._redirectUri = config.redirectUri
        this._redirectUriOptions = _.merge({response_type: 'code'}, config.options)
    }

    /**
     * Injections to be made by the IoC container
     *
     * @return {Array}
     */
    static get inject () {
        return ['Adonis/Src/Config']
    }

    /**
     * Scope seperator for seperating multiple
     * scopes.
     *
     * @return {String}
     */
    get scopeSeperator () {
        return ' '
    }

    /**
     * Base url to be used for constructing
     * bitbucket oauth urls.
     *
     * @return {String}
     */
    get baseUrl () {
        return 'https://bitbucket.org/site/'
    }

    /**
     * Relative url to be used for redirecting
     * user.
     *
     * @return {String} [description]
     */
    get authorizeUrl () {
        return 'oauth2/authorize'
    }

    /**
     * Relative url to be used for exchanging
     * access token.
     *
     * @return {String}
     */
    get accessTokenUrl () {
        return 'oauth2/access_token'
    }

    /**
     * Returns the user profile as an object using the
     * access token
     *
     * @param   {String} accessToken
     *
     * @return  {Object}
     *
     * @private
     */
    * _getUserProfile (accessToken) {
        const profileUrl = `https://bitbucket.org/api/1.0/user?access_token=${accessToken}`
        const response = yield got(profileUrl, {
            headers: {
                'Accept': 'application/json'
            },
            json: true
        })
        return response.body
    }

    /**
     * Returns the redirect url for a given provider.
     *
     * @param  {Array} scope
     *
     * @return {String}
     */
    * getRedirectUrl () {
        return this.getUrl(this._redirectUri, null, this._redirectUriOptions)
    }

    /**
     * Parses the redirect errors returned by facebook
     * and returns the error message.
     *
     * @param  {Object} queryParams
     *
     * @return {String}
     */
    parseRedirectError (queryParams) {
        return queryParams.error_description || queryParams.error || 'Oauth failed during redirect'
    }

    /**
     * Returns the user profile with it's access token, refresh token
     * and token expiry
     *
     * @param {Object} queryParams
     *
     * @return {Object}
     */
    * getUser (queryParams) {
        const code = queryParams.code

        /**
         * Throw an exception when query string does not have
         * code.
         */
        if (!code) {
            const errorMessage = this.parseRedirectError(queryParams)
            throw CE.OAuthException.tokenExchangeException(errorMessage, null, errorMessage)
        }

        const accessTokenResponse = yield this.getAccessToken(code, this._redirectUri, {
            grant_type: 'authorization_code'
        })
        const userProfile = yield this._getUserProfile(accessTokenResponse.accessToken)
        const user = new AllyUser()
        user
            .setOriginal(userProfile)
            .setFields(
                userProfile.user.username,
                userProfile.user.display_name,
                null,
                userProfile.user.username,
                userProfile.user.avatar
            )
            .setToken(
                accessTokenResponse.accessToken,
                accessTokenResponse.refreshToken,
                null,
                Number(_.get(accessTokenResponse, 'result.expires_in'))
            )

        return user
    }
}

module.exports = Bitbucket