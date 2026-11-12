# @groton/authjs-veracross-provider

next-auth/Auth.js Provider for Veracross SSO

## Install

```bash
pnpm create next-app path/to/project
cd path/to/project
pnpm install next-auth@beta @groton/authjs-veracros-provider
```

## Configure

In Axiom, create an OAuth 2.0 app. The credentials can be passed to next-auth/Auth.js in a variety of ways.

### Environment Variables

| Name                    | Purpose                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `AUTH_VERACROSS_ID`     | The OAuth 2.0 client ID                                                                |
| `AUTH_VERACROSS_SECRET` | The OAuth 2.0 client secret                                                            |
| `AUTH_VERACROSS_ROUTE`  | The Veracross school route (e.g `example` in `https://axiom.veracross.com/example/#/`) |

If the provider is intialized with a custom `id` value, that will replace `VERACROSS` in the variable names. For example:

```ts
import Veracross from '@groton/authjs-veracross-provider';
import NextAuth from 'next-auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Veracross({ id: 'example' })]
});
```

…would require `AUTH_EXAMPLE_ID`, `AUTH_EXAMPLE_SECRET` and `AUTH_EXAMPLE_ROUTE`.

### Inline definitions

```ts
import Veracross from '@groton/authjs-veracross-provider';
import NextAuth from 'next-auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Veracross({
      id: 'example',
      name: 'Example Academy',
      schoolRoute: 'ea',
      style: {
        brandColor: '#eeeeee',
        logo: 'https://example.com/logo.svg'
      },
      authorization: {
        params: {
          scope: 'sso'
        }
      }
    })
  ]
});
```

| Property                     | Default               | Notes                                                                                                                                                                                                                                                                                                         |
| ---------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                         | `"veracross"`         | Identifies the provider uniquely within the app -- multiple instances of the Veracross provider could be provided with differing configurations so long as they have different `id` values. When configuration is provided from environment variables, `id` in `CONSTANT_CASE` is used to name the variables. |
| `name`                       | `"Veracross"`         | Human-readable text used to identify the provider on the sign in page. If a custom `id` is provided but no `name`, the `name` will default to the `Title Case` of the `id` (`id` = `groton` &rarr; `name` = `Groton`).                                                                                        |
| `schoolRoute`                | `undefined`           | If no value is provied inline or as an environment variable (see above), `schoolRoute` defaults to the `id` value)                                                                                                                                                                                            |
| `style.brandColor`           | Veracross blue        | Used in highlights for the provider link on the sign in page                                                                                                                                                                                                                                                  |
| `style.logo`                 | URL of Veracross logo | URL of a logo image to use on the sign in page                                                                                                                                                                                                                                                                |
| `authorization.params.scope` | `"openid"`            | The scopes to request when signing in as the user. `openid` and `sso` will not require user approval, all others will require interactive approval by the user.                                                                                                                                               |

## Use

###### `/auth.ts`

```ts
import Veracross from '@groton/authjs-veracross-provider';
import NextAuth from 'next-auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Veracross]
});
```

###### `app/path/to/auth/[...nextauth]/route.ts`

```ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

###### `app/path/to/authenticated/area/layout.tsx`

One approach to securing an entire hierarchy with next-auth.

```tsx
import { auth, signIn } from '@/auth';

type Props = LayoutProps<'/path/to/authenticated/area'>;

export default function Layout(props: Props) {
  return (
    <Suspense>
      <SessionCheck {...props} />
    </Suspense>
  );
}

async function SessionCheck({ children }: Props) {
  const session = await auth();
  if (session?.user) {
    return children;
  }
  await signIn();
}
```

## Resources

- [Veracross SSO documentation](https://api-docs.veracross.com/docs/docs/5fb9f96bc480a-creating-an-sso-integration#step-5-request-user-info-with-the-access-token)
- [Veracross Oauth SSO Login Flow](https://api-docs.veracross.com/docs/docs/6ceadcca9ad7f-diagram-o-auth-sso-login-flow)
