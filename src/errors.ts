/*
 * @adonisjs/ally
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference types="@adonisjs/session/session_middleware" />

import type { I18n } from '@adonisjs/i18n'
import { Exception } from '@adonisjs/core/exceptions'
import { type HttpContext } from '@adonisjs/core/http'

/**
 * Base exception that self-handles by content-negotiating the
 * HTTP response (HTML with session flash, JSON, JSONAPI)
 * and supporting i18n translation.
 */
export abstract class HttpResponseException extends Exception {
  abstract identifier: string

  /**
   * Returns the message to be sent in the HTTP response.
   * Feel free to override this method and return a custom
   * response.
   */
  getResponseMessage(error: this, ctx: HttpContext) {
    if ('i18n' in ctx) {
      return (ctx.i18n as I18n).t(error.identifier, {}, error.message)
    }
    return error.message
  }

  /**
   * Converts exception to an HTTP response
   */
  async handle(error: this, ctx: HttpContext) {
    const message = this.getResponseMessage(error, ctx)

    switch (ctx.request.accepts(['html', 'application/vnd.api+json', 'json'])) {
      case 'html':
      case null:
        if (ctx.session) {
          ctx.session.flash('error', message)
          ctx.session.flashErrors({ [error.code!]: message })
          ctx.response.redirect().back()
        } else {
          ctx.response.status(error.status).send(message)
        }
        break
      case 'json':
        ctx.response.status(error.status).send({
          errors: [
            {
              message,
            },
          ],
        })
        break
      case 'application/vnd.api+json':
        ctx.response.status(error.status).send({
          errors: [
            {
              code: error.code,
              title: message,
            },
          ],
        })
        break
    }
  }
}

/**
 * Error thrown when the OAuth redirect is missing the required
 * authorization code or token parameter.
 *
 * @example
 * ```ts
 * throw new errors.E_OAUTH_MISSING_CODE(['code'])
 * ```
 */
export const E_OAUTH_MISSING_CODE = class extends HttpResponseException {
  static status: number = 500
  static code: string = 'E_OAUTH_MISSING_CODE'
  /**
   * Translation identifier. Can be customized
   */
  identifier: string = 'errors.E_OAUTH_MISSING_CODE'

  constructor(args: [string], options?: ErrorOptions) {
    super(
      `Cannot request access token. Redirect request is missing the "${args[0]}" param`,
      options
    )
  }
}

/**
 * Error thrown when the OAuth state parameter does not match
 * the expected value, indicating a potential CSRF attack.
 *
 * @example
 * ```ts
 * throw new errors.E_OAUTH_STATE_MISMATCH()
 * ```
 */
export const E_OAUTH_STATE_MISMATCH = class extends HttpResponseException {
  static status: number = 400
  static code: string = 'E_OAUTH_STATE_MISMATCH'
  static message: string = 'Unable to verify re-redirect state'

  /**
   * Translation identifier. Can be customized
   */
  identifier: string = 'errors.E_OAUTH_STATE_MISMATCH'
}

/**
 * Error thrown when attempting to use an unknown Ally provider.
 *
 * @example
 * ```ts
 * throw new errors.E_UNKNOWN_ALLY_PROVIDER(['github'])
 * ```
 */
export const E_UNKNOWN_ALLY_PROVIDER = class extends HttpResponseException {
  static status: number = 404
  static code: string = 'E_UNKNOWN_ALLY_PROVIDER'
  /**
   * Translation identifier. Can be customized
   */
  identifier: string = 'errors.E_UNKNOWN_ALLY_PROVIDER'

  constructor(args: [string], options?: ErrorOptions) {
    super(`Unknown authentication provider "${args[0]}"`, options)
  }
}

/**
 * Error thrown when a provider is used for signup but local signup
 * is disabled for it.
 *
 * @example
 * ```ts
 * throw new errors.E_LOCAL_SIGNUP_DISALLOWED(['github'])
 * ```
 */
export const E_LOCAL_SIGNUP_DISALLOWED = class extends HttpResponseException {
  static status: number = 403
  static code: string = 'E_LOCAL_SIGNUP_DISALLOWED'
  /**
   * Translation identifier. Can be customized
   */
  identifier: string = 'errors.E_LOCAL_SIGNUP_DISALLOWED'

  constructor(args: [string], options?: ErrorOptions) {
    super(`Cannot signup using "${args[0]}". Local signup is disabled for this provider`, options)
  }
}
