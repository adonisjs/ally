import { Env } from '@adonisjs/core/env'
import { IgnitorFactory } from '@adonisjs/core/factories'

const APP_ROOT = new URL('./', import.meta.url)
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

await Env.create(new URL('../', APP_ROOT), {})
const allyConfig = await import('./config/ally.js')

async function run() {
  const ignitor = new IgnitorFactory()
    .withCoreConfig()
    .withCoreProviders()
    .merge({
      config: {
        ally: allyConfig.default,
      },
    })
    .merge({
      rcFileContents: {
        providers: ['../providers/ally_provider.js'],
        preloads: [
          './discord.js',
          './github.js',
          './twitter.js',
          './google.js',
          './linkedin.js',
          './facebook.js',
          './spotify.js',
        ],
      },
    })
    .create(APP_ROOT, {
      importer: IMPORTER,
    })

  await ignitor.httpServer().start()
}

run()
  .catch(console.error)
  .then(() => {
    console.log('ready')
  })
