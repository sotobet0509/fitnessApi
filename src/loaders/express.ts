import { Application, json, urlencoded } from 'express'
import * as express from 'express'
import config from '../config'
import * as morgan from 'morgan'
import * as cors from 'cors'
import * as helmet from 'helmet'
import { AuthRouter } from '../routes/auth'
import ErrorHandler from '../middleware/ErrorHandler'
import EndpointNotFound from '../middleware/EndpointNotFound'
const swaggerjsondoc = require('swagger-jsdoc')
const swaggerui = require('swagger-ui-express')
const swaggerOptions = {
  swaggerDefinition: {
      info: {
          title: 'Bloom-api',
          description: 'Documentacion de api de bloom',
      },
      host: 'http://localhost:4000',
      basePath: '/'
  },
  apis: ['../routes/auth.js']
};
const swaggerDocs = swaggerjsondoc(swaggerOptions)


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
  }

  private loadRouters(): void {
    this.application.use('/api', swaggerui.serve, swaggerui.setup(swaggerDocs))
    this.application.use('/auth', AuthRouter)
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
