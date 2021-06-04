/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/core/build/standalone'

export const fs = new Filesystem(join(__dirname, '__app'))

export async function setup(setupProviders?: boolean) {
  const application = new Application(fs.basePath, 'web', {
    providers: ['@adonisjs/core', '../../providers/AllyProvider'],
  })

  await fs.add(
    'config/app.ts',
    `
    export const profiler = { enabled: true }
    export const appKey = 'averylongrandomsecretkey'
    export const http = {
      trustProxy: () => {},
      cookie: {}
    }
  `
  )

  await application.setup()

  if (setupProviders) {
    await application.registerProviders()
    await application.bootProviders()
  }

  return application
}
