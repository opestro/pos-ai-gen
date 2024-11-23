<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg w-full max-w-2xl p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Create Service</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          <Icon name="heroicons/x-mark-20-solid" class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4">
        <!-- Service Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
          <input
            v-model="serviceName"
            type="text"
            class="w-full px-4 py-2 border rounded-md"
            placeholder="Enter service name"
          />
        </div>

        <!-- Product Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Add Products</label>
          <div class="relative">
            <input
              v-model="productSearch"
              type="text"
              class="w-full px-4 py-2 border rounded-md"
              placeholder="Search products..."
              @input="searchProducts"
            />
            <div v-if="searchResults.length && showResults" 
                 class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              <div
                v-for="product in searchResults"
                :key="product.id"
                class="p-2 hover:bg-gray-100 cursor-pointer"
                @click="addProduct(product)"
              >
                {{ product.name }} - ${{ product.price }}
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Products -->
        <div v-if="selectedProducts.length" class="border rounded-md p-4">
          <h3 class="font-medium mb-2">Selected Products</h3>
          <div class="space-y-2">
            <div v-for="product in selectedProducts" 
                 :key="product.id"
                 class="flex justify-between items-center">
              <span>{{ product.name }} - ${{ product.price }}</span>
              <button @click="removeProduct(product.id)" 
                      class="text-red-600 hover:text-red-800">
                <Icon name="heroicons/trash-20-solid" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Service Fees -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Service Fee</label>
          <input
            v-model.number="serviceFee"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- Profit Margin -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Profit Margin (%)
          </label>
          <input
            v-model.number="profitMargin"
            type="number"
            min="0"
            max="100"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- Total Calculation -->
        <div class="bg-gray-50 p-4 rounded-md">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>Products Total:</span>
              <span>${{ productsTotal.toFixed(2) }}</span>
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
              <span>Final Price:</span>
              <span>${{ finalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="close"
          class="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="createService"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Service
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// import IconX from '~icons/heroicons/x-mark-20-solid'
// import IconTrash from '~icons/heroicons/trash-20-solid'
import { usePosStore } from '~/stores/pos'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'create'])

const store = usePosStore()
const serviceName = ref('')
const productSearch = ref('')
const showResults = ref(false)
const serviceFee = ref(0)
const profitMargin = ref(0)
const selectedProducts = ref([])
const searchResults = ref([])

const productsTotal = computed(() => {
  return selectedProducts.value.reduce((sum, product) => sum + product.price, 0)
})

const marginAmount = computed(() => {
  const baseAmount = productsTotal.value + serviceFee.value
  return baseAmount * (profitMargin.value / 100)
})

const finalPrice = computed(() => {
  return productsTotal.value + serviceFee.value + marginAmount.value
})

function searchProducts() {
  // In real implementation, this would search the store's products
  showResults.value = true
  searchResults.value = store.products.filter(p => 
    p.name.toLowerCase().includes(productSearch.value.toLowerCase())
  )
}

function addProduct(product) {
  if (!selectedProducts.value.find(p => p.id === product.id)) {
    selectedProducts.value.push(product)
  }
  productSearch.value = ''
  showResults.value = false
}

function removeProduct(productId) {
  selectedProducts.value = selectedProducts.value.filter(p => p.id !== productId)
}

function createService() {
  const service = {
    name: serviceName.value,
    products: selectedProducts.value,
    serviceFee: serviceFee.value,
    profitMargin: profitMargin.value,
    finalPrice: finalPrice.value
  }
  emit('create', service)
  close()
}

function close() {
  emit('close')
  serviceName.value = ''
  productSearch.value = ''
  serviceFee.value = 0
  profitMargin.value = 0
  selectedProducts.value = []
  showResults.value = false
}
</script>