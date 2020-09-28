import { Application, json, urlencoded } from 'express'
import * as express from 'express'
import config from '../config'
import * as morgan from 'morgan'
import * as cors from 'cors'
import * as helmet from 'helmet'
import { AuthRouter } from '../routes/auth'
import { MeRouter } from '../routes/me'
import { BundleRouter } from '../routes/bundle'
import ErrorHandler from '../middleware/ErrorHandler'
import EndpointNotFound from '../middleware/EndpointNotFound'

import swaggerjsondoc = require('swagger-jsdoc')
import swaggerui = require('swagger-ui-express')

const swaggerDocs = swaggerjsondoc({
  swaggerDefinition: {
    info: {
      title: 'Bloom API',
      version: '1.0',
      description: 'Documentación de la API de Bloom',
    },
    host: 'localhost:' + config.httpPort,
    basePath: '/'
  },
  apis: ['**/*.ts']
})


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
    this.application.use('/api', swaggerui.serve, swaggerui.setup(swaggerDocs))
  }

  private loadRouters(): void {
    this.application.use('/auth', AuthRouter)
    this.application.use('/me', MeRouter)
    this.application.use('/bundles', BundleRouter)
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
