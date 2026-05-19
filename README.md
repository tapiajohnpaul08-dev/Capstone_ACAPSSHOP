# Capstone_ACAPSSHOP

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```


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



import { useFeedback } from '@/composables/useFeedback'
const { showSuccess, showError } = useFeedback()

// On successful login:
showSuccess('Login Successful', 'Welcome back! Redirecting you now.')

// On failed login:
showError('Login Failed', 'Invalid email or password. Please try again.')


{
  // Basic Info
  _id: ObjectId,
  orderNumber: string,
  orderType: string,           // 'company-product' | 'own-cups'
  orderSource: string,         // 'catalog' | 'cart'
  createdAt: date,
  updatedAt: date,
  status: string,              // 'pending' | 'review' | 'approved' | 'production' | 'completed' | 'cancelled'
  paymentStatus: string,       // 'pending' | 'paid' | 'failed' | 'refunded'

  // Customer Object (from CustomerInfoCard)
  customer: {
    name: string,
    company: string,
    email: string,
    phone: string,
    address: string,
    saveAsDefault: boolean
  },

  // Fulfillment Object (from FulfillmentCard)
  fulfillment: {
    method: string,            // 'delivery' | 'pickup'
    deliveryAddress: string,
    sameAsCustomer: boolean,
    pickupLocation: string     // store address/details (if pickup)
  },

  // Product Details Object (from ProductDetailsCard)
  productDetails: {
    type: string,              // only for 'own-cups' - e.g., 'Coffee Cups', 'Tumblers'
    quantity: number,
    sizes: string,             // comma-separated: '12oz, 16oz'
    specifications: string
  },

  // Selected Product (for company-product orders)
  selectedProduct: {
    id: number,
    name: string,
    category: string,
    image: string,
    minOrder: number,
    sizes: [{
      name: string,
      price: number,
      bulkPrices: {
        500: number,
        1000: number,
        2000: number,
        5000: number
      }
    }]
  },

  // Design Info Object (from DesignInfoCard)
  designInfo: {
    designSource: string,      // 'upload' | 'saved'
    printSize: string,
    printPlacement: string,
    designNotes: string,
    selectedTemplate: {
      id: number,
      name: string,
      thumbnail: string,
      printSize: string,
      placement: string
    },
    files: [{
      name: string,
      size: number,
      type: string,
      url: string,             // S3/cloud storage URL
      uploadedAt: date
    }]
  },

  // Cart Items (for multi-item orders from cart)
  cartItems: [{
    id: number,
    productId: number,
    name: string,
    category: string,
    image: string,
    size: string,
    quantity: number,
    printPlacement: string,
    printSize: string,
    designNotes: string,
    unitPrice: number,
    totalPrice: number
  }],

  // Pricing & Totals
  pricing: {
    subtotal: number,
    deliveryFee: number,
    setupFee: number,
    tax: number,
    grandTotal: number,
    currency: string            // 'PHP'
  },

  // Timeline / ETA
  estimatedETA: {
    startDate: date,
    endDate: date,
    businessDays: number
  },

  // Audit & Tracking
  createdBy: {
    userId: string,
    userEmail: string
  },
  notes: string,                // internal notes
  cancellationReason: string
}