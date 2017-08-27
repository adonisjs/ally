## Registering provider

The provider will be registered inside `start/app.js` file.

```js
const providers = [
  '@adonisjs/ally/providers/AllyProvider'
]
```

That's all!

## Usage

Now you can access, the `ally` object on each HTTP request

```js
Route.get('facebook', async ({ ally }) => {
  await ally.driver('facebook').redirect()
})

Route.get('facebook/authenticated', async ({ ally }) => {
  const user = await ally.driver('facebook').getUser()

  return user
})
```
