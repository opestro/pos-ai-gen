<template>
    <div class="space-y-4">
      <div class="flex gap-4">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search items..."
          class="flex-1 px-4 py-2 border rounded-md"
        />
        <button class="px-4 py-2 bg-gray-100 rounded-md">
          <span class="sr-only">Filter</span>
          <Icon name="heroicons:funnel" class="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div class="grid grid-cols-3 gap-4">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
          @click="$emit('select', product)"
        >
          <h3 class="font-medium">{{ product.name }}</h3>
          <p class="text-gray-600">${{ product.price }}</p>
          <p class="text-sm" :class="product.stock <= 5 ? 'text-red-500' : 'text-gray-500'">
            Stock: {{ product.stock }}
            <span v-if="product.stock <= 5">(Low)</span>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const props = defineProps({
    products: {
      type: Array,
      required: true
    }
  })
  
  defineEmits(['select'])
  
  const searchQuery = ref('')
  
  const filteredProducts = computed(() => {
    if (!searchQuery.value) return props.products
    
    const query = searchQuery.value.toLowerCase()
    return props.products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query)
    )
  })
  </script>