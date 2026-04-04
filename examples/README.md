- google: trust provider verification
- github: trust only if your actual returned data confirms verified email
- discord: likely trustable, but confirm exact returned field via Ally/user payload
- linkedin_openid_connect: do not treat as verified-email proof
- spotify: do not trust
- facebook: do not trust by default
- twitter/x: do not trust by default

- google
  Returns an explicit email_verified claim in OIDC.
  Trust signal: verified
  Source: https://developers.google.com/identity/openid-connect/openid-connect
  (https://developers.google.com/identity/openid-connect/openid-connect)
- github
  GitHub has a real verified-email concept on the platform, but OAuth app integrations should treat verification carefully
  and still use the GitHub id as identity.
  Trust signal: can be treated as verified only if your integration is actually receiving verified email information from
  GitHub’s user/email APIs.
  Sources:

https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/verifying-your-email-address

(https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/verifying-your-email-address)
  https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/best-practices-for-creating-an-oauth-app
  (https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/best-practices-for-creating-an-oauth-app)
- discord
  Discord’s user payload includes verified for the user email in the user object.
  Trust signal: verified is available.
  Public source I found is not ideal official API reference quality, but it does reflect the field:
  https://docs.discord.com/developers/change-log (https://docs.discord.com/developers/change-log)
  I would still verify against the exact Ally driver behavior before relying on it.
- facebook
  I could not find a clean current official Facebook Login doc that exposes a standard email-verification signal you should
  rely on in the normal login profile payload.
  Trust signal: unsupported/unclear
  Recommendation: do not trust email verification by default for standard Facebook login unless you confirm it from current
  official docs.
- linkedin_openid_connect
  LinkedIn’s own OIDC sign-in docs explicitly say Sign In with LinkedIn “does not verify user identities and should not be
  marketed as such.”
  Trust signal: not suitable as a verified-identity signal
  Source:

https://learn.microsoft.com/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2?context=linkedin%2Fconsumer%2Fcontext

(https://learn.microsoft.com/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2?context=linkedin%2Fconsumer%2Fcontext)
- spotify
  Spotify explicitly says the email from /me is unverified and there is no proof it belongs to the user.
  Trust signal: unverified
  Source: https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
  (https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile)
- twitter / x
  X lets apps request email access, but I did not find an official doc saying the returned email carries a trustworthy
  verification-state claim for OAuth sign-in purposes.
  Trust signal: unsupported/unclear
  Source for email access existing at all:

https://developer.x.com/en/docs/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials.html

(https://developer.x.com/en/docs/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials.html)
