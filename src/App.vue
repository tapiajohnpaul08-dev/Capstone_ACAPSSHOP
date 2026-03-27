<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script setup>
</script>


<!-- src/
├── views/
│   └── MainLayout.vue        / Customer Layout
├── pages/
│   └── CustomerHomeView.vue      ← assembles the 3 sections, handles navigation
└── components/
│    └── home/
│    │    ├── AppHeader.vue         
│    │    ├── HeroSection.vue      
│    │    ├── OrderTypeCards.vue    
│    │    └── HowItWorksCard.vue  
│    │    
│    │---- other folder for different pages(profile, cart)
│    │
│    │---NavigationBar.vue       
│--- data/
│      │--- dummyData.js   (all data will be here)
│
│------modals/
│         │----(future modals)
│
│-----router/
│         │-----index.html
│
│--App.vue -->