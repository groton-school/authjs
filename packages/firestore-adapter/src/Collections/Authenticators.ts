import { Adapter, AdapterAuthenticator } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { DateConverter } from '@battis/lazy-firestore/converters/Date';

type AuthenticatorsAdapterTemplate = {
  createAuthenticator: NonNullable<Adapter['createAuthenticator']>;
  getAuthenticator: NonNullable<Adapter['getAuthenticator']>;
  listAuthenticatorsByUserId: NonNullable<
    Adapter['listAuthenticatorsByUserId']
  >;
  updateAuthenticatorCounter: NonNullable<
    Adapter['updateAuthenticatorCounter']
  >;
};

class Authenticators extends Collection<AdapterAuthenticator> {
  public static readonly DEFAULT = { path: 'authenticators' };

  public constructor(options: CollectionOptions) {
    super({ ...options, converter: { expires: DateConverter } });
  }
}

export function AuthenticatorsAdapter(
  {
    path = Authenticators.DEFAULT.path,
    ...options
  }: CollectionOptions = Authenticators.DEFAULT
) {
  const authenticators = new Authenticators({
    path,
    ...options
  });
  return {
    createAuthenticator: async (
      authenticator: AdapterAuthenticator
    ): Promise<AdapterAuthenticator> =>
      (
        await authenticators.create({
          data: authenticator,
          id: authenticator.credentialID,
          strict: true
        })
      ).data,
    getAuthenticator: async (
      id: AdapterAuthenticator['credentialID']
    ): Promise<AdapterAuthenticator | null> =>
      (await authenticators.read({ id, strict: false })).data,
    listAuthenticatorsByUserId: async (
      userId: AdapterAuthenticator['userId']
    ): Promise<AdapterAuthenticator[]> =>
      (
        await authenticators.list({
          query: (ref) => ref.where('userId', '==', userId)
        })
      ).map((doc) => doc.data),
    updateAuthenticatorCounter: async (
      credentialID: AdapterAuthenticator['credentialID'],
      newCounter: AdapterAuthenticator['counter']
    ): Promise<AdapterAuthenticator> =>
      (
        await authenticators.update({
          id: credentialID,
          patch: { counter: newCounter },
          strict: true
        })
      ).data
  } satisfies AuthenticatorsAdapterTemplate;
}
