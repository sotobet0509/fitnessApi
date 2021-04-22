export interface BundleSchema {
    name: string
    price: number
    offer?: number
    description: string
    classNumber?: number
    expirationDays: number
    passes?: number
    isUnlimited?: boolean
    isSpecial?: boolean
    especialDescription?: string
    promotionExpirationDays?: number
    pictureUrl?: string
    alternateUserId?: string
    email?: string
    password?: string
    collaboratorName?: string
    contact?: string
    isGroup?: boolean
    memberLimit?: number
}

export interface UpdateBundleSchema {
    name?: string
    price?: number
    offer?: number
    description?: string
    classNumber?: number
    expirationDays?: number
    passes?: number
    isUnlimited?: boolean
    isSpecial?: boolean
    especialDescription?: string
    promotionExpirationDays?: number
    pictureUrl?: string
    alternateUserId?: string
    email?: string
    password?: string
    collaboratorName?: string
    contact?: string
    isGroup?: boolean
    memberLimit?: number
}
