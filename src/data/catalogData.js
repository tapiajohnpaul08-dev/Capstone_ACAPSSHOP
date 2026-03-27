export const products = [
  // 1. PP U-CUPS
  {
    id: 1,
    name: 'PP U-CUPS',
    category: 'Cups',
    subcategory: 'PP U-CUPS',
    image: '@/assets/products/1. PP U-CUPS.png',
    sizes: [
      { name: '12oz', price: 1.8, bulkPrices: { 500: 900, 1000: 1800, 2000: 3600, 5000: 9000 } },
      { name: '16oz', price: 2.1, bulkPrices: { 500: 1050, 1000: 2100, 2000: 4200, 5000: 10500 } },
      { name: '22oz', price: 2.4, bulkPrices: { 500: 1200, 1000: 2400, 2000: 4800, 5000: 12000 } }
    ],
    minOrder: 500,
    featured: true,
    popular: true,
    inStock: true,
    popularity: 98,
    description: 'Polypropylene cups with superior clarity and durability. Perfect for cold beverages and custom printing.'
  },
  
  // 2. PP Y-CUPS
  {
    id: 2,
    name: 'PP Y-CUPS',
    category: 'Cups',
    subcategory: 'PP Y-CUPS',
    image: '@/assets/products/2. PP Y-CUPS.png',
    sizes: [
      { name: '12oz', price: 1.7, bulkPrices: { 500: 850, 1000: 1700, 2000: 3400, 5000: 8500 } },
      { name: '16oz', price: 2.0, bulkPrices: { 500: 1000, 1000: 2000, 2000: 4000, 5000: 10000 } },
      { name: '22oz', price: 2.3, bulkPrices: { 500: 1150, 1000: 2300, 2000: 4600, 5000: 11500 } }
    ],
    minOrder: 500,
    featured: true,
    popular: true,
    inStock: true,
    popularity: 95,
    description: 'High-quality Y-shaped polypropylene cups with excellent printability.'
  },
  
  // 3. SLIM CUPS
  {
    id: 3,
    name: 'SLIM CUPS',
    category: 'Cups',
    subcategory: 'SLIM CUPS',
    image: '@/assets/products/3. PP SLIM CUPS.png',
    sizes: [
      { name: '16oz', price: 4.0, bulkPrices: { 500: 2000, 1000: 4000, 2000: 8000, 5000: 20000 } },
      { name: '22oz', price: 4.35, bulkPrices: { 500: 2175, 1000: 4350, 2000: 8700, 5000: 21750 } }
    ],
    minOrder: 500,
    featured: false,
    popular: true,
    inStock: true,
    popularity: 88,
    description: 'Elegant slim design cups perfect for modern cafes and coffee shops.'
  },
  
  // 4. PET CUPS
  {
    id: 4,
    name: 'PET CUPS',
    category: 'Cups',
    subcategory: 'PET CUPS',
    image: '@/assets/products/4. PET CUPS.png',
    sizes: [
      { name: '12oz', price: 2.7, bulkPrices: { 500: 1350, 1000: 2700, 2000: 5400, 5000: 13500 } },
      { name: '16oz', price: 3.0, bulkPrices: { 500: 1500, 1000: 3000, 2000: 6000, 5000: 15000 } },
      { name: '18oz', price: 3.3, bulkPrices: { 500: 1650, 1000: 3300, 2000: 6600, 5000: 16500 } },
      { name: '22oz', price: 3.6, bulkPrices: { 500: 1800, 1000: 3600, 2000: 7200, 5000: 18000 } }
    ],
    minOrder: 500,
    featured: true,
    popular: true,
    inStock: true,
    popularity: 96,
    description: 'Clear PET cups that showcase your beverages beautifully. Ideal for cold drinks.'
  },
  
  // 5. PET U-CUPS
  {
    id: 5,
    name: 'PET U-CUPS',
    category: 'Cups',
    subcategory: 'PET U-CUPS',
    image: '@/assets/products/5. PET U-CUPS.png',
    sizes: [
      { name: '12oz', price: 2.2, bulkPrices: { 500: 1100, 1000: 2200, 2000: 4400, 5000: 11000 } },
      { name: '14oz', price: 2.3, bulkPrices: { 500: 1150, 1000: 2300, 2000: 4600, 5000: 11500 } },
      { name: '18oz', price: 2.6, bulkPrices: { 500: 1300, 1000: 2600, 2000: 5200, 5000: 13000 } },
      { name: '22oz', price: 2.7, bulkPrices: { 500: 1350, 1000: 2700, 2000: 5400, 5000: 13500 } }
    ],
    minOrder: 500,
    featured: false,
    popular: true,
    inStock: true,
    popularity: 92,
    description: 'U-shaped PET cups with enhanced stability and premium clarity.'
  },
  
  // 6. HARD CUPS
  {
    id: 6,
    name: 'HARD CUPS',
    category: 'Cups',
    subcategory: 'HARD CUPS',
    image: '@/assets/products/6. HARD CUPS.png',
    sizes: [
      { name: '16oz', price: 6.85, bulkPrices: { 500: 3425, 1000: 6850, 2000: 13700, 5000: 34250 } },
      { name: '22oz', price: 7.35, bulkPrices: { 500: 3675, 1000: 7350, 2000: 14700, 5000: 36750 } },
      { name: '1L', price: 10.0, bulkPrices: { 500: 5000, 1000: 10000, 2000: 20000, 5000: 50000 } }
    ],
    minOrder: 500,
    featured: true,
    popular: false,
    inStock: true,
    popularity: 82,
    description: 'Durable hard cups perfect for parties, events, and long-lasting use.'
  },
  
  // 7. SINGLE WALL PAPER
  {
    id: 7,
    name: 'SINGLE WALL PAPER',
    category: 'Paper Cups',
    subcategory: 'SINGLE WALL',
    image: '@/assets/products/7. SINGLE WALL PAPER CUP.png',
    sizes: [
      { name: '3oz', price: 0.95, bulkPrices: { 500: 475, 1000: 950, 2000: 1900, 5000: 4750 } },
      { name: '4oz', price: 1.0, bulkPrices: { 500: 500, 1000: 1000, 2000: 2000, 5000: 5000 } }
    ],
    minOrder: 500,
    featured: false,
    popular: true,
    inStock: true,
    popularity: 86,
    description: 'Eco-friendly paper cups for hot beverages. Perfect for coffee shops and events.'
  },
  
  // 8. DOUBLE WALL WHITE
  {
    id: 8,
    name: 'DOUBLE WALL WHITE',
    category: 'Paper Cups',
    subcategory: 'DOUBLE WALL',
    image: '@/assets/products/8. DOUBLE WALL PAPER CUP WHITE.webp',
    sizes: [
      { name: '8oz', price: 7.3, bulkPrices: { 500: 3650, 1000: 7300, 2000: 14600, 5000: 36500 } },
      { name: '12oz', price: 7.8, bulkPrices: { 500: 3900, 1000: 7800, 2000: 15600, 5000: 39000 } },
      { name: '16oz', price: 8.5, bulkPrices: { 500: 4250, 1000: 8500, 2000: 17000, 5000: 42500 } }
    ],
    minOrder: 500,
    featured: true,
    popular: true,
    inStock: true,
    popularity: 94,
    description: 'Double-wall insulated paper cups with excellent heat retention. Keeps beverages hot longer.'
  },
  
  // 9. DOUBLE WALL BROWN
  {
    id: 9,
    name: 'DOUBLE WALL BROWN',
    category: 'Paper Cups',
    subcategory: 'DOUBLE WALL',
    image: '@/assets/products/9. DOUBLE WALL PAPER CUP BROWN.png',
    sizes: [
      { name: '8oz', price: 7.3, bulkPrices: { 500: 3650, 1000: 7300, 2000: 14600, 5000: 36500 } },
      { name: '12oz', price: 7.8, bulkPrices: { 500: 3900, 1000: 7800, 2000: 15600, 5000: 39000 } },
      { name: '16oz', price: 8.5, bulkPrices: { 500: 4250, 1000: 8500, 2000: 17000, 5000: 42500 } }
    ],
    minOrder: 500,
    featured: true,
    popular: true,
    inStock: true,
    popularity: 93,
    description: 'Natural kraft double-wall paper cups for an eco-friendly, rustic look.'
  },
  
  // 10. DOUBLE WALL BLACK
  {
    id: 10,
    name: 'DOUBLE WALL BLACK',
    category: 'Paper Cups',
    subcategory: 'DOUBLE WALL',
    image: '@/assets/products/10. DOUBLE WALL PAPER CUP BLACK.jpg',
    sizes: [
      { name: '8oz', price: 7.3, bulkPrices: { 500: 3650, 1000: 7300, 2000: 14600, 5000: 36500 } },
      { name: '12oz', price: 7.8, bulkPrices: { 500: 3900, 1000: 7800, 2000: 15600, 5000: 39000 } },
      { name: '16oz', price: 8.5, bulkPrices: { 500: 4250, 1000: 8500, 2000: 17000, 5000: 42500 } }
    ],
    minOrder: 500,
    featured: false,
    popular: true,
    inStock: true,
    popularity: 91,
    description: 'Sleek black double-wall paper cups for a modern, premium look.'
  }
]

// Helper function to get price for specific quantity
export function getPriceForQuantity(product, sizeName, quantity) {
  const size = product.sizes.find(s => s.name === sizeName)
  if (!size) return null
  
  if (quantity >= 5000) return size.bulkPrices[5000]
  if (quantity >= 2000) return size.bulkPrices[2000]
  if (quantity >= 1000) return size.bulkPrices[1000]
  if (quantity >= 500) return size.bulkPrices[500]
  return size.price * quantity
}

// Helper function to get price per piece for display
export function getPricePerPiece(product, sizeName, quantity) {
  const totalPrice = getPriceForQuantity(product, sizeName, quantity)
  if (!totalPrice) return null
  return totalPrice / quantity
}