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
  const providers = await command.prompt.multiple(
    'Select the social auth providers you plan to use',
    ['discord', 'facebook', 'github', 'google', 'linkedin', 'spotify', 'twitter']
  )

  /**
   * Publish config file
   */
  await command.publishStub('config.stub', {
    providers: providers.map((provider) => {
      return { provider, envPrefix: provider.toUpperCase() }
    }),
  })

  /**
   * Publish provider
   */
  await command.updateRcFile((rcFile) => {
    rcFile.addProvider('@adonisjs/ally/ally_provider')
  })

  /**
   * Define env variables for the selected providers
   */
  await command.defineEnvVariables(
    providers.reduce<Record<string, string>>((result, provider) => {
      result[`${provider.toUpperCase()}_CLIENT_ID`] = ''
      result[`${provider.toUpperCase()}_CLIENT_SECRET`] = ''
      return result
    }, {})
  )
}
