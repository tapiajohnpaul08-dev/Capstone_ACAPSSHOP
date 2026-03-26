<template>
  <div class="bg-white rounded-xl border hover:shadow-lg transition-shadow cursor-pointer group">
    <div class="px-6 pt-6">
      <h4 class="leading-none flex items-center gap-2">
        <component :is="iconComponent" :class="`h-6 w-6 text-${iconColor}-600`" />
        {{ title }}
      </h4>
    </div>
    <div class="px-6 pb-6 space-y-4">
      <p class="text-gray-600">{{ description }}</p>
      <ul class="text-sm text-gray-600 space-y-2">
        <li v-for="feature in features" :key="feature">{{ feature }}</li>
      </ul>
      <button 
        @click="$emit('click')"
        class="inline-flex items-center justify-center gap-2 w-full h-9 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <component :is="buttonIconComponent" class="h-4 w-4 mr-2" />
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'package' },
  iconColor: { type: String, default: 'blue' },
  buttonText: { type: String, required: true },
  buttonIcon: { type: String, default: 'plus' },
  features: { type: Array, required: true }
})

defineEmits(['click'])

const icons = {
  package: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z' }),
    h('path', { d: 'M12 22V12' }),
    h('polyline', { points: '3.29 7 12 12 20.71 7' }),
    h('path', { d: 'm7.5 4.27 9 5.15' })
  ]),
  plus: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M5 12h14' }),
    h('path', { d: 'M12 5v14' })
  ]),
  'shopping-bag': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' }),
    h('path', { d: 'M3 6h18' }),
    h('path', { d: 'M16 10a4 4 0 0 1-8 0' })
  ])
}

const iconComponent = () => icons[props.icon]()
const buttonIconComponent = () => icons[props.buttonIcon]()
</script>