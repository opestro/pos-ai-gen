<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg w-full max-w-2xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Create Service Ticket</h2>
          <button @click="close" class="text-gray-500 hover:text-gray-700">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
  
        <form @submit.prevent="createTicket" class="space-y-4">
          <!-- Customer Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select 
              v-model="selectedCustomerId"
              required
              class="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Select Customer</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select>
          </div>
  
          <!-- Problem Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
            <textarea
              v-model="description"
              required
              rows="3"
              class="w-full px-4 py-2 border rounded-md"
            ></textarea>
          </div>
  
          <!-- Product Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Required Parts</label>
            <div class="relative">
              <input
                v-model="productSearch"
                type="text"
                class="w-full px-4 py-2 border rounded-md"
                placeholder="Search products..."
                @input="searchProducts"
              />
              <div 
                v-if="searchResults.length && showResults" 
                class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
              >
                <div
                  v-for="product in searchResults"
                  :key="product.id"
                  class="p-2 hover:bg-gray-100 cursor-pointer"
                  @click="addProduct(product)"
                >
                  {{ product.name }} - ${{ product.price }}
                  (Stock: {{ product.stock }})
                </div>
              </div>
            </div>
          </div>
  
          <!-- Selected Products -->
          <div v-if="selectedProducts.length" class="border rounded-md p-4">
            <h3 class="font-medium mb-2">Selected Parts</h3>
            <div class="space-y-2">
              <div 
                v-for="product in selectedProducts" 
                :key="product.id"
                class="flex justify-between items-center"
              >
                <span>{{ product.name }} - ${{ product.price }}</span>
                <div class="flex items-center gap-2">
                  <button 
                    type="button"
                    @click="updateQuantity(product.id, -1)"
                    class="p-1 hover:bg-gray-100 rounded"
                  >
                    <Icon name="heroicons:minus" class="w-4 h-4" />
                  </button>
                  <span>{{ product.quantity }}</span>
                  <button 
                    type="button"
                    @click="updateQuantity(product.id, 1)"
                    class="p-1 hover:bg-gray-100 rounded"
                    :disabled="!canIncreaseQuantity(product)"
                  >
                    <Icon name="heroicons:plus" class="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    @click="removeProduct(product.id)"
                    class="text-red-600 hover:text-red-800 ml-2"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Service Fee and Margin -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Service Fee</label>
              <input
                v-model.number="serviceFee"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Profit Margin (%)
              </label>
              <input
                v-model.number="profitMargin"
                type="number"
                min="0"
                max="100"
                required
                class="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>
  
          <!-- Deposit Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
            <input
              v-model.number="depositAmount"
              type="number"
              min="0"
              :max="totalPrice"
              step="0.01"
              required
              class="w-full px-4 py-2 border rounded-md"
            />
          </div>
  
          <!-- Price Calculation -->
          <div class="bg-gray-50 p-4 rounded-md">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Parts Total:</span>
                <span>${{ partsTotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Service Fee:</span>
                <span>${{ serviceFee.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Margin Amount:</span>
                <span>${{ marginAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold">
                <span>Total Price:</span>
                <span>${{ totalPrice.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-blue-600">
                <span>Remaining Amount:</span>
                <span>${{ remainingAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
  
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  const { getProducts, getCustomers, addServiceTicket } = useDatabase()
  
  const props = defineProps({
    isOpen: Boolean
  })
  
  const emit = defineEmits(['close', 'created'])
  
  // Form data
  const selectedCustomerId = ref('')
  const description = ref('')
  const productSearch = ref('')
  const showResults = ref(false)
  const selectedProducts = ref([])
  const serviceFee = ref(0)
  const profitMargin = ref(0)
  const depositAmount = ref(0)
  
  // Computed properties
  const customers = computed(() => getCustomers())
  const searchResults = computed(() => {
    if (!productSearch.value) return []
    const query = productSearch.value.toLowerCase()
    return getProducts().filter(p => 
      p.name.toLowerCase().includes(query) &&
      p.stock > 0 &&
      !selectedProducts.value.find(sp => sp.id === p.id)
    )
  })
  
  const partsTotal = computed(() => {
    return selectedProducts.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })
  
  const marginAmount = computed(() => {
    const baseAmount = partsTotal.value + serviceFee.value
    return baseAmount * (profitMargin.value / 100)
  })
  
  const totalPrice = computed(() => {
    return partsTotal.value + serviceFee.value + marginAmount.value
  })
  
  const remainingAmount = computed(() => {
    return totalPrice.value - depositAmount.value
  })
  
  // Methods
  function searchProducts() {
    showResults.value = true
  }
  
  function addProduct(product) {
    selectedProducts.value.push({
      ...product,
      quantity: 1
    })
    productSearch.value = ''
    showResults.value = false
  }
  
  function removeProduct(productId) {
    selectedProducts.value = selectedProducts.value.filter(p => p.id !== productId)
  }
  
  function updateQuantity(productId, change) {
    const item = selectedProducts.value.find(p => p.id === productId)
    if (item) {
      if (change > 0 && !canIncreaseQuantity(item)) return
      item.quantity = Math.max(1, item.quantity + change)
    }
  }
  
  function canIncreaseQuantity(item) {
    const product = getProducts().find(p => p.id === item.id)
    return product && item.quantity < product.stock
  }
  
  async function createTicket() {
    const customer = customers.value.find(c => c.id === selectedCustomerId.value)
    if (!customer) return
  
    const ticket = await addServiceTicket({
      customerId: customer.id,
      customerName: customer.name,
      description: description.value,
      products: selectedProducts.value,
      serviceFee: serviceFee.value,
      profitMargin: profitMargin.value,
      totalPrice: totalPrice.value,
      depositAmount: depositAmount.value,
      remainingAmount: remainingAmount.value
    })
  
    emit('created', ticket)
    close()
  }
  
  function close() {
    selectedCustomerId.value = ''
    description.value = ''
    productSearch.value = ''
    selectedProducts.value = []
    serviceFee.value = 0
    profitMargin.value = 0
    depositAmount.value = 0
    showResults.value = false
    emit('close')
  }
  </script>