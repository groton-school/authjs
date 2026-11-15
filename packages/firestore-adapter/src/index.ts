import path from 'node:path';
import { Adapter } from '@auth/core/adapters';
import { CollectionOptions } from '@battis/lazy-firestore';
import { Firestore } from '@google-cloud/firestore';
import { Accounts, AccountsAdapter } from './Collections/Accounts.js';
import { AuthenticatorsAdapter } from './Collections/Authenticators.js';
import { Sessions, SessionsAdapter } from './Collections/Sessions.js';
import { Users, UsersAdapter } from './Collections/Users.js';
import {
  VerificationTokens,
  VerificationTokensAdapter
} from './Collections/VerificationTokensAdapter.js';

interface Options extends Omit<CollectionOptions, 'path'> {
  basePath?: string;
  usersPath?: string;
  accountsPath?: string;
  sessionsPath?: string;
  verificationTokensPath?: string;
  authenticatorsPath?: string;
}

export function FirestoreAdapter({
  db,
  databaseId,
  basePath = '.',
  usersPath,
  accountsPath,
  sessionsPath,
  verificationTokensPath,
  authenticatorsPath,
  firestore
}: Options = {}): Adapter {
  db = db || new Firestore({ databaseId, ...firestore });
  return {
    ...UsersAdapter({
      db,
      path: path.join(
        /*turbopackIgnore: true*/ basePath,
        usersPath || Users.DEFAULT.path
      )
    }),
    ...AccountsAdapter({
      db,
      path: path.join(
        /*turbopackIgnore: true*/ basePath,
        accountsPath || Accounts.DEFAULT.path
      )
    }),
    ...SessionsAdapter({
      db,
      path: path.join(
        /*turbopackIgnore: true*/ basePath,
        sessionsPath || Sessions.DEFAULT.path
      )
    }),
    ...VerificationTokensAdapter({
      db,
      path: path.join(
        /*turbopackIgnore: true*/ basePath,
        verificationTokensPath || VerificationTokens.DEFAULT.path
      )
    }),
    ...AuthenticatorsAdapter({
      db,
      path: path.join(
        /*turbopackIgnore: true*/ basePath,
        authenticatorsPath || Accounts.DEFAULT.path
      )
    })
  };
}
