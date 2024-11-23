// Previous interfaces remain the same...

export interface ServiceTicket {
    id: number
    customerId: number
    customerName: string
    description: string
    products: Array<{
      id: number
      name: string
      price: number
      quantity: number
    }>
    serviceFee: number
    profitMargin: number
    totalPrice: number
    status: 'pending' | 'completed'
    depositAmount: number
    remainingAmount: number
    createdAt: string
    completedAt?: string
  }