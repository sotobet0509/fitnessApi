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

export async function handleInstructorProfilePicture(file: UploadedFile) {
    if(file.truncated) throw new ErrorResponse(400, 30, 'El archivo es demasiado grande')
    const name = uuidv4()
    let filename = name + file.name
    filename = filename.trim()

    const url = `${config.profilePictureUrl}${filename}`
    await file.mv(path.join(__dirname, `../../files/instructors/${filename}`))
    return url
}

export async function handleSurvey1(file: UploadedFile) {
    if(file.truncated) throw new ErrorResponse(400, 30, 'El archivo es demasiado grande')
    const name = uuidv4()
    let filename = name + file.name
    filename = filename.trim()

    const url = `${config.questionsUrl}${filename}`
    await file.mv(path.join(__dirname, `../../files/survey1/${filename}`))
    return url
}

export async function handleHomePicture(file: UploadedFile) {
    if(file.truncated) throw new ErrorResponse(400, 30, 'El archivo es demasiado grande')
    
    let filename = file.name
    filename = filename.trim()

    const url = `${config.homeUrl}${filename}`
    await file.mv(path.join(__dirname, `../../files/pictures/${filename}`))
    return url
}
