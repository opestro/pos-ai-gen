<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg w-full max-w-4xl p-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold">Transaction History</h2>
            <p class="text-gray-600">{{ customer.name }}</p>
          </div>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
  
        <!-- Customer Summary -->
        <div class="bg-blue-50 p-4 rounded-md mb-4 flex justify-between items-center">
          <div>
            <p class="text-sm text-blue-600">Total Purchases: <span class="font-medium">${{ customer.totalPurchases }}</span></p>
            <p class="text-sm text-blue-600">Available Credit: <span class="font-medium">${{ customer.credit }}</span></p>
          </div>
          <button
            @click="printHistory"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Print History
          </button>
        </div>
  
        <!-- Transactions Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Used
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Credit
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in sortedTransactions" :key="transaction.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ formatDate(transaction.createdAt) }}
                </td>
                <td class="px-6 py-4">
                  <div v-for="item in transaction.items" :key="item.id" class="text-sm">
                    {{ item.name }} (x{{ item.quantity }}) - ${{ (item.price * item.quantity) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${{ transaction.total }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  Cash: ${{ transaction.cash }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${{ transaction.creditUsed }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${{ transaction.newCredit }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    isOpen: Boolean,
    customer: {
      type: Object,
      required: true
    },
    transactions: {
      type: Array,
      required: true
    }
  })
  
  defineEmits(['close'])
  
  const sortedTransactions = computed(() => {
    return [...props.transactions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })
  
  function formatDate(date) {
    return new Date(date).toLocaleString()
  }
  
  function printHistory() {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <html>
        <head>
          <title>Transaction History - ${props.customer.name}</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif;
              margin: 20px;
              font-size: 12px;
            }
            .header { 
              text-align: center;
              margin-bottom: 20px;
            }
            .customer-info {
              margin-bottom: 20px;
              padding: 10px;
              background-color: #f0f7ff;
              border-radius: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f8f9fa;
            }
            .total {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Transaction History</h2>
            <p>${props.customer.name}</p>
            <p>${new Date().toLocaleString()}</p>
          </div>
          
          <div class="customer-info">
            <p>Total Purchases: $${props.customer.totalPurchases}</p>
            <p>Available Credit: $${props.customer.credit}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Credit Used</th>
                <th>New Credit</th>
              </tr>
            </thead>
            <tbody>
              ${sortedTransactions.value.map(transaction => `
                <tr>
                  <td>${formatDate(transaction.createdAt)}</td>
                  <td>
                    ${transaction.items.map(item => 
                      `${item.name} (x${item.quantity}) - $${(item.price * item.quantity)}`
                    ).join('<br>')}
                  </td>
                  <td>$${transaction.total}</td>
                  <td>Cash: $${transaction.cash}</td>
                  <td>$${transaction.creditUsed}</td>
                  <td>$${transaction.newCredit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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
  </script>