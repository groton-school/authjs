import crypto from 'node:crypto';
import { Adapter, AdapterAccount } from '@auth/core/adapters';
import Credentials from '@auth/core/providers/credentials';
import { AdapterError } from './Errors/AdapterError.js';
import { ClaimError } from './Errors/ClaimError.js';
import { consumeClaims } from './InMemoryClaimStorage.js';

interface Options {
  id?: string;
  name?: string;
  adapter: Adapter;
}

export function LTIaaS({
  id = 'ltiaas',
  name = 'LTI as a Service',
  adapter
}: Options) {
  return Credentials({
    id,
    name,
    credentials: {},

    async authorize(credentials) {
      if ('key' in credentials && typeof credentials.key === 'string') {
        const claims = consumeClaims(credentials.key);
        let user;
        let needAccountLinking = false;
        let needUserCreation = false;
        if (claims?.iss && claims?.sub) {
          const providerAccountId = `${claims.iss}|${claims.sub}`;
          if (adapter.getAccount) {
            let account = await adapter.getAccount(providerAccountId, id);
            needAccountLinking = !account;
            if (account) {
              if (adapter.getUserByAccount) {
                user = await adapter.getUserByAccount(account);
              } else {
                throw new AdapterError('getUserByAccount');
              }
            }
          } else {
            throw new AdapterError('getAccount');
          }

          if (!user && claims.email) {
            if (adapter.getUserByEmail) {
              user = await adapter.getUserByEmail(claims.email);
              needUserCreation = !user;
            } else {
              throw new AdapterError('getUserByEmail');
            }
          }
          if (needUserCreation) {
            if (claims.email) {
              if (adapter.createUser) {
                user = await adapter.createUser({
                  id: crypto.randomUUID(),
                  name: claims.name,
                  email: claims.email,
                  emailVerified: null
                });
              } else {
                throw new AdapterError('createUser');
              }
            } else {
              throw new ClaimError('email');
            }
          }
          if (needAccountLinking && user) {
            if (adapter.linkAccount) {
              await adapter.linkAccount({
                provider: id,
                providerAccountId,
                userId: user.id,
                type: 'credentials/lti',
                claims: { ...claims, nonce: undefined }
              } as unknown as AdapterAccount);
            } else {
              throw new AdapterError('linkAccount');
            }
          }
          return user ?? null;
        } else {
          if (!claims?.iss) {
            throw new ClaimError('iss');
          }
          if (!claims.sub) {
            throw new ClaimError('sub');
          }
        }
      }
      return null;
    }
  });
}
