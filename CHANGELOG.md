<a name="2.1.0"></a>
# [2.1.0](https://github.com/adonisjs/adonis-ally/compare/v2.0.5...v2.1.0) (2018-09-29)


### Code Refactoring

* **expose scope and fields as public properties:** all drivers now allows mutating scopes and f ([0ac72ca](https://github.com/adonisjs/adonis-ally/commit/0ac72ca))


### Features

* add state when performing oauth ([c3d2689](https://github.com/adonisjs/adonis-ally/commit/c3d2689)), closes [#2](https://github.com/adonisjs/adonis-ally/issues/2)


### BREAKING CHANGES

* **expose scope and fields as public properties:** Anyone using the driver instance directly now have to mutate scope array directly
vs passing scope array to getRedireUrl method and mutate fields array directly vs passing fields
array to getUser method



<a name="2.0.5"></a>
## [2.0.5](https://github.com/adonisjs/adonis-ally/compare/v2.0.4...v2.0.5) (2018-07-16)



<a name="2.0.4"></a>
## [2.0.4](https://github.com/adonisjs/adonis-ally/compare/v2.0.3...v2.0.4) (2018-06-10)


### Bug Fixes

* **allyuser:** cast expires to number only when defined ([0382b30](https://github.com/adonisjs/adonis-ally/commit/0382b30))


### Features

* **authenticator:** allow accessing user using oauth token ([f605f73](https://github.com/adonisjs/adonis-ally/commit/f605f73))
* **oauth2:** update oauth2 drivers for user access ([1d99793](https://github.com/adonisjs/adonis-ally/commit/1d99793))



<a name="2.0.3"></a>
## [2.0.3](https://github.com/adonisjs/adonis-ally/compare/v2.0.1...v2.0.3) (2018-06-02)


### Bug Fixes

* **drivers:** set token expiration to null when doesn't exists ([404d090](https://github.com/adonisjs/adonis-ally/commit/404d090)), closes [#47](https://github.com/adonisjs/adonis-ally/issues/47)
* **lint:** fix linting issue ([2b0795a](https://github.com/adonisjs/adonis-ally/commit/2b0795a))
* **package:** update got to version 8.0.0 ([#31](https://github.com/adonisjs/adonis-ally/issues/31)) ([7e21557](https://github.com/adonisjs/adonis-ally/commit/7e21557))
* **twitter:** inverse nickname & username ([#43](https://github.com/adonisjs/adonis-ally/issues/43)) ([0ec3b35](https://github.com/adonisjs/adonis-ally/commit/0ec3b35))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/adonisjs/adonis-ally/compare/v2.0.1...v2.0.2) (2017-10-29)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/adonisjs/adonis-ally/compare/v2.0.0...v2.0.1) (2017-08-30)


### Bug Fixes

* **provider:** bind manager to ioc.manager ([adedb80](https://github.com/adonisjs/adonis-ally/commit/adedb80))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/adonisjs/adonis-ally/compare/v1.1.2...v2.0.0) (2017-08-27)


### Bug Fixes

* **lint:** lint code properly ([0d59350](https://github.com/adonisjs/adonis-ally/commit/0d59350))


### Features

* **instructions:** add instructions files ([54fcb52](https://github.com/adonisjs/adonis-ally/commit/54fcb52))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/adonisjs/adonis-ally/compare/v1.1.1...v1.1.2) (2017-02-26)


### Bug Fixes

* **provider:** ioc.manager does not expects the callback ([7f49860](https://github.com/adonisjs/adonis-ally/commit/7f49860)), closes [#15](https://github.com/adonisjs/adonis-ally/issues/15)



<a name="1.1.1"></a>
## [1.1.1](https://github.com/adonisjs/adonis-ally/compare/v1.1.0...v1.1.1) (2017-02-25)


### Bug Fixes

* **provider:** bind manager to be extended from outside world ([16e90af](https://github.com/adonisjs/adonis-ally/commit/16e90af)), closes [#14](https://github.com/adonisjs/adonis-ally/issues/14)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/adonisjs/adonis-ally/compare/v1.0.0...v1.1.0) (2017-01-29)


### Bug Fixes

* **drivers:** pad month when less than zero ([31dac59](https://github.com/adonisjs/adonis-ally/commit/31dac59))


### Features

* **driver:** add instagram driver ([3d5ca8f](https://github.com/adonisjs/adonis-ally/commit/3d5ca8f))
* **social-auth:** create foursquare driver ([8fb43bb](https://github.com/adonisjs/adonis-ally/commit/8fb43bb))



<a name="1.0.0"></a>
# 1.0.0 (2016-11-05)


### Features

* **init:** initiate a new project ([ba2b640](https://github.com/adonisjs/adonis-ally/commit/ba2b640))



