import path from 'node:path';
import { Adapter } from '@auth/core/adapters';
import { CollectionOptions } from '@battis/lazy-firestore';
import { Firestore } from '@google-cloud/firestore';
import {
  AdapterAccounts,
  AdapterAccountsCollection
} from './AdapterAccounts.js';
import { AdapterAuthenticators } from './AdapterAuthenticators.js';
import {
  AdapterSessions,
  AdapterSessionsCollection
} from './AdapterSessions.js';
import { AdapterUsers, AdapterUsersCollection } from './AdapterUsers.js';
import {
  VerificationTokens,
  VerificationTokensCollection
} from './VerificationTokens.js';

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
    ...AdapterUsers({
      db,
      path: path.join(
        /*turbopackIgnore: true*/ basePath,
        usersPath || AdapterUsersCollection.DEFAULT.path
      )
    }),
    ...AdapterAccounts({
      db,
      path: path.join(
        /*turbopackIgnore: true*/ basePath,
        accountsPath || AdapterAccountsCollection.DEFAULT.path
      )
    }),
    ...AdapterSessions({
      db,
      path: path.join(
        /*turbopackIgnore: true*/ basePath,
        sessionsPath || AdapterSessionsCollection.DEFAULT.path
      )
    }),
    ...VerificationTokens({
      db,
      path: path.join(
        /*turbopackIgnore: true*/ basePath,
        verificationTokensPath || VerificationTokensCollection.DEFAULT.path
      )
    }),
    ...AdapterAuthenticators({
      db,
      path: path.join(
        /*turbopackIgnore: true*/ basePath,
        authenticatorsPath || AdapterAccountsCollection.DEFAULT.path
      )
    })
  };
}
