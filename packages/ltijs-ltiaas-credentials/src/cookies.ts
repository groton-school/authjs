import type { CookieOption, CookiesOptions } from '@auth/core/types';

const options: CookieOption['options'] = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/'
};

/**
 * Configure cookies to enable third-party storage within an `iframe`
 */
export const cookies: CookiesOptions = {
  callbackUrl: { name: `__Secure-authjs.callback-url`, options },
  csrfToken: { name: `__Host-authjs.csrf-token`, options },
  nonce: { name: `$__Secure-authjs.nonce`, options },
  pkceCodeVerifier: { name: `$__Secure-authjs.pkce.code_verifier`, options },
  sessionToken: { name: '__Secure-authjs.session-token', options },
  state: { name: `__Secure-authjs.state`, options },
  webauthnChallenge: { name: `$__Secure-authjs.webauthn-challenge`, options }
};
