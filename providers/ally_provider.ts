/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationService } from '@adonisjs/core/types'
import { extendHttpContext } from '../src/bindings/http_context.js'

/**
 * AllyProvider extends the HTTP context with the "ally" property
 */
export default class AllyProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    extendHttpContext(this.app.config.get('ally'))
  }
}
