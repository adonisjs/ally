/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ApplicationService } from '@adonisjs/core/types'

import driversList from '../src/drivers_collection.js'
import { extendHttpContext } from '../src/bindings/http_context.js'

/**
 * AllyProvider extends the HTTP context with the "ally" property
 */
export default class AllyProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    const config = this.app.config.get<any>('ally')
    extendHttpContext(config.services)
    await driversList.registerBundledDrivers(config.driversInUse)
  }
}
