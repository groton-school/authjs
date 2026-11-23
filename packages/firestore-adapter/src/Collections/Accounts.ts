import { Adapter, AdapterAccount, AdapterUser } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { requireUnique } from '@battis/lazy-firestore/directives/requireUnique';
import { CollectionReference } from '@google-cloud/firestore';
import { users } from './Users.js';

type AccountsAdapterTemplate = {
  linkAccount: NonNullable<Adapter['linkAccount']>;
  getAccount: NonNullable<Adapter['getAccount']>;
  getUserByAccount: NonNullable<Adapter['getUserByAccount']>;
  unlinkAccount: NonNullable<Adapter['unlinkAccount']>;
};

export class Accounts extends Collection<AdapterAccount> {
  public static readonly DEFAULT = { path: 'accounts' };
}

export function AccountsAdapter(
  {
    path = Accounts.DEFAULT.path,
    ...options
  }: CollectionOptions = Accounts.DEFAULT
) {
  const accounts = new Accounts({ path, ...options });

  async function getAccount(
    providerAccountId: AdapterAccount['providerAccountId'],
    provider: AdapterAccount['provider']
  ): Promise<AdapterAccount | null> {
    return requireUnique({
      list: await accounts.list({
        ...identify({ provider, providerAccountId }),
        strict: false
      }),
      strict: false
    }).data;
  }

  return {
    linkAccount: async (
      account: AdapterAccount
    ): Promise<AdapterAccount | null> =>
      (
        await accounts.create({
          ...identify(account),
          data: account,
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
      const account = await getAccount(providerAccountId, provider);
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
  } satisfies AccountsAdapterTemplate;
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
