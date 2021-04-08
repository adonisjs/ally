declare module '@ioc:Adonis/Addons/Ally' {
	import { GithubDriverConfig, GithubDriverContract } from '@ioc:Adonis/Addons/Ally'

	interface SocialProviders {
		github: {
			config: GithubDriverConfig
			implementation: GithubDriverContract
		}
	}
}
