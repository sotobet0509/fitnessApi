import TypeORM from './typeorm'
import ExpressApp from './express'
import KeysLoader from './keys'

export default async function () {
  const dbInit = new TypeORM()
  await dbInit.connect()
  new ExpressApp()
  new KeysLoader()
}
