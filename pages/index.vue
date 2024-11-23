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
        :products="products"
        @select="addToCart"
      />
      
      <PosServiceGrid
        v-else
        :services="services"
        @new-service="showServiceModal = true"
        @select="selectService"
      />
    </div>

    <!-- Right Panel -->
    <div class="w-1/3">
      <PosCartPanel
        ref="cartPanel"
        :items="cart"
        :customers="customers"
        :tax-rate="0.1"
        @customer-change="handleCustomerChange"
        @update-quantity="updateQuantity"
        @remove-item="removeFromCart"
        @process-payment="showPaymentModal = true"
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
      @close="showServiceModal = false"
      @create="handleServiceCreate"
    />

    <PaymentModal
      v-if="showPaymentModal"
      :is-open="showPaymentModal"
      :subtotal="store.subtotal"
      :tax-rate="0.1"
      @close="showPaymentModal = false"
      @complete="handlePaymentComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePosStore } from '~/stores/pos'
const { init, getProducts, getCustomers } = useDatabase()

const store = usePosStore()

// UI State
const activeTab = ref('Products')
const showCustomerModal = ref(false)
const showServiceModal = ref(false)
const showPaymentModal = ref(false)
const cartPanel = ref(null)

// Data
const products = computed(() => store.products)
const services = computed(() => store.services)
const customers = computed(() => store.customers)
const cart = computed(() => store.cart)

// Initialize data
onMounted(async () => {
  await init()
  store.products = await getProducts()
  store.customers = await getCustomers()
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

function handleServiceCreate(service) {
  store.addService(service)
  showServiceModal.value = false
}

function selectService(service) {
  // Handle service selection
}

async function handlePaymentComplete(paymentDetails) {
  try {
    const transaction = await store.processTransaction(paymentDetails)
    cartPanel.value?.setLastTransaction(transaction)
    showPaymentModal.value = false
  } catch (error) {
    console.error('Payment failed:', error)
    // Handle error (show error modal, etc.)
  }
}
</script>