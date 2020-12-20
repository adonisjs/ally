/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import querystring from 'querystring'
import { UrlBuilderContract } from '@ioc:Adonis/Addons/Ally'

/**
 * Builds the url with query string
 */
export class UrlBuilder implements UrlBuilderContract {
	public params: UrlBuilderContract['params'] = {}

	constructor(private baseUrl: string) {}

	/**
	 * Define the request param
	 */
	public param(key: string, value: any) {
		this.params[key] = value
		return this
	}

	/**
	 * Returns the url
	 */
	public makeUrl() {
		return `${this.baseUrl.replace(/\/$/, '')}?${querystring.stringify(this.params)}`
	}
}
