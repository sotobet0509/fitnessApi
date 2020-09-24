import 'reflect-metadata'
import { createConnection, Connection } from 'typeorm'

export default class TypeORM {
  connection: Connection

  constructor() {}

  public async connect() {
    this.connection = await createConnection()
    return this.connection
  }
}
