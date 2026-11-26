import { Adapter, AdapterAccount, AdapterUser } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { EncryptedString } from '@battis/lazy-firestore/converters/EncryptedString';
import { requireUnique } from '@battis/lazy-firestore/directives/requireUnique';
import { CollectionReference } from '@google-cloud/firestore';
import { users } from './Users.js';

type AccountsAdapterTemplate = {
  linkAccount: NonNullable<Adapter['linkAccount']>;
  getAccount: NonNullable<Adapter['getAccount']>;
  getUserByAccount: NonNullable<Adapter['getUserByAccount']>;
  unlinkAccount: NonNullable<Adapter['unlinkAccount']>;
};

interface Options extends CollectionOptions {
  password?: string;
  salt?: string;
}

export class Accounts extends Collection<AdapterAccount> {
  public static readonly DEFAULT = { path: 'accounts' };
  public constructor(
    {
      path = Accounts.DEFAULT.path,
      password,
      salt,
      converter,
      ...options
    }: Options = Accounts.DEFAULT
  ) {
    super({
      path,
      ...options,
      converter: {
        ...converter,
        ...(password && salt
          ? {
              access_token: EncryptedString({ password, salt }),
              refresh_token: EncryptedString({ password, salt })
            }
          : {})
      }
    });
  }
}

export function AccountsAdapter(
  { path = Accounts.DEFAULT.path, ...options }: Options = Accounts.DEFAULT
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
