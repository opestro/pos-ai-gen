<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Process Payment</h2>
          <button @click="close" class="text-gray-500 hover:text-gray-700">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
  
        <form @submit.prevent="processPayment" class="space-y-4">
          <!-- Customer Info -->
          <div v-if="customer" class="bg-blue-50 p-4 rounded-md">
            <h3 class="font-medium">Customer: {{ customer.name }}</h3>
            <p class="text-sm text-blue-600">Available Credit: ${{ customer.credit.toFixed(2) }}</p>
          </div>
  
          <!-- Payment Summary -->
          <div class="bg-gray-50 p-4 rounded-md space-y-2">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tax ({{ (taxRate * 100).toFixed() }}%):</span>
              <span>${{ tax.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>Total:</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
          </div>
  
          <!-- Payment Method -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Cash Payment
              </label>
              <input
                v-model.number="cashAmount"
                type="number"
                step="0.01"
                min="0"
                :max="total"
                class="w-full px-4 py-2 border rounded-md"
                @input="updatePaymentDistribution"
              />
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Use Store Credit
              </label>
              <input
                v-model.number="creditAmount"
                type="number"
                step="0.01"
                min="0"
                :max="Math.min(customer?.credit || 0, remainingAmount)"
                class="w-full px-4 py-2 border rounded-md"
                :disabled="!customer?.credit"
                @input="updatePaymentDistribution"
              />
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Add to Store Credit
              </label>
              <input
                v-model.number="newCreditAmount"
                type="number"
                step="0.01"
                min="0"
                :max="remainingAmount"
                class="w-full px-4 py-2 border rounded-md"
                @input="updatePaymentDistribution"
              />
            </div>
          </div>
  
          <!-- Payment Distribution -->
          <div class="bg-gray-50 p-4 rounded-md space-y-2">
            <div class="flex justify-between text-sm">
              <span>Cash Payment:</span>
              <span>${{ cashAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Store Credit Used:</span>
              <span>${{ creditAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>New Store Credit:</span>
              <span>${{ newCreditAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-medium pt-2 border-t">
              <span>Remaining Amount:</span>
              <span :class="remainingAmount > 0 ? 'text-red-600' : 'text-green-600'">
                ${{ remainingAmount.toFixed(2) }}
              </span>
            </div>
          </div>
  
          <div class="flex justify-end space-x-3 pt-4">
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
              Complete Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { usePosStore } from '~/stores/pos'
  
  const store = usePosStore()
  
  const props = defineProps({
    isOpen: Boolean,
    subtotal: {
      type: Number,
      required: true
    },
    taxRate: {
      type: Number,
      default: 0.1
    }
  })
  
  const emit = defineEmits(['close', 'complete'])
  
  // Form state
  const cashAmount = ref(0)
  const creditAmount = ref(0)
  const newCreditAmount = ref(0)
  
  // Computed values
  const tax = computed(() => props.subtotal * props.taxRate)
  const total = computed(() => props.subtotal + tax.value)
  const customer = computed(() => store.activeCustomer ? store.customers.find(c => c.id === store.activeCustomer) : null)
  
  const remainingAmount = computed(() => {
    return total.value - cashAmount.value - creditAmount.value - newCreditAmount.value
  })
  
  const isValid = computed(() => {
    return remainingAmount.value === 0 && 
           cashAmount.value >= 0 &&
           creditAmount.value >= 0 &&
           newCreditAmount.value >= 0 &&
           (creditAmount.value <= (customer.value?.credit || 0))
  })
  
  // Methods
  function updatePaymentDistribution() {
    // Ensure values are non-negative
    cashAmount.value = Math.max(0, cashAmount.value)
    creditAmount.value = Math.max(0, creditAmount.value)
    newCreditAmount.value = Math.max(0, newCreditAmount.value)
  
    // Ensure credit amount doesn't exceed available credit
    if (customer.value) {
      creditAmount.value = Math.min(creditAmount.value, customer.value.credit)
    }
  }
  
  function processPayment() {
    if (!isValid.value) return
  
    const paymentDetails = {
      cash: cashAmount.value,
      creditUsed: creditAmount.value,
      newCredit: newCreditAmount.value,
      total: total.value,
      tax: tax.value,
      subtotal: props.subtotal,
      customerId: customer.value?.id
    }
  
    emit('complete', paymentDetails)
    close()
  }
  
  function close() {
    cashAmount.value = 0
    creditAmount.value = 0
    newCreditAmount.value = 0
    emit('close')
  }
  </script>