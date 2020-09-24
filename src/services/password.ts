import * as bcrypt from 'bcryptjs'

export class PasswordService {
  plainPassword: string

  constructor(plainPassword: string) {
    this.plainPassword = plainPassword
  }

  async getHashedPassword() {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(this.plainPassword, salt)
    return hash
  }

  async compareHashedPassword(hashedPassword: string) {
    const equal = await bcrypt.compare(this.plainPassword, hashedPassword)
    return equal
  }
}
