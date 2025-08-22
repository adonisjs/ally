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
        providers: [() => import('../providers/ally_provider.js')],
        preloads: [
          () => import('./discord.js'),
          () => import('./github.js'),
          () => import('./twitter.js'),
          () => import('./google.js'),
          () => import('./linkedin.js'),
          () => import('./linkedin_openid_connect.js'),
          () => import('./facebook.js'),
          () => import('./spotify.js'),
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
