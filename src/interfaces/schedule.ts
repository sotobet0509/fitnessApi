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
}

export interface ScheduleIsPass{
    isPass: boolean
}