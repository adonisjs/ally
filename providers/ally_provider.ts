/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { configProvider } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { RuntimeException } from '@poppinss/utils'
import type { ApplicationService } from '@adonisjs/core/types'

import type { AllyService } from '../src/types.js'
import { AllyManager } from '../src/ally_manager.js'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    ally: AllyService
  }
}

/**
 * AllyProvider extends the HTTP context with the "ally" property
 */
export default class AllyProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    const allyConfigProvider = this.app.config.get<any>('ally')

    /**
     * Resolve config from the provider
     */
    const config = await configProvider.resolve<any>(this.app, allyConfigProvider)
    if (!config) {
      throw new RuntimeException(
        'Invalid "config/ally.ts" file. Make sure you are using the "defineConfig" method'
      )
    }

    /**
     * Setup HTTPContext getter
     */
    HttpContext.getter(
      'ally',
      function (this: HttpContext) {
        return new AllyManager(config, this) as unknown as AllyService
      },
      true
    )
  }
}
