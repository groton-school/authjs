import type { OAuthConfig, OAuthUserConfig } from '@auth/core/providers';
import type { Authorization } from '@groton/veracross-api';
import { capitalCase, constantCase } from 'change-case';

export type Profile = Authorization.OAuth.Userinfo.UserInfo;

export default function Veracross<
  P extends Authorization.OAuth.Userinfo.UserInfo
>({
  schoolRoute,
  id = 'veracross',
  name,
  style,
  authorization,
  ...options
}: OAuthUserConfig<P> & { schoolRoute?: string }): OAuthConfig<P> {
  const {
    brandColor = '#1E3B5D',
    logo = 'https://assets.veracross.com/_common/images/Homepage_Panel_21.png'
  } = style || {};

  const { params, ...restAuthorization } = authorization || {};
  const { scope = 'openid', ...restParams } = params || {};

  schoolRoute =
    schoolRoute || process.env[`AUTH_${constantCase(id)}_ROUTE`] || id;

  return {
    id,
    name: name || capitalCase(id),
    style: { brandColor, logo },
    type: 'oidc',
    issuer: `https://accounts.veracross.com/${schoolRoute}`,
    authorization: {
      params: { scope: 'openid', ...restParams },
      ...restAuthorization
    },
    client: {
      token_endpoint_auth_method: 'client_secret_post'
    },
    async profile(profile: Profile) {
      const { sub: id, email } = profile;
      const user = {
        id,
        email,
        ...profile
      };
      return user;
    },
    options
  };
}
