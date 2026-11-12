import { NextAuthRequest } from 'next-auth'; // TODO decouple from next-auth
                                             // Issue URL: https://github.com/groton-school/authjs/issues/2

export function proxy(apiPath: string) {
  return (req: Request & NextAuthRequest) => {
    if (!req.auth?.user) {
      return Response.redirect(
        new URL(`${apiPath}?redirect=${encodeURIComponent(req.url)}`, req.url)
      );
    }
  };
}
