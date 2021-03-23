import { getRepository, getConnection, Repository } from 'typeorm'
import * as moment from 'moment'
import { ErrorResponse } from '../errors/ErrorResponse'
import { QuestionarySchema } from '../interfaces/questionary'
import { User } from '../entities/Users'
import { Questions } from '../entities/questions'



export const QuestionRepository = {

    async saveQuestionary(data: QuestionarySchema, user: User) {

        const userExist = await getRepository(User).findOne({
            where: {
                id: user.id
            }
        })
        if (!userExist) throw new ErrorResponse(404, 47, 'El usuario no existe')
        let question = new Questions

        question.User = userExist
        question.browser = data.browser
        question.conection = data.conection
        question.description = data.description
        question.device = data.device
        question.url = data.url ? data.url : question.url

        await getRepository(Questions).save(question)
    }


}