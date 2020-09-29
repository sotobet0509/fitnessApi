import { Router } from 'express'
import { BundleController } from '../controllers/bundle'
import * as h from 'express-async-handler'
import { LocationController } from '../controllers/location'
//import {checkToken} from '../middleware/CheckToken'

const LocationRouter = Router({ mergeParams: true })
LocationRouter.get('/', h(LocationController.getAllLocations))
LocationRouter.get('/:location_id', h(LocationController.getLocation))
LocationRouter.get('/:location_id/room/:room_id/year/:year/month/:mounth/week/:week', h(LocationController.getLocationsByWeek))

export { LocationRouter }