/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Addons/Ally' {
	import { DateTime } from 'luxon'
	import { ApplicationContract } from '@ioc:Adonis/Core/Application'
	import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

	/**
	 * A generic HTTP client for making OAuth requests
	 */
	export interface HttpClientContract {
		params: { [key: string]: any }
		headers: { [key: string]: any }
		fields: { [key: string]: any }
		param(key: string, value: any): this
		header(key: string, value: any): this
		field(key: string, value: any): this
		parseResponseAs(type: 'json' | 'text' | 'buffer'): this
		requestType(type: 'json' | 'urlencoded'): this
		post<T extends any>(): Promise<T>
		get<T extends any>(): Promise<T>
	}

	/**
	 * Url builder
	 */
	export interface UrlBuilderContract {
		params: { [key: string]: any }
		param(key: string, value: any): this
		makeUrl(): string
	}

	/**
	 * Shape of the oauth1 request token response
	 */
	export type Oauth1RequestToken = {
		oauthToken: string
		oauthTokenSecret: string
	} & { [key: string]: string | string[] }

	/**
	 * Shape of the oauth2 access token response
	 */
	export type Oauth1AccessToken = Oauth1RequestToken

	/**
	 * Config for the Oauth1 request
	 */
	export type Oauth1RequestConfig = {
		consumerKey: string
		consumerSecret: string
		nonce?: string
		unixTimestamp?: number
		oauthToken?: string
		oauthTokenSecret?: string
	}

	/**
	 * Oauth1 request client
	 */
	export interface Oauth1RequestContract {
		param(key: string, value: any): this
		oauthParam(key: string, value: any): this
		header(key: string, value: any): this
		field(key: string, value: any): this
		getRequestToken(): Promise<Oauth1RequestToken>
		getAccessToken(): Promise<Oauth1AccessToken>
	}

	/**
	 * Config for the Oauth2 request
	 */
	export type Oauth2RequestConfig = {
		redirectUri: string
		clientId: string
		clientSecret: string
		code: string
		grantType?: string
	}

	/**
	 * Shape of the oauth2 access token response
	 */
	export type Oauth2AccessToken = {
		accessToken: string
		tokenType?: string
		expiresIn?: number
		expiresAt?: DateTime
		refreshToken?: string
	} & { [key: string]: string }

	/**
	 * Oauth2 request client
	 */
	export interface Oauth2RequestContract {
		param(key: string, value: any): this
		header(key: string, value: any): this
		field(key: string, value: any): this
		getAccessToken(): Promise<Oauth2AccessToken>
	}

	/**
	 * ---------------------------------------------------
	 * CORE ENDS HERE. REST IS DRIVERS IMPLEMENTATION
	 * ---------------------------------------------------
	 */

	/**
	 * Base redirect request used when the driver is unknown
	 */
	export interface OauthRedirectRequestContract {
		params: { [key: string]: any }
		param(key: string, value: any): this
	}

	/**
	 * Base Oauth user request
	 */
	export interface OauthUserRequestContract {
		params: { [key: string]: any }
		headers: { [key: string]: any }
		fields: { [key: string]: any }
		param(key: string, value: any): this
		header(key: string, value: any): this
		field(key: string, value: any): this
	}

	/**
	 * Base Oauth token when driver is unknown
	 */
	export type OauthToken = {
		value: string
		type?: string
		refreshToken?: string
		expiresIn?: number
		expiresAt?: DateTime
		tokenSecret?: string
	} & {
		[key: string]: any
	}

	/**
	 * Base config for an oauth driver
	 */
	export type OauthDriverConfig = {
		clientId: string
		clientSecret: string
		callbackUrl: string

		/**
		 * Config only
		 */
		authorizeUrl?: string
		accessTokenUrl?: string
		userInfoUrl?: string
	}

	/**
	 * The user fetched from the oauth provider
	 */
	export interface AllyUserContract<Token extends OauthToken = OauthToken> {
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
	export interface SocialDriverContract {
		stateless(): this
		redirect(callback?: (request: OauthRedirectRequestContract) => void): void
		getRedirectUrl(callback?: (request: OauthRedirectRequestContract) => void): string
		hasCode(): boolean
		accessDenied(): boolean
		stateMisMatch(): boolean
		hasError(): boolean
		getError(): string | null
		getAccessToken(): Promise<OauthToken>
		getUser(
			callback?: (request: OauthUserRequestContract) => void
		): Promise<AllyUserContract<OauthToken>>
		getUserForToken(
			token: string,
			callback?: (request: OauthUserRequestContract) => void
		): Promise<AllyUserContract<{ value: string }>>
		getUserForTokenAndSecret(
			token: string,
			tokenSecret: string,
			callback?: (request: OauthUserRequestContract) => void
		): Promise<AllyUserContract<{ value: string; tokenSecret: string }>>
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
	 * Config accepted by the github driver. Some of the options can be
	 * overwritten at runtime
	 */
	export type GithubDriverConfig = OauthDriverConfig & {
		driver: 'github'

		/**
		 * Can be configured at runtime
		 */
		scopes?: GithubScopes[]
		login?: string
		allowSignup?: boolean
	}

	/**
	 * Redirect request for github
	 */
	export interface GithubRedirectRequestContract extends OauthRedirectRequestContract {
		/**
		 * Scopes to ask permission for
		 */
		scopes(scopes: GithubScopes[]): this

		/**
		 * Force a specific account for login
		 */
		login(account: string): this

		/**
		 * Enable/disable signups during oauth. Defaults
		 * to "true" (as per github)
		 */
		allowSignup(enable: boolean): this
	}

	/**
	 * Shape of the github access token
	 */
	export type GithubToken = {
		value: string
		grantedScopes: string[]
	}

	/**
	 * Shape of the github driver
	 */
	export interface GithubDriverContract extends SocialDriverContract {
		/**
		 * Redirect to github for authorizing the request
		 */
		redirect(callback?: (request: GithubRedirectRequestContract) => void): void

		/**
		 * Get the redirect url
		 */
		getRedirectUrl(callback?: (request: GithubRedirectRequestContract) => void): string

		/**
		 * Get the access token. If you want the user + access token
		 * both, then use the `getUser` method instead
		 */
		getAccessToken(): Promise<GithubToken>

		/**
		 * Get the user along with the access token
		 */
		getUser(
			callback?: (request: OauthUserRequestContract) => void
		): Promise<AllyUserContract<GithubToken>>
	}

	/**
	 * ----------------------------------------
	 * Google driver
	 * ----------------------------------------
	 */

	/**
	 * Most popular google scopes. You can find rest of them on the following link
	 * https://developers.google.com/identity/protocols/oauth2/scopes
	 */
	export type GoogleScopes =
		| 'userinfo.email'
		| 'userinfo.profile'
		| 'openid'
		| 'contacts'
		| 'contacts.other.readonly'
		| 'contacts.readonly'
		| 'directory.readonly'
		| 'user.addresses.read'
		| 'user.birthday.read'
		| 'user.emails.read'
		| 'user.gender.read'
		| 'user.organization.read'
		| 'user.phonenumbers.read'
		| 'analytics'
		| 'analytics.readonly'
		| 'documents'
		| 'documents.readonly'
		| 'forms'
		| 'forms.currentonly'
		| 'groups'
		| 'spreadsheets'
		| 'calendar'
		| 'calendar.events'
		| 'calendar.events.readonly'
		| 'calendar.readonly'
		| 'calendar.settings.readonly'
		| 'drive'
		| 'drive.appdata'
		| 'drive.file'
		| 'drive.metadata'
		| 'drive.metadata.readonly'
		| 'drive.photos.readonly'
		| 'drive.readonly'
		| 'drive.scripts'

	/**
	 * Config accepted by the google driver. Most of the options can be
	 * overwritten at runtime
	 */
	export type GoogleDriverConfig = OauthDriverConfig & {
		driver: 'google'

		/**
		 * Can be configured at runtime
		 */
		scopes?: GoogleScopes[]
		prompt?: 'none' | 'consent' | 'select_account'
		accessType?: 'online' | 'offline'
		hostedDomain?: string
		display?: 'page' | 'popup' | 'touch' | 'wrap'
	}

	/**
	 * Redirect request for google
	 */
	export interface GoogleRedirectRequestContract extends OauthRedirectRequestContract {
		/**
		 * Enable/disable the redirect to include the granted
		 * scopes
		 */
		includeGrantedScopes(): this

		/**
		 * Scopes to ask permission for
		 */
		scopes(scopes: GoogleScopes[]): this

		/**
		 * Define the landing prompt
		 */
		prompt(prompt: 'none' | 'consent' | 'select_account'): this

		/**
		 * Define the access type. The refresh token is available only
		 * when access type is offline
		 */
		accessType(type: 'online' | 'offline'): this

		/**
		 * Restrict email choices to the given hosted domain. Only
		 * one domain can be defined; restriction is imposed by
		 * google itself
		 */
		hostedDomain(domain: string): this

		/**
		 * Configure the dispay type
		 */
		display(display: 'page' | 'popup' | 'touch' | 'wrap'): this
	}

	/**
	 * Shape of the access token response for google
	 */
	export type GoogleToken = {
		value: string
		refreshToken: string
		expiresIn: number
		expiresAt: DateTime
		idToken: string
		grantedScopes: string[]
	}

	/**
	 * Shape of the google driver
	 */
	export interface GoogleDriverContract extends SocialDriverContract {
		/**
		 * Redirect to google for authorizing the request
		 */
		redirect(callback?: (request: GoogleRedirectRequestContract) => void): void

		/**
		 * Get the redirect url
		 */
		getRedirectUrl(callback?: (request: GoogleRedirectRequestContract) => void): string

		/**
		 * Get the access token. If you want the user + access token
		 * both, then use the `getUser` method instead
		 */
		getAccessToken(): Promise<GoogleToken>

		/**
		 * Get the user along with the access token
		 */
		getUser(
			callback?: (request: OauthUserRequestContract) => void
		): Promise<AllyUserContract<GoogleToken>>
	}

	/**
	 * ----------------------------------------
	 * Linkedin driver
	 * ----------------------------------------
	 */

	/**
	 * Linkedin scopes are dependant upon the products enabled on your profile
	 * We are listing all here, you should check the dashbaord to ensure
	 * the related products are enabled.
	 *
	 * https://www.linkedin.com/developers/apps
	 *
	 * https://developers.google.com/identity/protocols/oauth2/scopes
	 * https://docs.microsoft.com/en-gb/linkedin/marketing/getting-started#what-permissions-are-available
	 */
	export type LinkedInScopes =
		| 'r_emailaddress'
		| 'r_liteprofile'
		| 'rw_organization_admin'
		| 'w_organization_social'
		| 'r_organization_social'
		| 'w_member_social'
		| 'rw_ads'
		| 'r_ads'
		| 'r_ads_reporting'
		| 'r_1st_connections_size'
		| 'r_basicprofile'
		| 'r_fullprofile'

	/**
	 * ----------------------------------------
	 * Gitlab driver
	 * ----------------------------------------
	 */

	/**
	 * Gitlab scopes. Unable to find them anywhere in the docs. However
	 * they are available in the dasbhoard.
	 *
	 * https://gitlab.com/-/profile/personal_access_tokens
	 */
	export type GitlabScopes =
		| 'api'
		| 'read_user'
		| 'read_api'
		| 'read_repository'
		| 'write_repository'
		| 'read_registry'
		| 'write_registry'

	/**
	 * ----------------------------------------
	 * Patreon driver
	 * ----------------------------------------
	 */

	/**
	 * Patreon scopes. https://docs.patreon.com/#scopes
	 */
	export type PatreonScopes =
		| 'identity'
		| 'identity[email]'
		| 'identity.memberships'
		| 'campaigns'
		| 'w:campaigns.webhook'
		| 'campaigns.members'
		| 'campaigns.members[email]'
		| 'campaigns.members.address'
		| 'campaigns.posts'

	/**
	 * ----------------------------------------
	 * Discord driver
	 * ----------------------------------------
	 */

	/**
	 * Discord scopes.
	 *
	 * We have prefixed the scopes allowed for whitelisted apps with the `@whitelisted/` keyword
	 * for easier identification. However, when passing these scopes to discord, we remove the
	 * `@whitelisted/` keyword
	 *
	 * https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
	 */
	export type DiscordScopes =
		| 'bot'
		| 'connections'
		| 'email'
		| 'identify'
		| 'guilds'
		| 'guilds.join'
		| 'gdm.join'
		| 'messages.read'
		| '@whitelisted/rpc'
		| '@whitelisted/rpc.api'
		| '@whitelisted/rpc.notifications.read'
		| 'webhook.incoming'
		| '@whitelisted/applications.builds.upload'
		| 'applications.builds.read'
		| 'applications.store.update'
		| 'applications.entitlements'
		| '@whitelisted/relationships.read'
		| '@whitelisted/activities.read'
		| '@whitelisted/activities.write'
		| 'applications.commands.update'

	/**
	 * ----------------------------------------
	 * Microsoft driver
	 * ----------------------------------------
	 */

	/**
	 * A partial list of microsoft scopes.
	 *
	 * We have only added the most commonly used scopes, since the list of scopes is
	 * quite big.
	 *
	 * Also, you have to login to your dashboard and then view the list of permissions
	 * under the "API permissions" tab
	 *
	 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent
	 */
	export type MicrosoftScopes =
		| 'openid'
		| 'email'
		| 'profile'
		| 'offline_access'
		| '/.default'
		| 'Mail.Send'
		| 'AccessReview.Read.All'
		| 'AccessReview.ReadWrite.All'
		| 'AccessReview.ReadWrite.Membership'
		| 'Application.Read.All'
		| 'Application.ReadWrite.All'
		| 'Bookings.Manage.All'
		| 'Bookings.Read.All'
		| 'Bookings.Read.All'
		| 'Bookings.ReadWrite.All'
		| 'BookingsAppointment.ReadWrite.All'
		| 'Calendars.Read'
		| 'Calendars.Read.Shared'
		| 'Calendars.ReadWrite'
		| 'Calendars.ReadWrite.Shared'
		| 'Contacts.Read'
		| 'Contacts.Read.Shared'
		| 'Contacts.ReadWrite'
		| 'Contacts.ReadWrite.Shared'
		| 'Directory.AccessAsUser.All'
		| 'Directory.Read.All'
		| 'Directory.ReadWrite.All'
		| 'Directory.ReadWrite.All'
		| 'People.Read'
		| 'People.Read.All'
		| 'User.Export.All'
		| 'User.Invite.All'
		| 'User.ManageIdentities.All'
		| 'User.Read'
		| 'User.Read.All'
		| 'User.ReadBasic.All'
		| 'User.ReadWrite'
		| 'User.ReadWrite.All'

	/**
	 * ----------------------------------------
	 * Bitbucket driver
	 * ----------------------------------------
	 */

	/**
	 * The scopes mentioned in the docs are not complete and hence we have used
	 * the app settings list to collect the following scopes.
	 *
	 * Bitbucket is notorious with scopes. Your app can ask for fewer scopes than
	 * the one's enabled in the dashboard. So make sure that you enable all in
	 * the dashboard
	 *
	 * https://developer.atlassian.com/cloud/bitbucket/bitbucket-cloud-rest-api-scopes/
	 */
	export type AtlassianScopes =
		| 'email'
		| 'account'
		| 'account:write'
		| 'team'
		| 'team:write'
		| 'project'
		| 'project:write'
		| 'repository'
		| 'repository:write'
		| 'repository:admin'
		| 'repository:delete'
		| 'pullrequest'
		| 'pullrequest:write'
		| 'issue'
		| 'issue:write'
		| 'wiki'
		| 'snippet'
		| 'snippet:write'
		| 'webhook'
		| 'pipeline'
		| 'pipeline:write'
		| 'pipeline:variable'

	export interface SocialProviders {}

	/**
	 * END OF DRIVERS
	 */

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
		application: ApplicationContract,
		mapping: string,
		config: any,
		ctx: HttpContextContract
	) => SocialDriverContract

	/**
	 * Ally instance is passed to every HTTP request and has access to the
	 * current request
	 */
	export interface AllyContract {
		use<Provider extends keyof SocialProviders>(
			provider: Provider
		): SocialProviders[Provider]['implementation']
		use(provider: string): SocialDriverContract
	}

	/**
	 * Ally manager for managing ally drivers and their instances
	 */
	export interface AllyManagerContract {
		/**
		 * Make instance of a mapping
		 */
		makeMapping<Provider extends keyof SocialProviders>(
			ctx: HttpContextContract,
			mapping: keyof SocialProviders
		): SocialProviders[Provider]['implementation']
		makeMapping(ctx: HttpContextContract, mapping: string): SocialDriverContract

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
}
