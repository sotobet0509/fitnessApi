import { Purchase } from "../entities/Purchases";

export interface PurchaseData {
    bundles: number[]
    transactionId: string
}

export interface Invoice{
    invoice: boolean
    comment?: string
}

export interface extraPurchaseSchema{
    addedClasses?: number
    addedPasses?: number
}


export interface pendingClasses{
    purchase: Purchase
    pendingClasses: number
    pendingPasses: number
}

export interface Comments{
    comment: string
}
