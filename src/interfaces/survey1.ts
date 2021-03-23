import { conection, device } from "../entities/Survey1";

export interface Survey1Schema {
    device: device
    browser: string
    conection: conection
    description: string
    url?: string
  }