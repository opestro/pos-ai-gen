<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">
          {{ product ? 'Edit Product' : 'Add Product' }}
        </h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="saveProduct" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            v-model.number="form.price"
            type="number"
            step="0.01"
            required
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Stock
          </label>
          <input
            v-model.number="form.stock"
            type="number"
            required
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            v-model="form.category"
            type="text"
            required
            class="w-full px-4 py-2 border rounded-md"
          />
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
          >
            {{ product ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  product: Object
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  name: '',
  price: 0,
  stock: 0,
  category: ''
})

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = { ...newProduct }
  } else {
    form.value = {
      name: '',
      price: 0,
      stock: 0,
      category: ''
    }
  }
}, { immediate: true })

function saveProduct() {
  emit('save', {
    ...form.value,
    id: props.product?.id
  })
}

function close() {
  emit('close')
}
</script>