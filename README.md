<p align="center">
  <a href="http://adonisjs.com/docs/social-auth"><img src="https://cloud.githubusercontent.com/assets/2793951/20224125/46e331e0-a83d-11e6-8207-976245e56b33.png" alt="AdonisJs Ally"></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/adonis-ally"><img src="https://img.shields.io/npm/v/adonis-ally.svg?style=flat-square" alt="Version"></a>
  <a href="https://travis-ci.org/adonisjs/adonis-ally"><img src="https://img.shields.io/travis/adonisjs/adonis-ally/master.svg?style=flat-square" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/adonis-ally"><img src="https://img.shields.io/npm/dt/adonis-ally.svg?style=flat-square" alt="Downloads"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/npm/l/adonis-ally.svg?style=flat-square" alt="License"></a>
</p>

<p align="center">
  <a href="https://gitter.im/adonisjs/adonis-framework"><img src="https://img.shields.io/badge/gitter-join%20us-1DCE73.svg?style=flat-square" alt="Gitter"></a>
  <a href="https://trello.com/b/yzpqCgdl/adonis-for-humans"><img src="https://img.shields.io/badge/trello-roadmap-89609E.svg?style=flat-square" alt="Trello"></a>
  <a href="https://www.patreon.com/adonisframework"><img src="https://img.shields.io/badge/patreon-support%20AdonisJs-brightgreen.svg?style=flat-square" alt="Support AdonisJs"></a>
</p>

<br>

Adonis Ally is a 1st party authentication provider that gives you the functionality to authenticate users using social websites including **Facebook**, **Twitter**, **Google**, **LinkedIn** or **Github** in any AdonisJs application. :evergreen_tree:

<br>
<hr>
<br>

## Table of Contents

* [Available Drivers](#available-drivers)
* [Config](#config)
* [Getting Started](#getting-started)
* [Contribution Guidelines](#contribution-guidelines)

<br>
## <a name="available-drivers"></a>Available Drivers
Below is the list of available drivers and you are free to add more.

1. Facebook
2. Github
3. Google
4. LinkedIn
5. Twitter

<br>
## <a name="config"></a>Config

Configuration is defined inside a file called `config/services.js` under `ally` object.

```javascript
// config/services.js
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

The setup process is simple like any other provider for AdonisJs.

#### Install Via Npm
```bash
npm i --save adonis-ally
```

#### Register The Provider

The provider needs to be registered inside `bootstrap/app.js` file.

```javascript
const providers = [
  // ...
  'adonis-ally/providers/AllyProvider'
  // ...
]
```

#### Register The Middleware
A global middleware needs to be added in order to make use of ally. It will attach a key called `ally` to the `request` object.

```javascript
// app/Http/kernel.js
const globalMiddleware = [
  // ...
  'Adonis/Middleware/Ally'
  //...
]
```

BOOM! Now you are good to make use of the ally provider and authenticate your users via available drivers. :rocket:

:point_right: [Read the Official Documentation](http://adonisjs.com/docs/social-auth)

<br>
## <a name="contribution-guidelines"></a>Contribution Guidelines

In favor of active development we accept contributions from everyone. You can contribute by submitting a bug, creating pull requests or even improving documentation.

You can find a complete guide to be followed strictly before submitting your pull requests in the [Official Documentation](http://adonisjs.com/docs/contributing).
