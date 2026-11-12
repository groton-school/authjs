import { VerificationToken } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { DateConverter } from '@battis/lazy-firestore/converters/Date';
import { CollectionReference } from '@google-cloud/firestore';

export class VerificationTokensCollection extends Collection<VerificationToken> {
  public static readonly DEFAULT = { path: 'verificationTokens' };

  public constructor(options: CollectionOptions) {
    super({ ...options, converter: { expires: DateConverter } });
  }
}

export function VerificationTokens(
  {
    path = VerificationTokensCollection.DEFAULT.path,
    ...options
  }: CollectionOptions = VerificationTokensCollection.DEFAULT
) {
  const tokens = new VerificationTokensCollection({ path, ...options });
  return {
    createVerificationToken: async (
      data: VerificationToken
    ): Promise<VerificationToken | null> =>
      (await tokens.create({ data, ...identify(data), strict: false })).data,
    useVerificationToken: async (
      token: Pick<VerificationToken, 'identifier' | 'token'>
    ): Promise<VerificationToken | null> =>
      (await tokens.delete({ ...identify(token), strict: false })).data
  };
}

function identify({
  identifier,
  token
}: Pick<VerificationToken, 'identifier' | 'token'>) {
  return {
    query: (ref: CollectionReference<VerificationToken>) =>
      ref.where('identifier', '==', identifier).where('token', '==', token)
  };
}
