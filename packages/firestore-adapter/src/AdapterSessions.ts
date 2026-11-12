import { AdapterSession } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { DateConverter } from '@battis/lazy-firestore/converters/Date';
import { users } from './AdapterUsers.js';

export class AdapterSessionsCollection extends Collection<AdapterSession> {
  public static readonly DEFAULT = { path: 'sessions' };
  public constructor(options: CollectionOptions) {
    super({
      ...options,
      converter: { expires: DateConverter }
    });
  }
}

export function AdapterSessions(
  {
    path = AdapterSessionsCollection.DEFAULT.path,
    ...options
  }: CollectionOptions = AdapterSessionsCollection.DEFAULT
) {
  const sessions = new AdapterSessionsCollection({ path, ...options });
  return {
    createSession: async (data: AdapterSession): Promise<AdapterSession> =>
      (
        await sessions.create({
          id: data.sessionToken,
          data,
          strict: true
        })
      ).data,
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
      patch: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>
    ): Promise<AdapterSession | null> =>
      (
        await sessions.update({
          id: patch.sessionToken,
          patch,
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
  };
}
