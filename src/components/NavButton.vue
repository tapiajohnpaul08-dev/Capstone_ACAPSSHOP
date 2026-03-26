<template>
  <router-link 
    :to="to"
    class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative"
    :class="active 
      ? 'text-blue-600 bg-blue-50' 
      : 'text-gray-600 hover:bg-gray-100'"
    @click="$emit('click')"
  >
    <component :is="iconComponent" class="h-5 w-5" />
    <span class="hidden md:inline">{{ label }}</span>
    <span v-if="badge > 0" class="absolute -top-1 -right-1 md:static md:ml-1 min-w-[20px] h-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full px-1">
      {{ badge > 99 ? '99+' : badge }}
    </span>
  </router-link>
</template>

<script setup>
import { h } from 'vue'

const props = defineProps({
  to: { type: String, required: true },
  icon: { type: String, required: true },
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
  badge: { type: Number, default: 0 }
})

defineEmits(['click'])

const icons = {
  home: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }),
    h('path', { d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' })
  ]),
  'shopping-bag': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' }),
    h('path', { d: 'M3 6h18' }),
    h('path', { d: 'M16 10a4 4 0 0 1-8 0' })
  ]),
  'shopping-cart': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('circle', { cx: 8, cy: 21, r: 1 }),
    h('circle', { cx: 19, cy: 21, r: 1 }),
    h('path', { d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' })
  ]),
  'message-square': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
  ]),
  user: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: 12, cy: 7, r: 4 })
  ]),
  package: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z' }),
    h('path', { d: 'M12 22V12' }),
    h('polyline', { points: '3.29 7 12 12 20.71 7' })
  ])
}

const iconComponent = () => icons[props.icon]()
</script>