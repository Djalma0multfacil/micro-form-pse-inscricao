export class IntegrationError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    cause?: unknown,
  ) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = 'IntegrationError';
  }
}
