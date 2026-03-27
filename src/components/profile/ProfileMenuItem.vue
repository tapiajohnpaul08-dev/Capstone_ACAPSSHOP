<template>
  <div>
    <component 
      :is="to ? 'router-link' : 'button'"
      :to="to"
      class="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
      :class="{ 
        'bg-blue-50 text-blue-600': active,
        'cursor-pointer': !to 
      }"
      @click="handleClick"
    >
      <component :is="iconComponent" class="h-5 w-5" :class="{ 'text-blue-600': active, 'text-gray-600': !active }" />
      <div class="flex-1 text-left">
        <div class="font-semibold" :class="{ 'text-blue-600': active }">{{ title }}</div>
        <div class="text-sm" :class="{ 'text-blue-500': active, 'text-gray-600': !active }">{{ description }}</div>
      </div>
      <div v-if="badge" class="text-sm text-gray-500 mr-2">{{ badge }}</div>
      <ChevronRight v-if="chevron" class="h-5 w-5" :class="{ 'text-blue-400': active, 'text-gray-400': !active }" />
    </component>
    <div v-if="showDivider" class="border-t border-gray-100"></div>
  </div>
</template>

<script setup>
import { h } from 'vue'
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  badge: { type: String, default: null },
  chevron: { type: Boolean, default: true },
  showDivider: { type: Boolean, default: true },
  to: { type: String, default: null },
  active: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])

function handleClick() {
  if (!props.to) {
    emit('click')
  }
}

const icons = {
  User: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: 12, cy: 7, r: 4 })
  ]),
  Image: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('rect', { width: 18, height: 18, x: 3, y: 3, rx: 2, ry: 2 }),
    h('circle', { cx: 9, cy: 9, r: 2 }),
    h('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' })
  ]),
  FileText: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }),
    h('path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }),
    h('path', { d: 'M10 9H8' }),
    h('path', { d: 'M16 13H8' }),
    h('path', { d: 'M16 17H8' })
  ]),
  History: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }),
    h('path', { d: 'M3 3v5h5' }),
    h('path', { d: 'M12 7v5l4 2' })
  ]),
  Shield: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' })
  ]),
  Settings: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }),
    h('circle', { cx: 12, cy: 12, r: 3 })
  ]),
  Globe: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' }),
    h('path', { d: 'M2 12h20' })
  ]),
  CircleHelp: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
    h('path', { d: 'M12 17h.01' })
  ]),
  MessageSquare: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [
    h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
  ])
}

const iconComponent = () => icons[props.icon]()
</script>