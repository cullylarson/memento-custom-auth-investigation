# Memento Custom Auth

> A proof of concept for handling auth.

## Setup

```
git clone ...
yarn install
cp .env .env.local
# Set the two environment variables to the values you're using for
# memento-client, in dev

yarn start
open localhost:3000
```

## Notes

Click "Login". Use your memento staging username/password. After that you should be able to view the two password protected pages (linked on the home page). If you click Logout on one of those pages, you'll be redirected to the login page.

There's a bit of extra work for any of the SWR hooks; you have pass a getAccessToken to the fetcher. See [useFetcher](https://github.com/cullylarson/memento-custom-auth-investigation/blob/main/client/lib/fetcher.ts) for an example. useFetcher also abstracts that "extra work", so it shouldn't need to be repeated in other hooks. But the logic is mostly really simple. Everything reacts to events like logging out (manually or if the refresh token expires). No need to await or check isLoading while auth is checked because the page won't render until the auth check is done.

All of the auth stuff is done through [AuthProvider](https://github.com/cullylarson/memento-custom-auth-investigation/blob/main/client/app/AuthProvider.tsx).

I created a demo [API endpoint](https://github.com/cullylarson/memento-custom-auth-investigation/blob/main/pages/api/dummy.ts). We likely won't use the Next API, but it simulates a memento-api endpoint by doing a rudimentary auth check (just makes sure a token is provided and isn't expired).

To note, the is just a rough demo. It doesn't really do anything to respond to errors.
