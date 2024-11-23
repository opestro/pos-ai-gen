import { ref, watch } from 'vue'
import type { Customer, Product, Service, Transaction, ServiceTicket } from '~/types'

const db = ref({
  customers: [] as Customer[],
  products: [] as Product[],
  services: [] as Service[],
  transactions: [] as Transaction[],
  serviceTickets: [] as ServiceTicket[]
})

// Save changes to localStorage
watch(db, (newValue) => {
  localStorage.setItem('pos_db', JSON.stringify(newValue))
}, { deep: true })

export function useDatabase() {
  async function init() {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem('pos_db')
      if (stored) {
        db.value = JSON.parse(stored)
      } else {
        // Load initial data from db.json
        const data = await import('~/data/db.json')
        db.value = data.default
      }
    } catch (error) {
      console.error('Database initialization failed:', error)
      throw error
    }
  }

  // Product operations
  const generateSKU = (category: string) => {
    const prefix = category.substring(0, 1).toUpperCase()
    const timestamp = Date.now().toString().slice(-4)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}${timestamp}${random}`
  }

  function addProduct(product: Omit<Product, 'id' | 'sku' | 'lastRestocked'>) {
    const newProduct = {
      ...product,
      id: Date.now(),
      sku: generateSKU(product.category),
      lastRestocked: new Date().toISOString()
    }
    db.value.products.push(newProduct)
    return newProduct
  }

  function updateProduct(product: Product) {
    const index = db.value.products.findIndex(p => p.id === product.id)
    if (index !== -1) {
      db.value.products[index] = product
    }
  }

  function updateStock(productId: number, quantity: number) {
    const product = db.value.products.find(p => p.id === productId)
    if (product) {
      product.stock += quantity
      product.lastRestocked = new Date().toISOString()
    }
  }

  function getProducts() {
    return db.value.products
  }

  // Customer operations
  function addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'credit' | 'totalPurchases'>) {
    const newCustomer = {
      ...customer,
      id: Date.now(),
      credit: 0,
      totalPurchases: 0,
      createdAt: new Date().toISOString()
    }
    db.value.customers.push(newCustomer)
    return newCustomer
  }

  function updateCustomer(customer: Customer) {
    const index = db.value.customers.findIndex(c => c.id === customer.id)
    if (index !== -1) {
      db.value.customers[index] = customer
    }
  }

  function updateCustomerCredit(customerId: number, amount: number) {
    const customer = db.value.customers.find(c => c.id === customerId)
    if (customer) {
      customer.credit += amount
    }
  }

  function deleteCustomer(id: number) {
    db.value.customers = db.value.customers.filter(c => c.id !== id)
  }

  function getCustomers() {
    return db.value.customers
  }

  function getCustomerById(id: number) {
    return db.value.customers.find(c => c.id === id)
  }

  // Service operations
  const getServices = () => db.value.services
  const addService = (service: Service) => {
    db.value.services.push(service)
  }

  // Transaction operations
  function createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>) {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }

    // Update customer total purchases and credit if applicable
    const customer = db.value.customers.find(c => c.id === transaction.customerId)
    if (customer) {
      customer.totalPurchases += transaction.total
      if (transaction.status === 'credit') {
        customer.credit += transaction.credit || 0
      }
    }

    // Update product stock
    transaction.items.forEach(item => {
      updateStock(item.id, -item.quantity)
    })

    db.value.transactions.push(newTransaction)
    return newTransaction
  }

  function getCustomerTransactions(customerId: number) {
    return db.value.transactions.filter(t => t.customerId === customerId)
  }

  // Service Ticket operations
  const addServiceTicket = (ticket: Omit<ServiceTicket, 'id' | 'createdAt' | 'status'>) => {
    const newTicket = {
      ...ticket,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    db.value.serviceTickets.push(newTicket)
    return newTicket
  }

  const completeServiceTicket = (ticketId: number) => {
    const ticket = db.value.serviceTickets.find(t => t.id === ticketId)
    if (ticket && ticket.status === 'pending') {
      ticket.status = 'completed'
      ticket.completedAt = new Date().toISOString()
      return ticket
    }
    return null
  }

  const getServiceTickets = () => db.value.serviceTickets
  const getServiceTicketById = (id: number) => db.value.serviceTickets.find(t => t.id === id)

  return {
    init,
    addProduct,
    updateProduct,
    updateStock,
    getProducts,
    addCustomer,
    updateCustomer,
    updateCustomerCredit,
    deleteCustomer,
    getCustomers,
    getCustomerById,
    getServices,
    addService,
    createTransaction,
    getCustomerTransactions,
    addServiceTicket,
    completeServiceTicket,
    getServiceTickets,
    getServiceTicketById
  }
}