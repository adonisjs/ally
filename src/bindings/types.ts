/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { AllyManager } from '../ally_manager.js'
import type { AllyManagerDriverFactory, SocialProviders } from '../types.js'

/**
 * In order for types to get picked up, this module must get
 * imported by TypeScript. Therefore, we export this module
 * from the package entrypoint
 */

declare module '@adonisjs/core/http' {
  interface HttpContext {
    ally: AllyManager<
      SocialProviders extends Record<string, AllyManagerDriverFactory> ? SocialProviders : never
    >
  }
}
