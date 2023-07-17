/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Configure from '@adonisjs/core/commands/configure'

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  await command.publishStub('config.stub')
  await command.publishStub('types.stub')
  await command.updateRcFile((rcFile) => {
    rcFile.addProvider('@adonisjs/ally/ally_provider')
  })
}
