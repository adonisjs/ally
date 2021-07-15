import { join } from 'path'
import { createServer } from 'http'
import { Application } from '@adonisjs/core/build/standalone'
import 'reflect-metadata'

async function run() {
  const app = new Application(join(__dirname, '../'), 'web')
  await app.setup()
  await app.registerProviders()
  await app.bootProviders()
  await app.requirePreloads()

  const server = app.container.use('Adonis/Core/Server')
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

  server.middleware.register([() => import('@ioc:Adonis/Core/BodyParser')])
  server.optimize()

  createServer(server.handle.bind(server)).listen(port)
}

run()
