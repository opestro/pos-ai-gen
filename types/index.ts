export interface ServiceTicket {
    id: number
    ticketNumber: string
    customerId: number
    customerName: string
    problem: string
    status: 'pending' | 'completed'
    partsTotal: number
    serviceFee: number
    profitAmount: number
    totalPrice: number
    createdAt: string
    completedAt?: string
    parts: Array<{
      id: number
      name: string
      price: number
      quantity: number
    }>
  }
  
  export interface Customer {
    id: number
    name: string
    email: string
    phone: string
    credit: number
    totalPurchases: number
    createdAt: string
  }
  
  export interface Product {
    id: number
    name: string
    price: number
    stock: number
    sku: string
    category: string
    lastRestocked: string
  }
  
  export interface Service {
    id: number
    name: string
    price: number
    description: string
    duration: number
  }
  
  export interface Transaction {
    id: number
    customerId: number
    items: Array<{
      id: number
      name: string
      price: number
      quantity: number
    }>
    subtotal: number
    tax: number
    total: number
    cash: number
    creditUsed: number
    newCredit: number
    createdAt: string
    type: 'sale' | 'service'
    serviceTicketId?: number
  }