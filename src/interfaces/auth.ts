export interface CustomerData {
  email: string
  name?: string
  lastname?: string
  pictureUrl?: string
  tempToken?: string
}

export interface FacebookLoginRequest extends CustomerData {
  facebookId: string
  facebookToken: string
}

export interface GoogleLoginRequest extends CustomerData {
  googleId: string
  googleToken: string
}

export interface LocalSignUpData extends CustomerData {
  password: string
}

export interface LocalLoginData {
  email: string
  password: string
}

export interface AdminSignupData {
  email: string
}

export interface ClientData {
  id?: string
  name?: string
  email?: string
  lastname?: string
  password?: string
  pictureUrl?: string
  facebookId?: string
  googleId?:string
  isAdmin?: boolean
  createdAt?: Date
}

export interface ClientId {
  client_id: string
}

export interface ChangePasswordSchema {
 tempToken: string
 password: string
}


export interface ChangePasswordManualSchema {
  password: string
  clientId: string
 }