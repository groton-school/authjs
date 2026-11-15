import { AdapterAccount, AdapterUser } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { requireUnique } from '@battis/lazy-firestore/directives/requireUnique';
import { CollectionReference } from '@google-cloud/firestore';
import { users } from './AdapterUsers.js';

export class AdapterAccountsCollection extends Collection<AdapterAccount> {
  public static readonly DEFAULT = { path: 'accounts' };
}

export function AdapterAccounts(
  {
    path = AdapterAccountsCollection.DEFAULT.path,
    ...options
  }: CollectionOptions = AdapterAccountsCollection.DEFAULT
) {
  const accounts = new AdapterAccountsCollection({ path, ...options });
  const getAccount = async (
    providerAccountId: AdapterAccount['providerAccountId'],
    provider: AdapterAccount['provider']
  ): Promise<AdapterAccount | null> =>
    requireUnique({
      list: await accounts.list({
        ...identify({ provider, providerAccountId }),
        strict: false
      }),
      strict: false
    }).data;
  return {
    linkAccount: async (data: AdapterAccount): Promise<AdapterAccount | null> =>
      (
        await accounts.create({
          ...identify(data),
          data,
          strict: false
        })
      ).data,
    getAccount,
    getUserByAccount: async ({
      provider,
      providerAccountId
    }: Pick<
      AdapterAccount,
      'provider' | 'providerAccountId'
    >): Promise<AdapterUser | null> => {
      const account = await getAccount(provider, providerAccountId);
      if (account) {
        return (await users().read({ id: account.userId, strict: false })).data;
      }
      return null;
    },
    unlinkAccount: async (
      account: Pick<AdapterAccount, 'provider' | 'providerAccountId'>
    ): Promise<AdapterAccount | undefined> =>
      (
        await accounts.delete({
          ...identify(account),
          strict: false
        })
      ).data ?? undefined
  };
}

function identify({
  provider,
  providerAccountId
}: Pick<AdapterAccount, 'provider' | 'providerAccountId'>) {
  return {
    query: (ref: CollectionReference<AdapterAccount>) =>
      ref
        .where('provider', '==', provider)
        .where('providerAccountId', '==', providerAccountId)
  };
}
