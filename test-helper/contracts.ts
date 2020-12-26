declare module '@ioc:Adonis/Addons/Ally' {
	import {
		GithubDriverConfig,
		GithubDriverContract,
		GoogleDriverContract,
		GoogleDriverConfig,
	} from '@ioc:Adonis/Addons/Ally'

	interface SocialProviders {
		google: {
			config: GoogleDriverConfig
			implementation: GoogleDriverContract
		}
		github: {
			config: GithubDriverConfig
			implementation: GithubDriverContract
		}
	}
}
