# @groton/authjs-default-signin

Transparently direct users to a default Auth.js provider

## Install

```bash
pnpm create next-app path/to/project
cd path/to/project
pnpm install next-auth@beta @groton/authjs-default-signin
```

## Use

###### `app/path/to/endpoint/route.ts`

```ts
import { signIn } from '@/auth';
import { handlers } from '@groton/authjs-default-signin';

// replace <provider-id> with the desired default (e.g. 'google')
export const { GET } = handlers({ signIn, providerId: '<provider-id>' });
```

###### `proxy.ts`

```ts
import { auth } from '@/auth';
import { proxy } from '@groton/authjs-default-signin';

// wrap the default-signin proxy in the auth session
export default auth(proxy('/path/to/endpoint'));
å;

// default matches for authenticated paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```
