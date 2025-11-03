/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debuglog } from 'node:util'

/**
 * Debug logger for the Ally package. Set the NODE_DEBUG environment
 * variable to "adonisjs:ally" to enable debug logs.
 *
 * @example
 * ```sh
 * NODE_DEBUG=adonisjs:ally node your-app.js
 * ```
 */
export default debuglog('adonisjs:ally')
