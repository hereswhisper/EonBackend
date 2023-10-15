export default class BadRequestError extends Error {
  private errorCode: number;

  constructor(message: string, code: string, errorCode: number) {
    super(message);
    this.name = code;
    this.errorCode = errorCode;
  }
}
