<template>
  <div class="flex gap-4">
    <!-- Left Panel -->
    <div class="w-2/3 bg-white rounded-lg shadow p-4">
      <div class="mb-4">
        <div class="flex gap-4">
          <button 
            v-for="tab in ['Products', 'Services']" 
            :key="tab"
            class="px-4 py-2 rounded-md"
            :class="[
              activeTab === tab 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            ]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </div>
      
      <PosProductGrid
        v-if="activeTab === 'Products'"
        :products="store.products"
        @select="addToCart"
      />
      
      <PosServiceGrid
        v-else
        :services="store.services"
        :tickets="serviceTickets"
        @new-service="showServiceModal = true"
        @select="selectService"
      />
    </div>

    <!-- Right Panel -->
    <div class="w-1/3">
      <PosCartPanel
        ref="cartPanel"
        :items="store.cart"
        :customers="store.customers"
        :tax-rate="0.1"
        @customer-change="handleCustomerChange"
        @update-quantity="updateQuantity"
        @remove-item="removeFromCart"
        @process-payment="handleProcessPayment"
        @clear-cart="clearCart"
      />
    </div>

    <!-- Modals -->
    <CustomerModal
      v-if="showCustomerModal"
      :is-open="showCustomerModal"
      @close="showCustomerModal = false"
      @save="handleCustomerSave"
    />

    <ServiceModal
      v-if="showServiceModal"
      :is-open="showServiceModal"
      :customers="store.customers"
      :products="store.products"
      @close="closeServiceModal"
      @created="handleServiceCreate"
    />

    <ServiceTicketModal
      v-if="showTicketModal"
      :is-open="showTicketModal"
      :ticket="selectedTicket"
      @close="closeTicketModal"
      @complete="completeServiceTicket"
    />

    <PaymentModal
      v-if="showPaymentModal"
      :is-open="showPaymentModal"
      :subtotal="store.subtotal"
      :tax-rate="0.1"
      @close="closePaymentModal"
      @complete="handlePaymentComplete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePosStore } from '~/stores/pos'
import { useDatabase } from '~/composables/useDatabase'

const store = usePosStore()
const { init, getProducts, getCustomers, getServices, getServiceTickets, addServiceTicket } = useDatabase()

// UI State
const activeTab = ref('Products')
const showCustomerModal = ref(false)
const showServiceModal = ref(false)
const showPaymentModal = ref(false)
const showTicketModal = ref(false)
const cartPanel = ref(null)

// Data
const serviceTickets = ref([])
const selectedTicket = ref(null)

// Initialize data
onMounted(async () => {
  await init()
  store.products = await getProducts()
  store.customers = await getCustomers()
  store.services = await getServices()
  serviceTickets.value = await getServiceTickets()
})

// Methods
function addToCart(product) {
  store.addToCart(product)
}

function updateQuantity({ id, change }) {
  store.updateQuantity(id, change)
}

function removeFromCart(id) {
  store.updateQuantity(id, -Infinity)
}

function clearCart() {
  store.clearCart()
}

function handleCustomerChange(customerId) {
  if (customerId === 'new') {
    showCustomerModal.value = true
  } else {
    store.setActiveCustomer(customerId)
  }
}

async function handleCustomerSave(customer) {
  const newCustomer = await store.addCustomer(customer)
  store.setActiveCustomer(newCustomer.id)
  showCustomerModal.value = false
}

function selectService(ticket) {
  selectedTicket.value = ticket
  showTicketModal.value = true
}

async function handleServiceCreate(serviceData) {
  try {
    const ticket = await addServiceTicket(serviceData)
    serviceTickets.value.push(ticket)
    selectedTicket.value = ticket
    showServiceModal.value = false
    showTicketModal.value = true
  } catch (error) {
    console.error('Failed to create service ticket:', error)
  }
}

function closeServiceModal() {
  showServiceModal.value = false
}

function closeTicketModal() {
  showTicketModal.value = false
  selectedTicket.value = null
}

function handleProcessPayment() {
  showPaymentModal.value = true
}

function closePaymentModal() {
  showPaymentModal.value = false
}

async function handlePaymentComplete(paymentDetails) {
  try {
    const transaction = await store.processTransaction(paymentDetails)
    cartPanel.value?.setLastTransaction(transaction)
    showPaymentModal.value = false
  } catch (error) {
    console.error('Payment failed:', error)
  }
}

async function completeServiceTicket(ticket) {
  try {
    const result = await store.completeServiceTicket(ticket)
    if (result) {
      const index = serviceTickets.value.findIndex(t => t.id === ticket.id)
      if (index !== -1) {
        serviceTickets.value[index] = result.ticket
      }
      cartPanel.value?.setLastTransaction(result.transaction)
    }
    showTicketModal.value = false
  } catch (error) {
    console.error('Failed to complete service ticket:', error)
  }
}
</script>