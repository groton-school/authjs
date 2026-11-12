export class AdapterError extends Error {
  public constructor(method: string) {
    super(
      `Adapter implementation does not include a ${method}() implementation`
    );
  }
}
