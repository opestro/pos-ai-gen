<template>
    <div class="space-y-4">
        <!-- Customer Selection -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
                Customer
            </label>
            <select v-model="selectedCustomerId" class="w-full px-4 py-2 border rounded-md"
                @change="$emit('customer-change', selectedCustomerId)">
                <option value="">Select customer</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                    {{ customer.name }}
                </option>
                <option value="new">+ New Customer</option>
            </select>
        </div>

        <!-- Cart Items -->
        <div class="border rounded-md">
            <div class="p-4 border-b">
                <h2 class="font-medium">Current Transaction</h2>
            </div>
            <div class="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                <div v-for="item in items" :key="item.id" class="flex justify-between items-center">
                    <div>
                        <p class="font-medium">{{ item.name }}</p>
                        <p class="text-sm text-gray-600">
                            ${{ item.price }} × {{ item.quantity }}
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="p-1 hover:bg-gray-100 rounded"
                            @click="$emit('update-quantity', { id: item.id, change: -1 })">
                            <Icon name="heroicons:minus" class="w-4 h-4" />
                        </button>
                        <span>{{ item.quantity }}</span>
                        <button class="p-1 hover:bg-gray-100 rounded"
                            @click="$emit('update-quantity', { id: item.id, change: 1 })">
                            <Icon name="heroicons:plus" class="w-4 h-4" />
                        </button>
                        <button class="p-1 text-red-600 hover:bg-red-50 rounded" @click="$emit('remove-item', item.id)">
                            <Icon name="heroicons:trash" class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transaction Summary -->
        <div class="space-y-2 p-4 bg-gray-50 rounded-md">
            <div class="flex justify-between">
                <span>Subtotal</span>
                <span>${{ subtotal }}</span>
            </div>
            <div class="flex justify-between">
                <span>Tax ({{ (taxRate * 100).toFixed() }}%)</span>
                <span>${{ tax }}</span>
            </div>
            <div class="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>${{ total }}</span>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2">
            <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                :disabled="!items.length || !selectedCustomerId" @click="emit('process-payment')">
                Process Payment
            </button>
            <button class="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                :disabled="!items.length" @click="$emit('clear-cart')">
                Clear Cart
            </button>
        </div>

        <!-- Print Receipt Button (shown after successful payment) -->
        <button v-if="lastTransaction" @click="printReceipt"
            class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Print Receipt
        </button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    customers: {
        type: Array,
        required: true
    },
    taxRate: {
        type: Number,
        default: 0.1
    }
})

const emit = defineEmits([
    'customer-change',
    'update-quantity',
    'remove-item',
    'process-payment',
    'clear-cart'
])

const selectedCustomerId = ref('')
const lastTransaction = ref(null)

const subtotal = computed(() => {
    return props.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const tax = computed(() => subtotal.value * props.taxRate)
const total = computed(() => subtotal.value + tax.value)

function setLastTransaction(transaction) {
    lastTransaction.value = transaction
}

function printReceipt() {
    if (!lastTransaction.value) return

    const transaction = lastTransaction.value
    const customer = props.customers.find(c => c.id === transaction.customerId)

    const printWindow = window.open('', '_blank')
    const printContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { 
              font-family: 'Courier New', monospace;
              margin: 20px;
              font-size: 12px;
            }
            .header { 
              text-align: center;
              margin-bottom: 20px;
            }
            .items {
              margin: 20px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .totals {
              border-top: 1px dashed #000;
              margin-top: 10px;
              padding-top: 10px;
            }
            .total {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Modern POS</h2>
            <p>${new Date().toLocaleString()}</p>
            ${customer ? `<p>Customer: ${customer.name}</p>` : ''}
          </div>
          
          <div class="items">
            ${transaction.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="item">
              <span>Subtotal:</span>
              <span>$${transaction.subtotal}</span>
            </div>
            <div class="item">
              <span>Tax:</span>
              <span>$${transaction.tax}</span>
            </div>
            <div class="item total">
              <span>Total:</span>
              <span>$${transaction.total}</span>
            </div>
            
            <div class="item">
              <span>Cash Payment:</span>
              <span>$${transaction.cash}</span>
            </div>
            
            ${transaction.creditUsed > 0 ? `
              <div class="item">
                <span>Store Credit Used:</span>
                <span>$${transaction.creditUsed}</span>
              </div>
            ` : ''}
            
            ${transaction.newCredit > 0 ? `
              <div class="item">
                <span>New Store Credit:</span>
                <span>$${transaction.newCredit}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="header">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    setTimeout(() => {
        printWindow.print()
        printWindow.close()
    }, 250)
}

defineExpose({
    setLastTransaction
})</script>