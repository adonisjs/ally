/*
 * @adonisjs/static
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { IgnitorFactory } from '@adonisjs/core/factories'
import Configure from '@adonisjs/core/commands/configure'

const BASE_URL = new URL('./tmp/', import.meta.url)

test.group('Configure', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = fileURLToPath(BASE_URL)
  })

  group.each.disableTimeout()

  test('do not prompt when provider is provided as a CLI flag', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    await fs.create('.env', '')
    await fs.createJson('tsconfig.json', {})
    await fs.create('start/env.ts', `export default Env.create(new URL('./'), {})`)
    await fs.create('adonisrc.ts', `export default defineConfig({})`)

    const ace = await app.container.make('ace')
    const command = await ace.create(Configure, ['../../index.js', '--providers=facebook'])
    await command.exec()

    await assert.fileExists('config/ally.ts')
    await assert.fileExists('adonisrc.ts')
    await assert.fileContains('adonisrc.ts', '@adonisjs/ally/ally_provider')
    await assert.fileContains('config/ally.ts', 'defineConfig')
    await assert.fileContains('config/ally.ts', `declare module '@adonisjs/ally/types' {`)
    await assert.fileContains(
      'config/ally.ts',
      `facebook: services.facebook({
    clientId: env.get('FACEBOOK_CLIENT_ID'),
    clientSecret: env.get('FACEBOOK_CLIENT_SECRET'),
    callbackUrl: '',
  }),`
    )
    await assert.fileContains('.env', 'FACEBOOK_CLIENT_ID')
    await assert.fileContains('.env', 'FACEBOOK_CLIENT_SECRET')

    await assert.fileContains('start/env.ts', 'FACEBOOK_CLIENT_ID: Env.schema.string()')
    await assert.fileContains('start/env.ts', 'FACEBOOK_CLIENT_SECRET: Env.schema.string()')
  })

  test('define multiple providers via the CLI flag', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    await fs.create('.env', '')
    await fs.createJson('tsconfig.json', {})
    await fs.create('start/env.ts', `export default Env.create(new URL('./'), {})`)
    await fs.create('adonisrc.ts', `export default defineConfig({})`)

    const ace = await app.container.make('ace')
    const command = await ace.create(Configure, [
      '../../index.js',
      '--providers=github',
      '--providers=linkedin',
    ])
    await command.exec()

    await assert.fileExists('config/ally.ts')
    await assert.fileExists('adonisrc.ts')
    await assert.fileContains('adonisrc.ts', '@adonisjs/ally/ally_provider')
    await assert.fileContains('config/ally.ts', 'defineConfig')
    await assert.fileContains('config/ally.ts', `declare module '@adonisjs/ally/types' {`)
    await assert.fileContains(
      'config/ally.ts',
      `github: services.github({
    clientId: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    callbackUrl: '',
  }),`
    )
    await assert.fileContains(
      'config/ally.ts',
      `linkedin: services.linkedin({
    clientId: env.get('LINKEDIN_CLIENT_ID'),
    clientSecret: env.get('LINKEDIN_CLIENT_SECRET'),
    callbackUrl: '',
  }),`
    )
    await assert.fileContains('.env', 'GITHUB_CLIENT_ID')
    await assert.fileContains('.env', 'GITHUB_CLIENT_SECRET')
    await assert.fileContains('.env', 'LINKEDIN_CLIENT_ID')
    await assert.fileContains('.env', 'LINKEDIN_CLIENT_SECRET')

    await assert.fileContains('start/env.ts', 'GITHUB_CLIENT_ID: Env.schema.string()')
    await assert.fileContains('start/env.ts', 'GITHUB_CLIENT_SECRET: Env.schema.string()')
    await assert.fileContains('start/env.ts', 'LINKEDIN_CLIENT_ID: Env.schema.string()')
    await assert.fileContains('start/env.ts', 'LINKEDIN_CLIENT_SECRET: Env.schema.string()')
  })

  test('report error when CLI provider is invalid', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    await fs.create('.env', '')
    await fs.createJson('tsconfig.json', {})
    await fs.create('start/env.ts', `export default Env.create(new URL('./'), {})`)
    await fs.create('adonisrc.ts', `export default defineConfig({})`)

    const ace = await app.container.make('ace')
    const command = await ace.create(Configure, ['../../index.js', '--providers=foo'])
    await command.exec()

    command.assertFailed()

    await assert.fileNotExists('config/ally.ts')
    await assert.fileEquals('.env', '')
    await assert.fileEquals('start/env.ts', `export default Env.create(new URL('./'), {})`)
  })

  test('prompt when provider is pre-defined', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    await fs.create('.env', '')
    await fs.createJson('tsconfig.json', {})
    await fs.create('start/env.ts', `export default Env.create(new URL('./'), {})`)
    await fs.create('adonisrc.ts', `export default defineConfig({})`)

    const ace = await app.container.make('ace')
    ace.prompt.trap('Select the social auth providers you plan to use').chooseOptions([2, 4])

    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await assert.fileExists('config/ally.ts')
    await assert.fileExists('adonisrc.ts')
    await assert.fileContains('adonisrc.ts', '@adonisjs/ally/ally_provider')
    await assert.fileContains('config/ally.ts', 'defineConfig')
    await assert.fileContains('config/ally.ts', `declare module '@adonisjs/ally/types' {`)
    await assert.fileContains(
      'config/ally.ts',
      `github: services.github({
    clientId: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    callbackUrl: '',
  }),`
    )
    await assert.fileContains(
      'config/ally.ts',
      `linkedin: services.linkedin({
    clientId: env.get('LINKEDIN_CLIENT_ID'),
    clientSecret: env.get('LINKEDIN_CLIENT_SECRET'),
    callbackUrl: '',
  }),`
    )
    await assert.fileContains('.env', 'GITHUB_CLIENT_ID')
    await assert.fileContains('.env', 'GITHUB_CLIENT_SECRET')
    await assert.fileContains('.env', 'LINKEDIN_CLIENT_ID')
    await assert.fileContains('.env', 'LINKEDIN_CLIENT_SECRET')

    await assert.fileContains('start/env.ts', 'GITHUB_CLIENT_ID: Env.schema.string()')
    await assert.fileContains('start/env.ts', 'GITHUB_CLIENT_SECRET: Env.schema.string()')
    await assert.fileContains('start/env.ts', 'LINKEDIN_CLIENT_ID: Env.schema.string()')
    await assert.fileContains('start/env.ts', 'LINKEDIN_CLIENT_SECRET: Env.schema.string()')
  })
})
