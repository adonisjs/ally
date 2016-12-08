# Adonis Ally

<p>
  <a href="https://www.npmjs.com/package/adonis-ally"><img src="https://img.shields.io/npm/v/adonis-ally.svg?style=flat-square" alt="Version"></a>
  <a href="https://travis-ci.org/adonisjs/adonis-ally"><img src="https://img.shields.io/travis/adonisjs/adonis-ally/master.svg?style=flat-square" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/adonis-ally"><img src="https://img.shields.io/npm/dt/adonis-ally.svg?style=flat-square" alt="Downloads"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/npm/l/adonis-ally.svg?style=flat-square" alt="License"></a>
</p>

<p>
  <a href="https://gitter.im/adonisjs/adonis-framework"><img src="https://img.shields.io/badge/gitter-join%20us-1DCE73.svg?style=flat-square" alt="Gitter"></a>
  <a href="https://trello.com/b/yzpqCgdl/adonis-for-humans"><img src="https://img.shields.io/badge/trello-roadmap-89609E.svg?style=flat-square" alt="Trello"></a>
  <a href="https://www.patreon.com/adonisframework"><img src="https://img.shields.io/badge/patreon-support%20AdonisJs-brightgreen.svg?style=flat-square" alt="Support AdonisJs"></a>
</p>

<br>

Adonis Ally is a 1st party authentication provider for AdonisJs apps. It gives you the functionality to authenticate users using social websites like **Facebook**, **Twitter**, **Google**, **Github** etc :evergreen_tree:

<br>
<hr>
<br>

## Table of Contents

* [Setup](#setup)
* [Available Drivers](#available-drivers)
* [Config](#config)
* [Getting Started](#getting-started)
* [Contribution Guidelines](#contribution-guidelines)

<br>
## <a name="setup"></a>Setup

The setup process is simple like any other provider for AdonisJs.

#### Install Via Npm
```bash
npm i --save adonis-ally
```

#### Register The Provider

The provider needs to be registered inside `bootstrap/app.js` file.

```javascript
const providers = [
  'adonis-ally/providers/AllyProvider'
]
```

#### Register The Middleware
A global needs to be added in order to make use of ally. The attaches a key called `ally` to the `request` object.

**app/Http/kernel.js**

```javascript
const globalMiddleware = [
  'Adonis/Middleware/Ally'
]
```

BOOM! Now you are good to make use of the ally provider and authenticate your users via available drivers.

<br>
## <a name="available-drivers"></a>Available Drivers
Below is the list of available drivers and you are free to add more.

1. Discord
2. Facebook
3. Github
4. Google
5. LinkedIn
6. Twitter

<br>
## <a name="config"></a>Config

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
## <a name="getting-started"></a>Getting Started

Below is the list of methods you can make use of to redirect the user and fetch their profile details.

#### getRedirectUrl()

Get the redirect url for the 3rd party website.

```javascript
const url = yield request.ally.driver('facebook').getRedirectUrl()
```

#### redirect

Redirect to the 3rd party website.

```javascript
yield request.ally.driver('facebook').redirect()
```

#### getUser

Get the user details on the redirect URL.

```javascript
const user = yield request.ally.driver('facebook').getUser()
```

The `user` is an instance of `AllyUser` which has following methods to access the user details.

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
## <a name="contribution-guidelines"></a>Contribution Guidelines

In favor of active development we accept contributions from everyone. You can contribute by submitting a bug, creating pull requests or even improving documentation.

You can find a complete guide to be followed strictly before submitting your pull requests in the [Official Documentation](http://adonisjs.com/docs/contributing).
