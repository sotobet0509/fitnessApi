import {UploadedFile} from 'express-fileupload'
import { ErrorResponse } from '../errors/ErrorResponse'
import config from '../config'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function handleProfilePicture(file: UploadedFile) {
    if(file.truncated) throw new ErrorResponse(400, 30, 'El archivo es demasiado grande')
    const name = uuidv4()
    let filename = name + file.name
    filename = filename.trim()

    const url = `${config.profilePictureUrl}${filename}`
    await file.mv(path.join(__dirname, `../../files/users/${filename}`))
    return url
}