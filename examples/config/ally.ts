import Env from '@ioc:Adonis/Core/Env'
import { AllyConfig } from '@ioc:Adonis/Addons/Ally'

const allyConfig: AllyConfig = {
  discord: {
    driver: 'discord',
    clientId: Env.get('DISCORD_CLIENT_ID'),
    clientSecret: Env.get('DISCORD_CLIENT_SECRET'),
    callbackUrl: `http://localhost:${Env.get('PORT')}/discord/callback`,
  },
  google: {
    driver: 'google',
    clientId: Env.get('GOOGLE_CLIENT_ID'),
    clientSecret: Env.get('GOOGLE_CLIENT_SECRET'),
    callbackUrl: `http://localhost:${Env.get('PORT')}/google/callback`,
  },
  github: {
    driver: 'github',
    clientId: Env.get('GITHUB_CLIENT_ID'),
    clientSecret: Env.get('GITHUB_CLIENT_SECRET'),
    callbackUrl: `http://localhost:${Env.get('PORT')}/github/callback`,
  },
  linkedin: {
    driver: 'linkedin',
    clientId: Env.get('LINKEDIN_CLIENT_ID'),
    clientSecret: Env.get('LINKEDIN_CLIENT_SECRET'),
    callbackUrl: `http://localhost:${Env.get('PORT')}/linkedin/callback`,
  },
  twitter: {
    driver: 'twitter',
    clientId: Env.get('TWITTER_API_KEY'),
    clientSecret: Env.get('TWITTER_APP_SECRET'),
    callbackUrl: `http://localhost:${Env.get('PORT')}/twitter/callback`,
  },
  facebook: {
    driver: 'facebook',
    clientId: Env.get('FACEBOOK_CLIENT_ID'),
    clientSecret: Env.get('FACEBOOK_CLIENT_SECRET'),
    callbackUrl: `http://localhost:${Env.get('PORT')}/facebook/callback`,
  },
  spotify: {
    driver: 'spotify',
    clientId: Env.get('SPOTIFY_CLIENT_ID'),
    clientSecret: Env.get('SPOTIFY_CLIENT_SECRET'),
    callbackUrl: `http://localhost:${Env.get('PORT')}/spotify/callback`,
  },
  twitch: {
    driver: 'twitch',
    clientId: Env.get('TWITCH_CLIENT_ID'),
    clientSecret: Env.get('TWITCH_CLIENT_SECRET'),
    callbackUrl: `http://localhost:${Env.get('PORT')}/twitch/callback`,
  },
}

export default allyConfig
