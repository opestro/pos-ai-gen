import { defineStore } from 'pinia'
import { useDatabase } from '~/composables/useDatabase'

export const usePosStore = defineStore('pos', {
  state: () => ({
    cart: [],
    activeCustomer: null,
    products: [],
    customers: [],
    services: []
  }),
  
  getters: {
    subtotal: (state) => {
      return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    tax: (state) => state.subtotal * 0.1,
    total: (state) => state.subtotal + state.tax
  },
  
  actions: {
    // Product Management
    async addProduct(product) {
      const { addProduct } = useDatabase()
      const newProduct = await addProduct(product)
      this.products.push(newProduct)
      return newProduct
    },

    async updateProduct(product) {
      const { updateProduct } = useDatabase()
      await updateProduct(product)
      const index = this.products.findIndex(p => p.id === product.id)
      if (index !== -1) {
        this.products[index] = { ...product }
      }
    },

    async deleteProduct(productId) {
      this.products = this.products.filter(p => p.id !== productId)
    },

    // Service Management
    async addService(service) {
      const { addService } = useDatabase()
      const newService = await addService(service)
      this.services.push(newService)
      return newService
    },

    async completeServiceTicket(ticket) {
      const { completeServiceTicket } = useDatabase()
      return await completeServiceTicket(ticket.id)
    },

    // Cart Management
    addToCart(item) {
      const existingItem = this.cart.find(i => i.id === item.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.cart.push({ ...item, quantity: 1 })
      }
    },
    
    updateQuantity(itemId, change) {
      const item = this.cart.find(item => item.id === itemId)
      if (item) {
        item.quantity = Math.max(0, item.quantity + change)
        if (item.quantity === 0) {
          this.cart = this.cart.filter(i => i.id !== itemId)
        }
      }
    },
    
    clearCart() {
      this.cart = []
      this.activeCustomer = null
    },
    
    async processTransaction(paymentDetails) {
      try {
        const { createTransaction } = useDatabase()
        
        const transaction = {
          customerId: this.activeCustomer,
          items: this.cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          subtotal: this.subtotal,
          tax: this.tax,
          total: this.total,
          cash: paymentDetails.cash,
          creditUsed: paymentDetails.creditUsed,
          newCredit: paymentDetails.newCredit,
          type: 'sale'
        }
        
        const completedTransaction = await createTransaction(transaction)
        this.clearCart()
        return completedTransaction
      } catch (error) {
        console.error('Transaction failed:', error)
        throw error
      }
    },

    setActiveCustomer(customerId) {
      this.activeCustomer = customerId
    },

    async addCustomer(customer) {
      const { addCustomer } = useDatabase()
      const newCustomer = await addCustomer(customer)
      this.customers.push(newCustomer)
      return newCustomer
    }
  }
})