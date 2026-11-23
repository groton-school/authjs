import { Adapter, AdapterSession } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { DateConverter } from '@battis/lazy-firestore/converters/Date';
import { users } from './Users.js';

type SessionsAdapterTemplate = {
  createSession: NonNullable<Adapter['createSession']>;
  getSessionAndUser: NonNullable<Adapter['getSessionAndUser']>;
  updateSession: NonNullable<Adapter['updateSession']>;
  deleteSession: NonNullable<Adapter['deleteSession']>;
};

export class Sessions extends Collection<AdapterSession> {
  public static readonly DEFAULT = { path: 'sessions' };
  public constructor(options: CollectionOptions) {
    super({
      ...options,
      converter: { expires: DateConverter }
    });
  }
}

export function SessionsAdapter(
  {
    path = Sessions.DEFAULT.path,
    ...options
  }: CollectionOptions = Sessions.DEFAULT
) {
  const sessions = new Sessions({ path, ...options });
  return {
    createSession: async (session: AdapterSession): Promise<AdapterSession> => {
      console.log(JSON.stringify({ session }, null, 2));
      return (
        await sessions.create({
          id: session.sessionToken,
          data: session,
          strict: true
        })
      ).data;
    },
    getSessionAndUser: async (id: string) => {
      const session = (
        await sessions.read({
          id,
          strict: false
        })
      ).data;
      if (session) {
        const user = (await users().read({ id: session.userId, strict: false }))
          .data;
        if (user) {
          return { session, user };
        }
      }
      return null;
    },
    updateSession: async (
      session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>
    ): Promise<AdapterSession | null> =>
      (
        await sessions.update({
          id: session.sessionToken,
          patch: session,
          strict: false
        })
      ).data,
    deleteSession: async (id: string): Promise<AdapterSession | null> =>
      (
        await sessions.delete({
          id,
          strict: false
        })
      ).data
  } satisfies SessionsAdapterTemplate;
}
