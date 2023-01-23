import { Application, json, urlencoded } from 'express'
import * as express from 'express'
import config from '../config'

import * as morgan from 'morgan'
import * as cors from 'cors'
import * as helmet from 'helmet'
import ErrorHandler from '../middleware/ErrorHandler'
import EndpointNotFound from '../middleware/EndpointNotFound'
import * as path from 'path'
import * as fileupload from 'express-fileupload'
import { AuthRouter } from '../routes/auth'
import { MeRouter } from '../routes/me'
import { AdminRouter } from '../routes/admin'
import { CataloguesRouter } from '../routes/catalogue'


export default class ExpressApp {
  private application: Application

  constructor() {
    this.application = express()
    this.bodyParser()
    this.loadVendorMiddleware()
    this.loadRouters()
    this.loadErrorHandlers()

    this.serve()
  }

  private bodyParser() {
    this.application.use(json())
    this.application.use(urlencoded({ extended: true }))
  }

  private loadVendorMiddleware(): void {
    this.application.use(cors())
    this.application.use(helmet())
    this.application.use(morgan('dev'))
    this.application.use(fileupload())
    this.application.use('/files',express.static(path.join(__dirname, '../../files')))
    
  }

  private loadRouters(): void {
    this.application.use('/auth', AuthRouter)
    this.application.use('/patient',MeRouter)
    this.application.use('/admin',AdminRouter)
    this.application.use('/catalogues',CataloguesRouter)
 
  }

  private loadErrorHandlers(): void {
    this.application.use('*', EndpointNotFound)
    this.application.use(ErrorHandler)
  }

  private serve(): void {
    this.application.listen(config.httpPort, () => {
      console.log(`App listening at port ${config.httpPort}`)
    })
  }
}
