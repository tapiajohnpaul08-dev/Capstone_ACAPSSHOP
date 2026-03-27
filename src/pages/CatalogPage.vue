<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="mb-6">
      <button 
        @click="goBack"
        class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-4 py-2 mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Back to Home
      </button>
      <h1 class="text-2xl font-bold">Product Catalog</h1>
      <p class="text-gray-600 mt-1">Browse our selection of quality products for custom printing</p>
    </div>

    <!-- Filters Section -->
    <div class="mb-6 space-y-4">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search Input -->
        <div class="flex-1 relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <!-- Category Filter -->
        <select
          v-model="selectedCategory"
          class="w-full md:w-[180px] px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          <option value="all">All Categories</option>
          <option value="cups">Cups</option>
          <option value="mugs">Mugs</option>
          <option value="tumblers">Tumblers</option>
          <option value="lighters">Lighters</option>
        </select>

        <!-- Sort Filter -->
        <select
          v-model="sortBy"
          class="w-full md:w-[180px] px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @click="viewProductDetails(product)"
      />
    </div>

    <!-- Empty State -->
    <div v-if="filteredProducts.length === 0" class="text-center py-12">
      <p class="text-gray-500">No products found matching your criteria.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '@/components/catalog/ProductCard.vue'
import { products } from '@/data/catalogData'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('featured')

const filteredProducts = computed(() => {
  let filtered = [...products]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
  }

  // Apply category filter
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(product => 
      product.category.toLowerCase() === selectedCategory.value
    )
  }

  // Apply sorting
  switch (sortBy.value) {
    case 'price-asc':
      filtered.sort((a, b) => a.price.min - b.price.min)
      break
    case 'price-desc':
      filtered.sort((a, b) => b.price.max - a.price.max)
      break
    case 'popular':
      filtered.sort((a, b) => b.popularity - a.popularity)
      break
    default:
      // featured - keep original order
      break
  }

  return filtered
})

function goBack() {
  router.push('/customer/dashboard')
}

function viewProductDetails(product) {
  router.push(`/customer/product/${product.id}`)
}
</script>