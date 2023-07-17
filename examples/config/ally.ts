import { defineConfig } from '../../src/define_config.js'

const allyConfig = defineConfig({
  discord: {
    driver: 'discord',
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackUrl: `http://localhost:${process.env.PORT}/discord/callback`,
  },
  google: {
    driver: 'google',
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackUrl: `http://localhost:${process.env.PORT}/google/callback`,
  },
  github: {
    driver: 'github',
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackUrl: `http://localhost:${process.env.PORT}/github/callback`,
  },
  linkedin: {
    driver: 'linkedin',
    clientId: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    callbackUrl: `http://localhost:${process.env.PORT}/linkedin/callback`,
  },
  twitter: {
    driver: 'twitter',
    clientId: process.env.TWITTER_API_KEY!,
    clientSecret: process.env.TWITTER_APP_SECRET!,
    callbackUrl: `http://localhost:${process.env.PORT}/twitter/callback`,
  },
  facebook: {
    driver: 'facebook',
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    callbackUrl: `http://localhost:${process.env.PORT}/facebook/callback`,
  },
  spotify: {
    driver: 'spotify',
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    callbackUrl: `http://localhost:${process.env.PORT}/spotify/callback`,
  },
})

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}

export default allyConfig
