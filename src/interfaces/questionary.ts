import { conection, device } from "../entities/questions";

export interface QuestionarySchema {
    device: device
    browser: string
    conection: conection
    description: string
    url?: string
  }