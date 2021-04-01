import { getRepository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Survey1Schema } from '../interfaces/survey1'
import { User } from '../entities/Users'
import { Survey1 } from '../entities/Survey1'



export const Survey1Repository = {

    async saveSurvey1(data: Survey1Schema, user: User) {

        const userExist = await getRepository(User).findOne({
            where: {
                id: user.id
            }
        })
        if (!userExist) throw new ErrorResponse(404, 47, 'El usuario no existe')
        let survey = new Survey1

        survey.User = userExist
        survey.browser = data.browser
        survey.conection = data.conection
        survey.description = data.description
        survey.device = data.device
        survey.url = data.url ? data.url : survey.url

        await getRepository(Survey1).save(survey)
    }


}