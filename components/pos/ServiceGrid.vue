<template>
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <div class="flex gap-4">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search services..."
            class="flex-1 px-4 py-2 border rounded-md"
          />
        </div>
        <button 
          @click="$emit('new-service')"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          New Service
        </button>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="service in filteredServices" 
          :key="service.id"
          class="p-4 border rounded-lg hover:bg-gray-50"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-medium">{{ service.name }}</h3>
            <span class="text-sm px-2 py-1 rounded-full" 
                  :class="getStatusClass(service.status)">
              {{ service.status }}
            </span>
          </div>
          <p class="text-gray-600 mb-2">${{ service.price.toFixed(2) }}</p>
          <div class="flex justify-between text-sm text-gray-500">
            <span>{{ service.customer }}</span>
            <span>{{ formatDate(service.date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const props = defineProps({
    services: {
      type: Array,
      required: true
    }
  })
  
  defineEmits(['new-service', 'select'])
  
  const searchQuery = ref('')
  
  const filteredServices = computed(() => {
    if (!searchQuery.value) return props.services
    
    const query = searchQuery.value.toLowerCase()
    return props.services.filter(service => 
      service.name.toLowerCase().includes(query) ||
      service.customer.toLowerCase().includes(query)
    )
  })
  
  function getStatusClass(status) {
    return {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    }[status] || 'bg-gray-100 text-gray-800'
  }
  
  function formatDate(date) {
    return new Date(date).toLocaleDateString()
  }
  </script>