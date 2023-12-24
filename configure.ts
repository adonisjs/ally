/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

/**
 * List of available providers
 */
const AVAILABLE_PROVIDERS = [
  'discord',
  'facebook',
  'github',
  'google',
  'linkedin',
  'spotify',
  'twitter',
]

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  /**
   * Read providers from the CLI flags
   */
  let selectedProviders: string[] | string | undefined = command.parsedFlags.providers

  /**
   * Otherwise force prompt for selection
   */
  if (!selectedProviders) {
    selectedProviders = await command.prompt.multiple(
      'Select the social auth providers you plan to use',
      AVAILABLE_PROVIDERS,
      {
        validate(value) {
          return !value || !value.length
            ? 'Select a social provider to configure the package'
            : true
        },
      }
    )
  }

  /**
   * Cast CLI string value to an array
   */
  let providers = (
    typeof selectedProviders === 'string' ? [selectedProviders] : selectedProviders
  ) as string[]

  /**
   * Validate CLI selection to contain known providers
   */
  const unknownProvider = providers.find((provider) => !AVAILABLE_PROVIDERS.includes(provider))
  if (unknownProvider) {
    command.exitCode = 1
    command.logger.error(`Invalid social provider "${unknownProvider}"`)
    return
  }

  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config/ally.stub', {
    providers: providers.map((provider) => {
      return { provider, envPrefix: provider.toUpperCase() }
    }),
  })

  /**
   * Publish provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@adonisjs/ally/ally_provider')
  })

  /**
   * Define env variables for the selected providers
   */
  await codemods.defineEnvVariables(
    providers.reduce<Record<string, string>>((result, provider) => {
      result[`${provider.toUpperCase()}_CLIENT_ID`] = ''
      result[`${provider.toUpperCase()}_CLIENT_SECRET`] = ''
      return result
    }, {})
  )

  /**
   * Define env variables validation for the selected providers
   */
  await codemods.defineEnvValidations({
    variables: providers.reduce<Record<string, string>>((result, provider) => {
      result[`${provider.toUpperCase()}_CLIENT_ID`] = 'Env.schema.string()'
      result[`${provider.toUpperCase()}_CLIENT_SECRET`] = 'Env.schema.string()'
      return result
    }, {}),
    leadingComment: 'Variables for configuring ally package',
  })
}
