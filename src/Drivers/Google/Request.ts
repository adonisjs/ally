/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../../adonis-typings/index.ts" />

import {
	GoogleScopes,
	GoogleDriverConfig,
	GoogleRedirectRequestContract,
} from '@ioc:Adonis/Addons/Ally'

import { google } from '../../Config'
import { UrlBuilder } from '../../UrlBuilder'

/**
 * The prefix to add for the given scopes. Google needs
 * the complete url.
 */
const SCOPE_PREFIXES = {
	'https://www.googleapis.com/auth': [
		'userinfo.email',
		'userinfo.profile',
		'contacts',
		'contacts.other.readonly',
		'contacts.readonly',
		'directory.readonly',
		'user.addresses.read',
		'user.birthday.read',
		'user.emails.read',
		'user.gender.read',
		'user.organization.read',
		'user.phonenumbers.read',
		'analytics',
		'analytics.readonly',
		'documents',
		'documents.readonly',
		'forms',
		'forms.currentonly',
		'groups',
		'spreadsheets',
		'calendar',
		'calendar.events',
		'calendar.events.readonly',
		'calendar.readonly',
		'calendar.settings.readonly',
		'drive',
		'drive.appdata',
		'drive.file',
		'drive.metadata',
		'drive.metadata.readonly',
		'drive.photos.readonly',
		'drive.readonly',
		'drive.scripts',
	],
}

/**
 * The redirect request instance for google driver
 */
export class GoogleRedirectRequest implements GoogleRedirectRequestContract {
	private urlBuilder = new UrlBuilder(this.config.authorizeUrl || google.AUTHORIZE_URL)

	/**
	 * Reference to the params
	 */
	public get params() {
		return this.urlBuilder.params
	}

	constructor(private config: GoogleDriverConfig) {
		this.defineBaseParams()
		this.defineConditionalParams()
	}

	/**
	 * Define the base (always required) params from the config
	 */
	private defineBaseParams() {
		this.param('client_id', this.config.clientId)
		this.param('redirect_uri', this.config.callbackUrl)
		this.param('response_type', 'code')
		this.scopes(this.config.scopes || ['userinfo.email', 'userinfo.profile'])
	}

	/**
	 * Define the conditional params from the config
	 */
	private defineConditionalParams() {
		this.config.accessType && this.accessType(this.config.accessType)
		this.config.prompt && this.prompt(this.config.prompt)
		this.config.hostedDomain && this.hostedDomain(this.config.hostedDomain)
		this.config.display && this.display(this.config.display)
	}

	/**
	 * Define scopes to accept. Otherwise one defined inside the config
	 * will be used
	 */
	public scopes(scopes: GoogleScopes[] | string[]): this {
		this.urlBuilder.param(
			'scope',
			scopes
				.map((name) => {
					const prefix = Object.keys(SCOPE_PREFIXES).find((one) => {
						return SCOPE_PREFIXES[one].includes(name)
					})
					return prefix ? `${prefix}/${name}` : name
				})
				.join(' ')
		)
		return this
	}

	/**
	 * Define the access type. Otherwise one defined inside the config will
	 * be used
	 */
	public accessType(type: 'offline' | 'online'): this {
		this.urlBuilder.param('access_type', type)
		return this
	}

	/**
	 * Define if you want to include the list of granted scopes. Recommended
	 */
	public includeGrantedScopes(): this {
		this.urlBuilder.param('include_granted_scopes', true)
		return this
	}

	/**
	 * Define the prompt type for the request. If not defined, one from the
	 * config will be used
	 */
	public prompt(prompt: 'none' | 'consent' | 'select_account'): this {
		this.urlBuilder.param('prompt', prompt)
		return this
	}

	/**
	 * Specify a custom hosted domain
	 */
	public hostedDomain(domain: string): this {
		this.param('hd', domain)
		return this
	}

	/**
	 * Define the oauth display type
	 */
	public display(display: string): this {
		this.param('display', display)
		return this
	}

	/**
	 * Define any set of params
	 */
	public param(key: string, value: any): this {
		this.urlBuilder.param(key, value)
		return this
	}

	/**
	 * Make url
	 */
	public toString() {
		return this.urlBuilder.makeUrl()
	}
}
