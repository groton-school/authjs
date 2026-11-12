export class ClaimError extends Error {
  public constructor(claim: string) {
    super(`Provided LTI ID token does not include required ${claim} claim`);
  }
}
