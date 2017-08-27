'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')

module.exports = async (cli) => {
  try {
    const fromPath = path.join(__dirname, 'examples/config.js')
    const toPath = path.join(cli.helpers.configPath(), 'services.js')
    await cli.copy(fromPath, toPath)
    cli.command.completed('create', 'config/services.js')
  } catch (error) {
    cli.command.info('config/services.js already exists. Copy the config file from the following url')
    console.log('https://goo.gl/kvrg4d')
  }
}
