<template>
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <div class="flex gap-4">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search tickets..."
            class="flex-1 px-4 py-2 border rounded-md"
          />
        </div>
        <button 
          @click="$emit('new-service')"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          New Service Ticket
        </button>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="ticket in filteredTickets" 
          :key="ticket.id"
          class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
          @click="$emit('select', ticket)"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="font-medium">{{ ticket.customerName }}</h3>
              <p class="text-sm text-blue-600">Ticket #{{ ticket.ticketNumber }}</p>
            </div>
            <span class="text-sm px-2 py-1 rounded-full" 
                  :class="getStatusClass(ticket.status)">
              {{ ticket.status }}
            </span>
          </div>
          <p class="text-gray-600 text-sm line-clamp-2 mb-2">{{ ticket.problem }}</p>
          <div class="flex justify-between text-sm text-gray-500">
            <span>${{ ticket.totalPrice }}</span>
            <span>{{ formatDate(ticket.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const props = defineProps({
    tickets: {
      type: Array,
      required: true
    }
  })
  
  defineEmits(['new-service', 'select'])
  
  const searchQuery = ref('')
  
  const filteredTickets = computed(() => {
    if (!searchQuery.value) return props.tickets
    
    const query = searchQuery.value.toLowerCase()
    return props.tickets.filter(ticket => 
      ticket.customerName.toLowerCase().includes(query) ||
      ticket.ticketNumber.toLowerCase().includes(query) ||
      ticket.problem.toLowerCase().includes(query)
    )
  })
  
  function getStatusClass(status) {
    return {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800'
    }[status] || 'bg-gray-100 text-gray-800'
  }
  
  function formatDate(date) {
    return new Date(date).toLocaleString()
  }
  </script>