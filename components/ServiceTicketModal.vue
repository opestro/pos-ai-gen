<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Service Ticket</h2>
          <button @click="close" class="text-gray-500 hover:text-gray-700">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
  
        <div class="space-y-4">
          <div class="bg-blue-50 p-4 rounded-md">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium">{{ ticket.customerName }}</p>
                <p class="text-sm text-blue-600">Ticket #{{ ticket.ticketNumber }}</p>
              </div>
              <span 
                class="px-2 py-1 text-sm rounded-full"
                :class="statusClass"
              >
                {{ ticket.status }}
              </span>
            </div>
          </div>
  
          <div>
            <h3 class="font-medium mb-2">Problem Description</h3>
            <p class="text-gray-600">{{ ticket.problem }}</p>
          </div>
  
          <div>
            <h3 class="font-medium mb-2">Required Parts</h3>
            <div class="space-y-1">
              <div 
                v-for="part in ticket.parts" 
                :key="part.id"
                class="flex justify-between text-sm"
              >
                <span>{{ part.name }} (x{{ part.quantity }})</span>
                <span>${{ part.price * part.quantity }}</span>
              </div>
            </div>
          </div>
  
          <div class="bg-gray-50 p-4 rounded-md space-y-2">
            <div class="flex justify-between">
              <span>Parts Total:</span>
              <span>${{ ticket.partsTotal }}</span>
            </div>
            <div class="flex justify-between">
              <span>Service Fee:</span>
              <span>${{ ticket.serviceFee }}</span>
            </div>
            <div class="flex justify-between">
              <span>Additional:</span>
              <span>${{ ticket.profitAmount }}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>Total Price:</span>
              <span>${{ ticket.totalPrice }}</span>
            </div>
          </div>
  
          <div class="flex justify-between items-center text-sm text-gray-500">
            <span>Created: {{ formatDate(ticket.createdAt) }}</span>
            <span v-if="ticket.completedAt">
              Completed: {{ formatDate(ticket.completedAt) }}
            </span>
          </div>
  
          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="printTicket"
              class="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Print Ticket
            </button>
            <button
              v-if="ticket.status === 'pending'"
              @click="completeService"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Complete Service
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    isOpen: Boolean,
    ticket: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['close', 'complete'])
  
  const statusClass = computed(() => ({
    'pending': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800'
  }[props.ticket.status]))
  
  function formatDate(date) {
    return new Date(date).toLocaleString()
  }
  
  function completeService() {
    emit('complete', props.ticket)
  }
  
  function close() {
    emit('close')
  }
  
  function printTicket() {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <html>
        <head>
          <title>Service Ticket #${props.ticket.ticketNumber}</title>
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
            .info {
              margin-bottom: 20px;
            }
            .parts {
              margin: 20px 0;
            }
            .totals {
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
            }
            .total {
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Service Ticket</h2>
            <p>#${props.ticket.ticketNumber}</p>
          </div>
          
          <div class="info">
            <p><strong>Customer:</strong> ${props.ticket.customerName}</p>
            <p><strong>Date:</strong> ${formatDate(props.ticket.createdAt)}</p>
            <p><strong>Status:</strong> ${props.ticket.status}</p>
          </div>
          
          <div class="problem">
            <h3>Problem Description:</h3>
            <p>${props.ticket.problem}</p>
          </div>
          
          <div class="parts">
            <h3>Required Parts:</h3>
            ${props.ticket.parts.map(part => `
              <div>
                ${part.name} (x${part.quantity}) - $${part.price * part.quantity}
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div>Parts Total: $${props.ticket.partsTotal}</div>
            <div>Service Fee: $${props.ticket.serviceFee}</div>
            <div>Additional: $${props.ticket.profitAmount}</div>
            <div class="total">Total Price: $${props.ticket.totalPrice}</div>
          </div>
          
          <div class="footer">
            <p>Please keep this ticket for your records.</p>
            <p>Present this ticket when picking up your device.</p>
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
  </script>