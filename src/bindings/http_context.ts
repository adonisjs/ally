/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpContext } from '@adonisjs/core/http'

import './types.js'
import { AllyManager } from '../ally_manager.js'
import { AllyManagerDriverFactory, SocialProviders } from '../types.js'

/**
 * Extends HttpContext class with the ally getter
 */
export function extendHttpContext(
  config: SocialProviders extends Record<string, AllyManagerDriverFactory> ? SocialProviders : never
) {
  HttpContext.getter(
    'ally',
    function (this: HttpContext) {
      return new AllyManager(config, this)
    },
    true
  )
}
