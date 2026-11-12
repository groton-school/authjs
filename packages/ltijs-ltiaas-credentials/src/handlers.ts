import { AdapterAccount } from '@auth/core/adapters';
import { LTIaaSManager, LTIaaSRedirect } from '@groton/ltijs-ltiaas';
import type { NextAuthResult } from 'next-auth'; // TODO decouple from next-auth
import { saveClaims } from './InMemoryClaimStorage.js';

interface Options {
  signIn: NextAuthResult['signIn'];
  ltiaasManager: LTIaaSManager;
  providerId?: AdapterAccount['provider'];
  redirector?: LTIaaSRedirect;
}

export function handlers({
  signIn,
  ltiaasManager,
  providerId = 'ltiaas',
  redirector = new LTIaaSRedirect()
}: Options) {
  return {
    GET: async (req: Request) => {
      const token = new URL(req.url).searchParams.get(redirector.queryParam());
      if (token) {
        const ltiaasToken = await ltiaasManager.consumeLTIaaSToken(token);
        if (ltiaasToken) {
          const { claims, redirectTo } = ltiaasToken;
          const key = saveClaims(claims);
          await signIn(providerId, {
            key,
            redirectTo
          });
        }
      } else {
        throw new Error('Missing LTIaaS token');
      }
    }
  };
}
