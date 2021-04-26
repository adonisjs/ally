/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

export class OauthException extends Exception {
  public static missingAuthorizationCode(paramName: string) {
    return new this(
      `Cannot request access token. Redirect request is missing the "${paramName}" param`,
      500,
      'E_OAUTH_MISSING_CODE'
    )
  }

  /**
   * Unable to verify state after redirect
   */
  public static stateMisMatch() {
    return new this('Unable to verify re-redirect state', 400, 'E_OAUTH_STATE_MISMATCH')
  }
}
