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
 *
 * @example
 * ```ts
 * throw new errors.E_OAUTH_MISSING_CODE(['code'])
 * ```
 */
export const E_OAUTH_MISSING_CODE = createError<[string]>(
  'Cannot request access token. Redirect request is missing the "%s" param',
  'E_OAUTH_MISSING_CODE',
  500
)

/**
 * Error thrown when the OAuth state parameter does not match
 * the expected value, indicating a potential CSRF attack.
 *
 * @example
 * ```ts
 * throw new errors.E_OAUTH_STATE_MISMATCH()
 * ```
 */
export const E_OAUTH_STATE_MISMATCH = createError(
  'Unable to verify re-redirect state',
  'E_OAUTH_STATE_MISMATCH',
  400
)

/**
 * Error thrown when attempting to use an unknown Ally provider.
 *
 * @example
 * ```ts
 * throw new errors.E_UNKNOWN_ALLY_PROVIDER(['github'])
 * ```
 */
export const E_UNKNOWN_ALLY_PROVIDER = createError<[string]>(
  'Unknown ally provider "%s". Make sure it is registered inside the config/ally.ts file',
  'E_UNKNOWN_ALLY_PROVIDER',
  404
)

/**
 * Error thrown when a provider is used for signup but local signup
 * is disabled for it.
 *
 * @example
 * ```ts
 * throw new errors.E_LOCAL_SIGNUP_DISALLOWED(['github'])
 * ```
 */
export const E_LOCAL_SIGNUP_DISALLOWED = createError<[string]>(
  'Cannot use ally provider "%s" for signup. Local signup is disabled for this provider',
  'E_LOCAL_SIGNUP_DISALLOWED',
  403
)
