import { User } from "../entities/Users";

export interface UserId {
  user_id: string
}


export interface MembersGroup {
  group: User
}

export interface GroupName {
  groupName: string
}