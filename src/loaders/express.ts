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
import * as path from 'path'
import * as fileupload from 'express-fileupload'

import swaggerjsondoc = require('swagger-jsdoc')
import swaggerui = require('swagger-ui-express')
import { LocationRouter } from '../routes/location'
import { ScheduleRouter } from '../routes/schedule'
import { InstructorRouter } from '../routes/instructor'
import { ClientRouter } from '../routes/client'
import { PurchaseRouter } from '../routes/purchase'
import { BookingRouter } from '../routes/booking'
import { VersionRouter } from '../routes/version'
import { FolioRouter } from '../routes/folio'
import { ImageRouter } from '../routes/image'
import { RoomRouter } from '../routes/room'
import { CollaboratorRouter } from '../routes/collaborator'
import { Survey1Router } from '../routes/survey1'

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
/*
const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
  ],
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
};*/

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
    this.application.use(fileupload())
    this.application.use('/files',express.static(path.join(__dirname, '../../files')))
    
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
    this.application.use('/versions', VersionRouter)
    this.application.use('/folios', FolioRouter)
    this.application.use('/images', ImageRouter)
    this.application.use('/rooms', RoomRouter)
    this.application.use('/collaborators', CollaboratorRouter)
    this.application.use('/survey1', Survey1Router)
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
