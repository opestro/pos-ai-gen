<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Customers</h1>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add Customer
      </button>
    </div>

    <!-- Search -->
    <div class="flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search customers..."
        class="flex-1 px-4 py-2 border rounded-md"
      />
    </div>

    <!-- Customers Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transactions
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="customer in filteredCustomers" :key="customer.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ customer.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ customer.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ customer.phone }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ getCustomerTransactionCount(customer.id) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
              <button
                @click="editCustomer(customer)"
                class="text-blue-600 hover:text-blue-900"
              >
                <Icon name="heroicons:pencil" class="w-5 h-5" />
              </button>
              <button
                @click="deleteCustomer(customer.id)"
                class="text-red-600 hover:text-red-900"
              >
                <Icon name="heroicons:trash" class="w-5 h-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Customer Modal -->
    <CustomerModal
      v-if="showAddModal"
      :is-open="showAddModal"
      :customer="editingCustomer"
      @close="closeModal"
      @save="saveCustomer"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const { init, getCustomers, addCustomer, updateCustomer, deleteCustomer, getCustomerTransactions } = useDatabase()

// Initialize database
onMounted(async () => {
  await init()
})

const searchQuery = ref('')
const showAddModal = ref(false)
const editingCustomer = ref(null)

const customers = computed(() => getCustomers())

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value
  
  const query = searchQuery.value.toLowerCase()
  return customers.value.filter(customer => 
    customer.name.toLowerCase().includes(query) ||
    customer.email.toLowerCase().includes(query) ||
    customer.phone.includes(query)
  )
})

function getCustomerTransactionCount(customerId) {
  return getCustomerTransactions(customerId).length
}

function editCustomer(customer) {
  editingCustomer.value = { ...customer }
  showAddModal.value = true
}

function closeModal() {
  showAddModal.value = false
  editingCustomer.value = null
}

function saveCustomer(customer) {
  if (customer.id) {
    updateCustomer(customer)
  } else {
    addCustomer(customer)
  }
  closeModal()
}

function confirmDelete(customerId) {
  if (confirm('Are you sure you want to delete this customer?')) {
    deleteCustomer(customerId)
  }
}
</script>