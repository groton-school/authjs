import { AdapterUser } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { requireUnique } from '@battis/lazy-firestore/directives/requireUnique';

export class AdapterUsersCollection extends Collection<AdapterUser> {
  public static readonly DEFAULT = { path: 'users' };
  public constructor(options: CollectionOptions) {
    super({
      ...options,
      converter: {
        emailVerified: {
          deflate: (value: Date | null) => (value ? value.toISOString() : null),
          inflate: (value: string | null) => (value ? new Date(value) : null)
        }
      }
    });
  }
}

let _users: AdapterUsersCollection | undefined = undefined;
export function users() {
  if (_users) {
    return _users;
  }
  throw new Error('Users collection not initialized');
}

export function AdapterUsers(
  {
    path = AdapterUsersCollection.DEFAULT.path,
    ...options
  }: CollectionOptions = AdapterUsersCollection.DEFAULT
) {
  _users = new AdapterUsersCollection({ path, ...options });
  return {
    createUser: async (data: AdapterUser): Promise<AdapterUser> =>
      (
        await users().create({
          data,
          id: data.id,
          query: (ref) => ref.where('email', '==', data.email),
          strict: true
        })
      ).data,
    getUser: async (id: string): Promise<AdapterUser | null> =>
      (
        await users().read({
          id,
          strict: false
        })
      ).data,
    getUserByEmail: async (email: string): Promise<AdapterUser | null> =>
      requireUnique({
        list: await users().list({
          query: (ref) => ref.where('email', '==', email),
          strict: false
        }),
        strict: false
      }).data,
    updateUser: async (
      patch: Partial<AdapterUser> & Pick<AdapterUser, 'id'>
    ): Promise<AdapterUser> =>
      (
        await users().update({
          id: patch.id,
          patch,
          strict: true
        })
      ).data,
    deleteUser: async (id: string): Promise<AdapterUser | null> =>
      (
        await users().delete({
          id,
          strict: false
        })
      ).data
  };
}
