import * as fs from 'fs'
import * as path from 'path'

export default class KeysLoader {
  constructor() {
    process.env.JWT_PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../../keys/private.key'), 'utf8')
    process.env.JWT_PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../../keys/private.key'), 'utf8')
  }
}
