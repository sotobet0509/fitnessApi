import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../../local.env') })

export default {
  httpPort: process.env.HTTP_PORT,
  googleAuthUrl: 'https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}',
  facebookAuthUrl: 'https://graph.facebook.com/${facebookId}/?access_token=${facebookToken}',
  frontendUrl: process.env.FRONTEND_URL,
  backendUrl: process.env.BACKEND_URL,
  internalToken: process.env.INTERNAL_TOKEN,
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  stripeApiKey: process.env.STRIPE_API_KEY,

}
