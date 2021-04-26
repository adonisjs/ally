declare module '@ioc:Adonis/Addons/Ally' {
  interface SocialProviders {
    github: {
      config: GithubDriverConfig
      implementation: GithubDriverContract
    }
    twitter: {
      config: TwitterDriverConfig
      implementation: TwitterDriverContract
    }
    google: {
      config: GoogleDriverConfig
      implementation: GoogleDriverContract
    }
  }
}
