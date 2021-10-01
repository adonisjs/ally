declare module '@ioc:Adonis/Addons/Ally' {
  interface SocialProviders {
    discord: {
      config: DiscordDriverConfig
      implementation: DiscordDriverContract
    }
    github: {
      config: GithubDriverConfig
      implementation: GithubDriverContract
    }
    twitter: {
      config: TwitterDriverConfig
      implementation: TwitterDriverContract
    }
    linkedin: {
      config: LinkedInDriverConfig
      implementation: LinkedInDriverContract
    }
    google: {
      config: GoogleDriverConfig
      implementation: GoogleDriverContract
    }
    facebook: {
      config: FacebookDriverConfig
      implementation: FacebookDriverContract
    }
    spotify: {
      config: SpotifyDriverConfig
      implementation: SpotifyDriverContract
    }
    twitch: {
      config: TwitchDriverConfig
      implementation: TwitchDriverContract
    }
  }
}
