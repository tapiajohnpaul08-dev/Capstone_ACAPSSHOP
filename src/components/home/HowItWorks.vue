<template>
  <div class="bg-white rounded-xl border">
    <div class="px-6 pt-6">
      <h4 class="leading-none text-lg font-semibold">How Our Order Process Works</h4>
    </div>
    <div class="px-6 pb-6">
      <div class="grid md:grid-cols-3 gap-6">
        <div v-for="step in steps" :key="step.number" class="space-y-2">
          <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
            {{ step.number }}
          </div>
          <h3 class="font-semibold">{{ step.title }}</h3>
          <p class="text-sm text-gray-600">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const steps = [
  {
    number: 1,
    title: 'Place Your Order',
    description: 'Provide product details, upload your logo or design, and specify your printing preferences.'
  },
  {
    number: 2,
    title: 'Design Review',
    description: 'Our IT/design team will review and edit your logo if needed, then contact you for approval.'
  },
  {
    number: 3,
    title: 'Production & Delivery',
    description: 'Once approved, we\'ll schedule printing, complete your order, and arrange delivery or pickup.'
  }
]
</script>