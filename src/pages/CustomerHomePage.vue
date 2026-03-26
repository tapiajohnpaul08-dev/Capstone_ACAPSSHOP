<template>
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <div class="space-y-6">
      <!-- Welcome Section -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold">Welcome to ACAPSHOP</h1>
        <p class="text-gray-600">Custom Printing Services for Cups, Lighters, and More</p>
      </div>

      <!-- Browse Catalog Button -->
      <div class="flex justify-center">
        <button 
          @click="navigateToCatalog"
          class="inline-flex items-center justify-center gap-2 px-6 py-2 h-10 rounded-md border bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Browse Our Product Catalog
        </button>
      </div>

      <!-- Two Card Options -->
      <div class="grid md:grid-cols-2 gap-6">
        <ServiceCard
          title="I'll Provide My Own Cups"
          description="Bring your own cups or products and we'll handle the custom printing with your logo and designs."
          icon="package"
          iconColor="blue"
          buttonText="Create Order"
          buttonIcon="plus"
          :features="[
            '✓ Print on your existing inventory',
            '✓ Upload your custom design',
            '✓ Professional printing service',
            '✓ Fast turnaround time'
          ]"
          @click="createCustomOrder"
        />

        <ServiceCard
          title="Use Company Cups/Products"
          description="Order from our quality product inventory. We'll supply the cups and print your custom designs."
          icon="package"
          iconColor="green"
          buttonText="Browse Products"
          buttonIcon="shopping-bag"
          :features="[
            '✓ High-quality cups and products',
            '✓ Wide selection available',
            '✓ All-in-one solution',
            '✓ Competitive pricing'
          ]"
          @click="browseProducts"
        />
      </div>

      <HowItWorks />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ServiceCard from '@/components/home/ServiceCard.vue'
import HowItWorks from '@/components/home/HowItWorks.vue'

const router = useRouter()

function navigateToCatalog() {
  router.push('/customer/catalog')
}

function createCustomOrder() {
  router.push('/customer/orders/create?type=custom')
}

function browseProducts() {
  router.push('/customer/catalog')
}
</script>