/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Addons/Ally' {
	import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
	import { ApplicationContract } from '@ioc:Adonis/Core/Application'
	import {
		Oauth2AccessToken,
		Oauth1RequestToken,
		Oauth1AccessToken,
		Oauth1ClientConfig,
		Oauth2ClientConfig,
		ApiRequestContract,
		RedirectRequestContract as ClientRequestContract,
	} from '@poppinss/oauth-client'

	export { Oauth2AccessToken }
	export { Oauth1AccessToken }
	export { Oauth1RequestToken }
	export { ApiRequestContract }
	export { Oauth2ClientConfig as Oauth2DriverConfig }
	export { Oauth1ClientConfig as Oauth1DriverConfig }

	/**
	 * Issue: https://github.com/Microsoft/TypeScript/issues/29729
	 * Solution: https://github.com/sindresorhus/type-fest/blob/main/source/literal-union.d.ts
	 */
	type LiteralStringUnion<LiteralType> = LiteralType | (string & { _?: never })

	/**
	 * Extension of oauth-client redirect request with support
	 * for defining scopes as first class citizen
	 */
	export interface RedirectRequestContract<Scopes extends string = string>
		extends ClientRequestContract {
		/**
		 * Define the scopes for authorization
		 */
		scopes(scopes: LiteralStringUnion<Scopes>[]): this

		/**
		 * Merge to existing pre-defined scopes
		 */
		mergeScopes(scopes: LiteralStringUnion<Scopes>[]): this

		/**
		 * Clear existing scopes
		 */
		clearScopes(): this
	}

	/**
	 * The user fetched from the oauth provider.
	 */
	export interface AllyUserContract<Token extends Oauth2AccessToken | Oauth1AccessToken> {
		id: string
		nickName: string
		name: string
		email: string
		emailVerificationState: 'verified' | 'unverified' | 'unsupported'
		avatarUrl: string
		token: Token
		original: any
	}

	/**
	 * Every driver should implement this contract
	 */
	export interface AllyDriverContract<
		Token extends Oauth2AccessToken | Oauth1AccessToken,
		Scopes extends string
	> {
		version: 'oauth1' | 'oauth2'

		/**
		 * Perform stateless authentication. Only applicable for Oauth2 clients
		 */
		stateless(): this

		/**
		 * Redirect user for authorization
		 */
		redirect(callback?: (request: RedirectRequestContract<Scopes>) => void): Promise<void>

		/**
		 * Get redirect url. You must manage the state yourself when redirecting
		 * manually
		 */
		redirectUrl(callback?: (request: RedirectRequestContract<Scopes>) => void): Promise<string>

		/**
		 * Find if the current request has authorization code or oauth token
		 */
		hasCode(): boolean

		/**
		 * Get the current request authorization code or oauth token. Returns
		 * null if there no code
		 */
		getCode(): string | null

		/**
		 * Find if the current error code is for access denied
		 */
		accessDenied(): boolean

		/**
		 * Find if there is a state mismatch
		 */
		stateMisMatch(): boolean

		/**
		 * Find if there is an error post redirect
		 */
		hasError(): boolean

		/**
		 * Get the post redirect error
		 */
		getError(): string | null

		/**
		 * Get access token
		 */
		accessToken(callback?: (request: ApiRequestContract) => void): Promise<Token>

		/**
		 * Returns details for the authorized user
		 */
		user(callback?: (request: ApiRequestContract) => void): Promise<AllyUserContract<Token>>

		/**
		 * Finds the user by access token. Applicable with "Oauth2" only
		 */
		userFromToken(
			token: string,
			callback?: (request: ApiRequestContract) => void
		): Promise<AllyUserContract<{ token: string; type: 'bearer' }>>

		/**
		 * Finds the user by access token. Applicable with "Oauth1" only
		 */
		userFromTokenAndSecret(
			token: string,
			secret: string,
			callback?: (request: ApiRequestContract) => void
		): Promise<AllyUserContract<{ token: string; secret: string }>>
	}

	/**
	 * ----------------------------------------
	 * Github driver
	 * ----------------------------------------
	 */

	/**
	 * Available github scopes
	 * https://docs.github.com/en/free-pro-team@latest/developers/apps/scopes-for-oauth-apps#available-scopes
	 */
	export type GithubScopes =
		| 'repo'
		| 'repo:status'
		| 'repo_deployment'
		| 'public_repo'
		| 'repo:invite'
		| 'security_events'
		| 'admin:repo_hook'
		| 'write:repo_hook'
		| 'read:repo_hook'
		| 'admin:org'
		| 'write:org'
		| 'read:org'
		| 'admin:public_key'
		| 'write:public_key'
		| 'read:public_key'
		| 'admin:org_hook'
		| 'gist'
		| 'notifications'
		| 'user'
		| 'read:user'
		| 'user:email'
		| 'user:follow'
		| 'delete_repo'
		| 'write:discussion'
		| 'read:discussion'
		| 'write:packages'
		| 'read:packages'
		| 'delete:packages'
		| 'admin:gpg_key'
		| 'write:gpg_key'
		| 'read:gpg_key'
		| 'workflow'

	/**
	 * Shape of the Github access token
	 */
	export type GithubToken = {
		token: string
		type: string
		scope: string
	}

	/**
	 * Extra options available for Github
	 */
	export type GithubDriverConfig = Oauth2ClientConfig & {
		driver: 'github'
		login?: string
		scopes?: LiteralStringUnion<GithubScopes>[]
		allowSignup?: boolean
		userInfoUrl?: string
		userEmailUrl?: string
	}

	export interface GithubDriverContract extends AllyDriverContract<GithubToken, GithubScopes> {}

	/**
	 * ----------------------------------------
	 * Twitter driver
	 * ----------------------------------------
	 */

	/**
	 * Shape of the twitter token
	 */
	export type TwitterToken = {
		token: string
		secret: string
		userId: string
		screenName: string
	}

	/**
	 * Extra options available for twitter
	 */
	export type TwitterDriverConfig = Oauth1ClientConfig & {
		driver: 'twitter'
		userInfoUrl?: string
	}

	export interface TwitterDriverContract extends AllyDriverContract<TwitterToken, string> {}

	/**
	 * END OF DRIVERS
	 */

	/**
	 * Must be defined in user land
	 */
	export interface SocialProviders {}

	/**
	 * Ally config
	 */
	export type AllyConfig = {
		[Provider in keyof SocialProviders]: SocialProviders[Provider]['config']
	}

	/**
	 * Shape of the callback to extend the ally drivers
	 */
	export type ExtendDriverCallback = (
		ally: AllyManagerContract,
		mapping: string,
		config: any,
		ctx: HttpContextContract
	) => AllyDriverContract<Oauth2AccessToken | Oauth1AccessToken, string>

	/**
	 * Ally instance is passed to every HTTP request and has access to the
	 * current request
	 */
	export interface AllyContract {
		/**
		 * Get driver instance of a named mapping
		 */
		use<Provider extends keyof SocialProviders>(
			provider: Provider
		): SocialProviders[Provider]['implementation']

		/**
		 * Get driver instance of an unnamed mapping
		 */
		use(provider: string): AllyDriverContract<Oauth2AccessToken | Oauth1AccessToken, string>
	}

	/**
	 * Ally Manager manages the lifecycle of Ally drivers
	 */
	export interface AllyManagerContract {
		application: ApplicationContract

		/**
		 * Make instance of a named mapping
		 */
		makeMapping<Provider extends keyof SocialProviders>(
			ctx: HttpContextContract,
			mapping: keyof SocialProviders
		): SocialProviders[Provider]['implementation']

		/**
		 * Make instance of an unnamed mapping
		 */
		makeMapping(
			ctx: HttpContextContract,
			mapping: string
		): AllyDriverContract<Oauth2AccessToken | Oauth1AccessToken, string>

		/**
		 * Returns an instance of ally, which can be later used to
		 * get instances of social providers for a given request
		 */
		getAllyForRequest(ctx: HttpContextContract): AllyContract

		/**
		 * Extend ally by adding new drivers
		 */
		extend(driverName: string, callback: ExtendDriverCallback): void
	}

	const Ally: AllyManagerContract
	export default Ally
}
