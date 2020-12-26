import { join } from 'path'
import { createServer } from 'http'
import { Application } from '@adonisjs/core/build/standalone'

async function run() {
	const app = new Application(join(__dirname, '../'), 'web')
	app.setup()
	app.registerProviders()
	await app.bootProviders()
	app.requirePreloads()

	const server = app.container.use('Adonis/Core/Server')
	server.optimize()
	createServer(server.handle.bind(server)).listen(3000)
}

run()
