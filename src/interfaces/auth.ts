export interface CustomerData {
    email: string
    name?: string
    lastname?: string
    pictureUrl?: string
    tempToken?:string
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
  