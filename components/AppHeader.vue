<template>
  <header class="bg-white shadow">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-800">
            Modern POS
          </NuxtLink>
        </div>
        <nav class="flex space-x-4">
          <NuxtLink 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            :class="[
              $route.path === item.path 
                ? 'text-gray-900 bg-gray-100' 
                : 'text-gray-600'
            ]"
          >
            {{ item.name }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
const navItems = [
  { name: 'POS', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Customers', path: '/customers' },
  { name: 'Reports', path: '/reports' },
  { name: 'Settings', path: '/settings' },
]
</script>