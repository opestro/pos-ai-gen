import { ref, watch } from 'vue'
import type { Customer, Product, Service, Transaction, ServiceTicket } from '~/types'

// Initialize database with default values
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
        const parsedData = JSON.parse(stored)
        // Ensure all arrays exist
        db.value = {
          customers: parsedData.customers || [],
          products: parsedData.products || [],
          services: parsedData.services || [],
          transactions: parsedData.transactions || [],
          serviceTickets: parsedData.serviceTickets || []
        }
      } else {
        // Load initial data from db.json
        const response = await fetch('/data/db.json')
        const data = await response.json()
        db.value = {
          customers: data.customers || [],
          products: data.products || [],
          services: data.services || [],
          transactions: data.transactions || [],
          serviceTickets: data.serviceTickets || []
        }
        // Save to localStorage
        localStorage.setItem('pos_db', JSON.stringify(db.value))
      }
    } catch (error) {
      console.error('Database initialization failed:', error)
      // Initialize with empty arrays if loading fails
      db.value = {
        customers: [],
        products: [],
        services: [],
        transactions: [],
        serviceTickets: []
      }
    }
  }

  // Product operations
  function generateSKU(category: string) {
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
  function getServices() {
    return db.value.services
  }

  function addService(service: Service) {
    const newService = {
      ...service,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    db.value.services.push(newService)
    return newService
  }

  // Transaction operations
  function createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>) {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }

    // Update customer total purchases and credit
    const customer = db.value.customers.find(c => c.id === transaction.customerId)
    if (customer) {
      customer.totalPurchases += transaction.total
      customer.credit -= transaction.creditUsed
      customer.credit += transaction.newCredit
    }

    // Update product stock
    transaction.items.forEach(item => {
      const product = db.value.products.find(p => p.id === item.id)
      if (product) {
        product.stock -= item.quantity
      }
    })

    db.value.transactions.push(newTransaction)
    return newTransaction
  }

  function getCustomerTransactions(customerId: number) {
    return db.value.transactions.filter(t => t.customerId === customerId)
  }

  // Service Ticket operations
  function addServiceTicket(ticket: Omit<ServiceTicket, 'id' | 'createdAt' | 'status'>) {
    const newTicket = {
      ...ticket,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    db.value.serviceTickets.push(newTicket)
    return newTicket
  }

  function completeServiceTicket(ticketId: number) {
    const ticket = db.value.serviceTickets.find(t => t.id === ticketId)
    if (ticket && ticket.status === 'pending') {
      ticket.status = 'completed'
      ticket.completedAt = new Date().toISOString()

      // Create a transaction for the completed service
      const transaction = createTransaction({
        customerId: ticket.customerId,
        items: ticket.parts,
        subtotal: ticket.partsTotal + ticket.serviceFee,
        tax: 0, // Services might be tax-exempt, adjust as needed
        total: ticket.totalPrice,
        cash: ticket.totalPrice,
        creditUsed: 0,
        newCredit: 0,
        type: 'service',
        serviceTicketId: ticket.id
      })

      return { ticket, transaction }
    }
    return null
  }

  function getServiceTickets() {
    return db.value.serviceTickets
  }

  function getServiceTicketById(id: number) {
    return db.value.serviceTickets.find(t => t.id === id)
  }

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