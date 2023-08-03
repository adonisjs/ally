/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createError } from '@poppinss/utils'

export const E_OAUTH_MISSING_CODE = createError<[string]>(
  'Cannot request access token. Redirect request is missing the "%s" param',
  'E_OAUTH_MISSING_CODE',
  500
)

export const E_OAUTH_STATE_MISMATCH = createError(
  'Unable to verify re-redirect state',
  'E_OAUTH_STATE_MISMATCH',
  400
)
