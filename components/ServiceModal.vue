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
            v-model="problem"
            required
            rows="3"
            class="w-full px-4 py-2 border rounded-md"
          ></textarea>
        </div>

        <!-- Parts Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Required Parts</label>
          <div class="relative">
            <input
              v-model="partSearch"
              type="text"
              class="w-full px-4 py-2 border rounded-md"
              placeholder="Search parts..."
              @input="searchParts"
            />
            <div 
              v-if="searchResults.length && showResults" 
              class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
            >
              <div
                v-for="part in searchResults"
                :key="part.id"
                class="p-2 hover:bg-gray-100 cursor-pointer"
                @click="addPart(part)"
              >
                {{ part.name }} - ${{ part.price }}
                (Stock: {{ part.stock }})
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Parts -->
        <div v-if="selectedParts.length" class="border rounded-md p-4">
          <h3 class="font-medium mb-2">Selected Parts</h3>
          <div class="space-y-2">
            <div 
              v-for="part in selectedParts" 
              :key="part.id"
              class="flex justify-between items-center"
            >
              <span>{{ part.name }} - ${{ part.price }}</span>
              <div class="flex items-center gap-2">
                <button 
                  type="button"
                  @click="updateQuantity(part.id, -1)"
                  class="p-1 hover:bg-gray-100 rounded"
                >
                  <Icon name="heroicons:minus" class="w-4 h-4" />
                </button>
                <span>{{ part.quantity }}</span>
                <button 
                  type="button"
                  @click="updateQuantity(part.id, 1)"
                  class="p-1 hover:bg-gray-100 rounded"
                  :disabled="!canIncreaseQuantity(part)"
                >
                  <Icon name="heroicons:plus" class="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  @click="removePart(part.id)"
                  class="text-red-600 hover:text-red-800 ml-2"
                >
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Fee and Profit -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Service Fee</label>
            <input
              v-model.number="serviceFee"
              type="number"
              min="0"
              step="any"
              required
              class="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Profit Amount
            </label>
            <input
              v-model.number="profitAmount"
              type="number"
              min="0"
              step="any"
              required
              class="w-full px-4 py-2 border rounded-md"
            />
          </div>
        </div>

        <!-- Price Calculation -->
        <div class="bg-gray-50 p-4 rounded-md">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>Parts Total:</span>
              <span>${{ partsTotal }}</span>
            </div>
            <div class="flex justify-between">
              <span>Service Fee:</span>
              <span>${{ serviceFee }}</span>
            </div>
            <div class="flex justify-between">
              <span>Profit Amount:</span>
              <span>${{ profitAmount }}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>Total Price:</span>
              <span>${{ totalPrice }}</span>
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
            :disabled="!isValid"
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
import { useDatabase } from '~/composables/useDatabase'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'created'])

const { getProducts, getCustomers } = useDatabase()

// Form data
const selectedCustomerId = ref('')
const problem = ref('')
const partSearch = ref('')
const showResults = ref(false)
const selectedParts = ref([])
const serviceFee = ref(0)
const profitAmount = ref(0)

// Computed properties
const customers = computed(() => getCustomers())
const searchResults = computed(() => {
  if (!partSearch.value) return []
  const query = partSearch.value.toLowerCase()
  return getProducts().filter(p => 
    p.name.toLowerCase().includes(query) &&
    p.stock > 0 &&
    !selectedParts.value.find(sp => sp.id === p.id)
  )
})

const partsTotal = computed(() => {
  return selectedParts.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const totalPrice = computed(() => {
  return partsTotal.value + serviceFee.value + profitAmount.value
})

const isValid = computed(() => {
  return selectedCustomerId.value &&
         problem.value.trim() &&
         selectedParts.value.length > 0 &&
         serviceFee.value >= 0 &&
         profitAmount.value >= 0
})

// Methods
function searchParts() {
  showResults.value = true
}

function addPart(part) {
  selectedParts.value.push({
    ...part,
    quantity: 1
  })
  partSearch.value = ''
  showResults.value = false
}

function removePart(partId) {
  selectedParts.value = selectedParts.value.filter(p => p.id !== partId)
}

function updateQuantity(partId, change) {
  const item = selectedParts.value.find(p => p.id === partId)
  if (item) {
    if (change > 0 && !canIncreaseQuantity(item)) return
    item.quantity = Math.max(1, item.quantity + change)
  }
}

function canIncreaseQuantity(item) {
  const product = getProducts().find(p => p.id === item.id)
  return product && item.quantity < product.stock
}

function generateTicketNumber() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `SRV${timestamp}${random}`
}

async function createTicket() {
  if (!isValid.value) return

  const customer = customers.value.find(c => c.id === selectedCustomerId.value)
  if (!customer) return

  const ticket = {
    ticketNumber: generateTicketNumber(),
    customerId: customer.id,
    customerName: customer.name,
    problem: problem.value,
    parts: selectedParts.value,
    partsTotal: partsTotal.value,
    serviceFee: serviceFee.value,
    profitAmount: profitAmount.value,
    totalPrice: totalPrice.value
  }

  emit('created', ticket)
  resetForm()
}

function close() {
  resetForm()
  emit('close')
}

function resetForm() {
  selectedCustomerId.value = ''
  problem.value = ''
  partSearch.value = ''
  selectedParts.value = []
  serviceFee.value = 0
  profitAmount.value = 0
  showResults.value = false
}
</script>