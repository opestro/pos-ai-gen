<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Products Management</h1>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add Product
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products..."
        class="flex-1 px-4 py-2 border rounded-md"
      />
      <select v-model="sortBy" class="px-4 py-2 border rounded-md">
        <option value="name">Name</option>
        <option value="price">Price</option>
        <option value="stock">Stock</option>
      </select>
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-lg shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Barcode
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="product in filteredProducts" :key="product.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ product.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">${{ product.price }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ product.stock }}
              <span v-if="product.stock <= 5" class="text-red-500 ml-1">
                (Low Stock)
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.sku }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <canvas :id="'barcode-' + product.id"></canvas>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
              <button
                @click="printBarcode(product)"
                class="text-blue-600 hover:text-blue-900"
              >
                <Icon name="heroicons:printer" class="w-5 h-5" />
              </button>
              <button
                @click="editProduct(product)"
                class="text-gray-600 hover:text-gray-900"
              >
                <Icon name="heroicons:pencil" class="w-5 h-5" />
              </button>
              <button
                @click="deleteProductFunction(product.id)"
                class="text-red-600 hover:text-red-900"
              >
                <Icon name="heroicons:trash" class="w-5 h-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Product Modal -->
    <ProductModal
      v-if="showAddModal"
      :is-open="showAddModal"
      :product="editingProduct"
      @close="closeModal"
      @save="saveProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import JsBarcode from 'jsbarcode'
const { init, getProducts, addProduct, updateProduct, deleteProduct } = useDatabase()

// Initialize database
onMounted(async () => {
  await init()
  await renderBarcodes()
})

const searchQuery = ref('')
const sortBy = ref('name')
const showAddModal = ref(false)
const editingProduct = ref(null)

const products = computed(() => getProducts())

const filteredProducts = computed(() => {
  let filtered = [...products.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
    )
  }
  
  filtered.sort((a, b) => {
    if (sortBy.value === 'price') return a.price - b.price
    if (sortBy.value === 'stock') return a.stock - b.stock
    return a.name.localeCompare(b.name)
  })
  
  return filtered
})

// Watch for changes in products and re-render barcodes
watch(filteredProducts, async () => {
  await nextTick()
  await renderBarcodes()
})

async function renderBarcodes() {
  filteredProducts.value.forEach(product => {
    const canvas = document.getElementById(`barcode-${product.id}`)
    if (canvas) {
      JsBarcode(canvas, product.sku, {
        format: "CODE128",
        width: 1.5,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 0
      })
    }
  })
}

function printBarcode(product) {
  const printWindow = window.open('', '_blank')
  const printContent = `
    <html>
      <head>
        <title>Print Barcode - ${product.name}</title>
        <style>
          body { margin: 20px; font-family: system-ui, sans-serif; }
          .barcode-container { 
            text-align: center;
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #ccc;
          }
          .product-info {
            margin-bottom: 10px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="barcode-container">
          <div class="product-info">
            <strong>${product.name}</strong><br>
            SKU: ${product.sku}<br>
            Price: $${product.price.toFixed(2)}
          </div>
          <canvas id="print-barcode"></canvas>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
        <script>
          JsBarcode("#print-barcode", "${product.sku}", {
            format: "CODE128",
            width: 2,
            height: 100,
            displayValue: true,
            fontSize: 16,
            margin: 10
          });
          setTimeout(() => {
            window.print();
            window.close();
          }, 500);
        <\/script>
      </body>
    </html>
  `
  printWindow.document.write(printContent)
  printWindow.document.close()
}

function editProduct(product) {
  editingProduct.value = { ...product }
  showAddModal.value = true
}

function closeModal() {
  showAddModal.value = false
  editingProduct.value = null
}

async function saveProduct(product) {
  if (product.id) {
    await updateProduct(product)
  } else {
    await addProduct(product)
  }
  closeModal()
}

async function deleteProductFunction(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    await deleteProduct(productId)
  }
}
</script>