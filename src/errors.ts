/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createError } from '@adonisjs/core/exceptions'

/**
 * Error thrown when the OAuth redirect is missing the required
 * authorization code or token parameter.
 */
export const E_OAUTH_MISSING_CODE = createError<[string]>(
  'Cannot request access token. Redirect request is missing the "%s" param',
  'E_OAUTH_MISSING_CODE',
  500
)

/**
 * Error thrown when the OAuth state parameter does not match
 * the expected value, indicating a potential CSRF attack.
 */
export const E_OAUTH_STATE_MISMATCH = createError(
  'Unable to verify re-redirect state',
  'E_OAUTH_STATE_MISMATCH',
  400
)
