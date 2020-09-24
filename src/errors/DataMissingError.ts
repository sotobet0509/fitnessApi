import { ErrorResponse } from './ErrorResponse'

export class DataMissingError extends ErrorResponse {
  constructor() {
    super(400, 1, 'Data missing from request or not valid types')
  }
}
