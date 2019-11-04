# Adonis Ally

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Appveyor][appveyor-image]][appveyor-url]
[![Coveralls][coveralls-image]][coveralls-url]

<img src="http://res.cloudinary.com/adonisjs/image/upload/q_100/v1497112678/adonis-purple_pzkmzt.svg" width="200px" align="right" hspace="30px" vspace="50px">

Adonis Ally is a 1st party authentication provider for AdonisJs apps. It gives you the functionality to authenticate users using social websites like **Facebook**, **Twitter**, **Google**, **Github** etc :evergreen_tree:

## <a name="setup"></a> Setup

The setup process is simple like any other provider for AdonisJs.

#### Install Via Npm
```bash
adonis install @adonisjs/ally
```

#### Register The Provider

The provider needs to be registered inside `start/app.js` file.

```javascript
const providers = [
  '@adonisjs/ally/providers/AllyProvider'
]
```

BOOM! Now you are good to make use of the ally provider and authenticate your users via available drivers.

<br>
## <a name="available-drivers"></a> Available Drivers
Below is the list of available drivers and you are free to add more.

1. Facebook
2. Github
3. Google
4. LinkedIn
5. Twitter
6. Instagram
7. Foursquare

<br>
## <a name="config"></a> Config

Configuration is defined inside a file called `config/services.js` under `ally` object.

#### config/services.js

```javascript
ally: {
  facebook: {
    clientId: '',
    clientSecret: '',
    redirectUri: ''
  }
}
```

<br>
## <a name="getting-started"></a> Getting Started

Below is the list of methods you can make use of to redirect the user and fetch their profile details.

#### getRedirectUrl()

Get the redirect url for the 3rd party website.

```javascript
const url = await ally.driver('facebook').getRedirectUrl()
```

#### redirect

Redirect to the 3rd party website.

```javascript
await ally.driver('facebook').redirect()
```

#### getUser

Get the user details on the redirect URL.

```javascript
const user = await ally.driver('facebook').getUser()
```

If you are working with api and you have an OAuth2 access token you can get the user calling the `getUserByToken` method.

```javascript
const user = await ally.driver('facebook').getUserByToken(accessToken)
```

When you have a OAuth1 access token and Access secret key you can call

```javascript
const user = await ally.driver('facebook').getUserByToken(accessToken, accessSecret)
```

All this methods the `user` is an instance of `AllyUser` which has following methods to access the user details.
>>>>>>> e7f272b... get user from access token

```javascript
user.getId() // user id
user.getName() // get user name
user.getEmail() // get user email address
user.getNickname() // get user nick name
user.getAvatar() // get user profile picture url
user.getAccessToken() // get access token
user.getRefreshToken() // get refresh token (only when using OAuth2)
user.getExpires() // get access token expiry (only when using OAuth2)
user.getTokenSecret() // get token secret (only when using OAuth1)
```

#### Additional Methods

```javascript
user.toJSON() // get user JSON representation
user.getOriginal() // get the original response object from 3rd party website
```

:point_right: [Read the Official Documentation](http://adonisjs.com/docs/social-auth)

<br>

## Moving Forward
Checkout the [official documentation](http://adonisjs.com/docs/ioc-container) at the AdonisJs website for more info.

## Tests
Tests are written using [japa](http://github.com/thetutlage/japa). Run the following commands to run tests.

```bash
npm run test:local

# report coverage
npm run test

# on windows
npm run test:win
```

## Release History

Checkout [CHANGELOG.md](CHANGELOG.md) file for release history.

## Meta

AdonisJs – [@adonisframework](https://twitter.com/adonisframework) – virk@adonisjs.com

Checkout [LICENSE.md](LICENSE.md) for license information

Harminder Virk (Aman) - [https://github.com/thetutlage](https://github.com/thetutlage)


[appveyor-image]: https://img.shields.io/appveyor/ci/thetutlage/adonis-ally/master.svg?style=flat-square

[appveyor-url]: https://ci.appveyor.com/project/thetutlage/adonis-ally

[npm-image]: https://img.shields.io/npm/v/@adonisjs/ally.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@adonisjs/ally

[travis-image]: https://img.shields.io/travis/adonisjs/adonis-ally/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/poppinss/adonis-ally

[coveralls-image]: https://img.shields.io/coveralls/adonisjs/adonis-ally/develop.svg?style=flat-square

[coveralls-url]: https://coveralls.io/github/adonisjs/adonis-ally
