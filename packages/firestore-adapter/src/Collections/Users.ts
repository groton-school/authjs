import { Adapter, AdapterUser } from '@auth/core/adapters';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { deleteUndefinedProperties } from '@battis/lazy-firestore/directives/deleteUndefinedProperties';
import { nullifyUndefinedProperties } from '@battis/lazy-firestore/directives/nullifyUndefinedProperties';
import { requireUnique } from '@battis/lazy-firestore/directives/requireUnique';

type UsersAdapterTemplate = {
  createUser: NonNullable<Adapter['createUser']>;
  getUser: NonNullable<Adapter['getUser']>;
  getUserByEmail: NonNullable<Adapter['getUserByEmail']>;
  updateUser: NonNullable<Adapter['updateUser']>;
  deleteUser: NonNullable<Adapter['deleteUser']>;
};

export class Users extends Collection<AdapterUser> {
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

let _users: Users | undefined = undefined;
export function users() {
  if (_users) {
    return _users;
  }
  throw new Error('Users collection not initialized');
}

export function UsersAdapter(
  { path = Users.DEFAULT.path, ...options }: CollectionOptions = Users.DEFAULT
) {
  _users = new Users({ path, ...options });
  return {
    createUser: async (user: AdapterUser): Promise<AdapterUser> =>
      (
        await users().create({
          data: nullifyUndefinedProperties(user),
          id: user.id,
          query: (ref) => ref.where('email', '==', user.email),
          strict: true
        })
      ).data,
    getUser: async (id: string): Promise<AdapterUser | null> => {
      return (
        await users().read({
          id,
          strict: false
        })
      ).data;
    },
    getUserByEmail: async (email: string): Promise<AdapterUser | null> => {
      return requireUnique({
        list: await users().list({
          query: (ref) => ref.where('email', '==', email),
          strict: false
        }),
        strict: false
      }).data;
    },
    updateUser: async (
      user: Partial<AdapterUser> & Pick<AdapterUser, 'id'>
    ): Promise<AdapterUser> =>
      (
        await users().update({
          id: user.id,
          patch: deleteUndefinedProperties(user),
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
  } satisfies UsersAdapterTemplate;
}
