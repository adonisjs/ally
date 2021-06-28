The package has been configured successfully. The configuration is stored inside the `config/ally.ts` file.

## Validating environment variables
Ally config relies on environment variables for the client id and secret. We recommend you to validate environment variables inside the `env.ts` file.

### Variables for Discord provider

```ts
DISCORD_CLIENT_ID: Env.schema.string(),
DISCORD_CLIENT_SECRET: Env.schema.string(),
```

### Variables for Google provider

```ts
GOOGLE_CLIENT_ID: Env.schema.string(),
GOOGLE_CLIENT_SECRET: Env.schema.string(),
```

### Variables for Twitter provider

```ts
TWITTER_CLIENT_ID: Env.schema.string(),
TWITTER_CLIENT_SECRET: Env.schema.string(),
```

### Variables for Github provider

```ts
GITHUB_CLIENT_ID: Env.schema.string(),
GITHUB_CLIENT_SECRET: Env.schema.string(),
```

### Variables for Facebook provider

```ts
FACEBOOK_CLIENT_ID: Env.schema.string(),
FACEBOOK_CLIENT_SECRET: Env.schema.string(),
```

### Variables for Spotify provider

```ts
SPOTIFY_CLIENT_ID: Env.schema.string(),
SPOTIFY_CLIENT_SECRET: Env.schema.string(),
```
