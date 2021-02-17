export interface ScheduleSchema {
    id?: number
    date?: Date
    end?: Date
    start?: Date
    instructor_id?: number
    roomsId?: number
    sendEmail?: boolean
    deleteBookings?: boolean
    theme?: string
    isPrivate?: boolean
}

export interface ScheduleIsPass{
    isPass: boolean
}

export interface ScheduleClientId{
    client_id: string
    isPass: boolean
}