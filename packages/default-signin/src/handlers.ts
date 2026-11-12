import { NextAuthResult } from 'next-auth'; // TODO decouple from next-auth
                                            // Issue URL: https://github.com/groton-school/authjs/issues/1

interface Options {
  signIn: NextAuthResult['signIn'];
  providerId: string;
}

export function handlers({ signIn, providerId }: Options) {
  return {
    GET: async (req: Request) => {
      const redirectTo = new URL(req.url).searchParams.get('redirect') || '/';
      return Response.redirect(
        await signIn(providerId, { redirectTo, redirect: false })
      );
    }
  };
}
