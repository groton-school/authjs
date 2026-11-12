import { AdapterAuthenticator } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { DateConverter } from '@battis/lazy-firestore/converters/Date';

class AdapterAuthenticatorsCollection extends Collection<AdapterAuthenticator> {
  public static readonly DEFAULT = { path: 'authenticators' };

  public constructor(options: CollectionOptions) {
    super({ ...options, converter: { expires: DateConverter } });
  }
}

export function AdapterAuthenticators(
  {
    path = AdapterAuthenticatorsCollection.DEFAULT.path,
    ...options
  }: CollectionOptions = AdapterAuthenticatorsCollection.DEFAULT
) {
  const authenticators = new AdapterAuthenticatorsCollection({
    path,
    ...options
  });
  return {
    getAuthenticator: async (
      id: AdapterAuthenticator['credentialID']
    ): Promise<AdapterAuthenticator | null> =>
      (await authenticators.read({ id, strict: false })).data,
    createAuthenticator: async (
      data: AdapterAuthenticator
    ): Promise<AdapterAuthenticator> =>
      (
        await authenticators.create({
          data,
          id: data.credentialID,
          strict: true
        })
      ).data,
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
  };
}
