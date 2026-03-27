<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Hero Banner -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4 py-8 max-w-6xl">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Custom Printing Services</h1>
            <p class="text-gray-500 mt-1">Cups, tumblers, lighters — printed with your brand.</p>
          </div>
          <!-- Primary CTA: own cups order -->
          <button
            @click="createOwnCupsOrder"
            class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Create Order (I'll Provide My Cups)
          </button>
        </div>

        <!-- How it works — compact row -->
        <div class="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg ">
          <div v-for="step in howItWorks" :key="step.number" class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">{{ step.number }}</div>
            <div>
              <div class="text-sm font-semibold text-gray-800">{{ step.title }}</div>
              <div class="text-xs text-gray-500 mt-0.5 leading-snug">{{ step.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Section -->
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Section Header + Filters -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Our Products</h2>
          <p class="text-sm text-gray-500 mt-0.5">Browse and order — we supply the product and print your design.</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Category tabs -->
          <div class="flex gap-1 bg-white border rounded-lg p-1">
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="selectedCategory = cat.value"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              :class="selectedCategory === cat.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Search -->
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-36"
            />
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          @click="product.inStock && orderCompanyProduct(product)"
          class="bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md group"
          :class="product.inStock ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'"
        >
          <!-- Image -->
          <div class="relative">
            <img :src="product.image" :alt="product.name" class="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div class="absolute top-2 left-2 flex flex-col gap-1">
              <span v-if="product.featured" class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white leading-tight">Featured</span>
              <span v-if="product.popular" class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-600 text-white leading-tight">Popular</span>
            </div>
            <span
              class="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold leading-tight"
              :class="product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
            </span>
          </div>

          <!-- Info -->
          <div class="p-3">
            <div class="text-xs text-gray-400 mb-0.5">{{ product.category }}</div>
            <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{{ product.name }}</h3>
            <div class="text-xs text-gray-500 mt-1">{{ getSizeOptions(product) }}</div>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-sm font-bold text-blue-600">{{ formatPrice(product) }}</span>
              <span class="text-[10px] text-gray-400">min {{ product.minOrder }}pcs</span>
            </div>
            <button
              class="mt-2 w-full py-1.5 rounded-md text-xs font-semibold transition-colors"
              :class="product.inStock
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400'"
              :disabled="!product.inStock"
              @click.stop="product.inStock && orderCompanyProduct(product)"
            >
              {{ product.inStock ? 'Order This Product' : 'Out of Stock' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredProducts.length === 0" class="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-300 mb-3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <p class="text-gray-400 text-sm">No products found.</p>
        <button @click="searchQuery = ''; selectedCategory = 'all'" class="mt-2 text-xs text-blue-600 hover:underline">Clear filters</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { products } from '@/data/catalogData'

const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('all')

const howItWorks = [
  { number: 1, title: 'Place Your Order', description: 'Pick a product or bring your own cups, upload your design.' },
  { number: 2, title: 'Design Review', description: 'Our team reviews and contacts you for approval.' },
  { number: 3, title: 'Production & Delivery', description: 'We print and deliver or you pick up.' }
]

const categories = [
  { value: 'all', label: 'All' },
  { value: 'Cups', label: 'Cups' },
  { value: 'Paper Cups', label: 'Paper Cups' },
  { value: 'Mugs', label: 'Mugs' },
  { value: 'Tumblers', label: 'Tumblers' },
  { value: 'Lighters', label: 'Lighters' }
]

const filteredProducts = computed(() => {
  let list = [...products]
  if (selectedCategory.value !== 'all') {
    list = list.filter(p => p.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.subcategory?.toLowerCase().includes(q))
  }
  return list
})

function getSizeOptions(product) {
  if (!product.sizes || product.sizes.length === 0) return 'Standard size'
  const sizeNames = product.sizes.map(s => s.name).join(', ')
  return sizeNames
}

function formatPrice(product) {
  if (!product.sizes || product.sizes.length === 0) return 'Contact for price'
  
  // Get min and max prices across all sizes
  let minPrice = Infinity
  let maxPrice = -Infinity
  
  product.sizes.forEach(size => {
    const price = size.price
    if (price < minPrice) minPrice = price
    if (price > maxPrice) maxPrice = price
  })
  
  if (minPrice === Infinity) return 'Contact for price'
  if (minPrice === maxPrice) return `₱${minPrice.toFixed(2)}`
  return `₱${minPrice.toFixed(2)} – ₱${maxPrice.toFixed(2)}`
}

function createOwnCupsOrder() {
  router.push('/customer/orders/create?type=own-cups')
}

function orderCompanyProduct(product) {
  router.push(`/customer/orders/create?type=company-product&productId=${product.id}`)
}
</script>