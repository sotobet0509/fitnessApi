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
import { LocationRouter } from '../routes/location'
import { ScheduleRouter } from '../routes/schedule'
import { InstructorRouter } from '../routes/instructor'
import { ClientRouter } from '../routes/client'
import { PurchaseRouter } from '../routes/purchase'
import { BookingRouter } from '../routes/booking'

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
    this.application.use('/locations', LocationRouter)
    this.application.use('/schedules', ScheduleRouter)
    this.application.use('/instructors', InstructorRouter)
    this.application.use('/clients', ClientRouter)
    this.application.use('/purchase', PurchaseRouter)
    this.application.use('/bookings', BookingRouter)
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
