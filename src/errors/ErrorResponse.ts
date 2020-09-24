export class ErrorResponse extends Error {
  internalCode: number
  httpCode: number
  constructor(httpCode: number, internalCode: number, message: string) {
    super(message)
    this.internalCode = internalCode
    this.message = message
    this.httpCode = httpCode
  }
}
