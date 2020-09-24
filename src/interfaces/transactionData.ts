export interface TransactionData {
  tickets: TicketBookingData[]
  invoice: boolean
}

export interface TicketBookingData {
  quantity: number
  type: string
  individualCost: string
  total: number
  commision: string
}
