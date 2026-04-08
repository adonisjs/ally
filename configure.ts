/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.ts'

/**
 * List of available providers with their prompt labels
 * and env variable prefixes.
 */
const AVAILABLE_PROVIDERS: { name: string; message: string; envPrefix: string }[] = [
  { name: 'discord', message: 'Discord', envPrefix: 'DISCORD' },
  { name: 'facebook', message: 'Facebook', envPrefix: 'FACEBOOK' },
  { name: 'github', message: 'GitHub', envPrefix: 'GITHUB' },
  { name: 'google', message: 'Google', envPrefix: 'GOOGLE' },
  { name: 'linkedin', message: 'LinkedIn', envPrefix: 'LINKEDIN' },
  {
    name: 'linkedinOpenidConnect',
    message: 'LinkedIn (OpenID Connect)',
    envPrefix: 'LINKEDIN_OC',
  },
  { name: 'spotify', message: 'Spotify', envPrefix: 'SPOTIFY' },
  { name: 'twitter', message: 'Twitter', envPrefix: 'TWITTER' },
  { name: 'twitterX', message: 'Twitter X (OAuth2)', envPrefix: 'TWITTER_X' },
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
  const providerNames =
    typeof selectedProviders === 'string' ? [selectedProviders] : selectedProviders!

  /**
   * Validate CLI selection to contain known providers
   */
  const unknownProvider = providerNames.find(
    (name) => !AVAILABLE_PROVIDERS.some((p) => p.name === name)
  )
  if (unknownProvider) {
    command.exitCode = 1
    command.logger.error(`Invalid social provider "${unknownProvider}"`)
    return
  }

  /**
   * Resolve selected provider objects
   */
  const providers = providerNames.map((name) => AVAILABLE_PROVIDERS.find((p) => p.name === name)!)

  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config/ally.stub', {
    providers: providers.map((provider) => {
      return { provider: provider.name, envPrefix: provider.envPrefix }
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
      result[`${provider.envPrefix}_CLIENT_ID`] = ''
      result[`${provider.envPrefix}_CLIENT_SECRET`] = ''
      return result
    }, {})
  )

  /**
   * Define env variables validation for the selected providers
   */
  await codemods.defineEnvValidations({
    variables: providers.reduce<Record<string, string>>((result, provider) => {
      result[`${provider.envPrefix}_CLIENT_ID`] = 'Env.schema.string()'
      result[`${provider.envPrefix}_CLIENT_SECRET`] = 'Env.schema.string()'
      return result
    }, {}),
    leadingComment: 'Variables for configuring ally package',
  })
}
