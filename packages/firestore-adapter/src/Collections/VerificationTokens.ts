import { Adapter, VerificationToken } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { DateConverter } from '@battis/lazy-firestore/converters/Date';
import { CollectionReference } from '@google-cloud/firestore';

type VerificationTokensAdapterTemplate = {
  createVerificationToken: NonNullable<Adapter['createVerificationToken']>;
  useVerificationToken: NonNullable<Adapter['useVerificationToken']>;
};

export class VerificationTokens extends Collection<VerificationToken> {
  public static readonly DEFAULT = { path: 'verificationTokens' };

  public constructor(options: CollectionOptions) {
    super({ ...options, converter: { expires: DateConverter } });
  }
}

export function VerificationTokensAdapter(
  {
    path = VerificationTokens.DEFAULT.path,
    ...options
  }: CollectionOptions = VerificationTokens.DEFAULT
) {
  const tokens = new VerificationTokens({ path, ...options });
  return {
    createVerificationToken: async (
      token: VerificationToken
    ): Promise<VerificationToken | null> =>
      (
        await tokens.create({
          ...identify(token),
          data: token,
          strict: false
        })
      ).data,
    useVerificationToken: async (
      token: Pick<VerificationToken, 'identifier' | 'token'>
    ): Promise<VerificationToken | null> =>
      (await tokens.delete({ ...identify(token), strict: false })).data
  } satisfies VerificationTokensAdapterTemplate;
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
