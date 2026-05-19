// src/api.js
// ─────────────────────────────────────────────────────────────────────────────
// All API calls live here. Currently mocked with localStorage + fake delay.
// To connect a real backend: swap each mock block with the "REAL API" comment.
// Rules: No TypeScript. No axios. No new libraries. Vanilla fetch only.
// ─────────────────────────────────────────────────────────────────────────────

const mockDelay = (ms = 500) => new Promise((r) => setTimeout(r, ms))

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  async login(email, password) {
    await mockDelay()
    const users = JSON.parse(localStorage.getItem('customerUsers') || '[]')
    const user = users.find((u) => u.email === email && u.password === password)
    if (user) return { success: true, user: { id: user.id, name: user.name, email: user.email }, token: 'demo-token-' + Date.now() }
    return { success: false, message: 'Invalid email or password.' }
    // REAL API: return fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) }).then(r=>r.json())
  },

  async register(userData) {
    await mockDelay()
    const users = JSON.parse(localStorage.getItem('customerUsers') || '[]')
    if (users.find((u) => u.email === userData.email)) return { success: false, message: 'Email already registered.' }
    users.push({ id: Date.now(), ...userData })
    localStorage.setItem('customerUsers', JSON.stringify(users))
    return { success: true }
    // REAL API: return fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(userData) }).then(r=>r.json())
  },

  async sendOtp(email) {
    await mockDelay(800)
    console.log(`[MOCK] OTP sent to ${email} — accept any 6-digit code.`)
    return { success: true, message: `OTP sent to ${email}` }
    // REAL API: return fetch('/api/auth/send-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email}) }).then(r=>r.json())
  },

  async verifyOtp(email, code) {
    await mockDelay(800)
    if (code.length === 6) return { success: true }
    return { success: false, message: 'Invalid OTP code.' }
    // REAL API: return fetch('/api/auth/verify-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,code}) }).then(r=>r.json())
  },

  async changePassword(currentPassword, newPassword) {
    await mockDelay()
    const stored = localStorage.getItem('customerPassword') || 'customer123'
    if (currentPassword !== stored) return { success: false, message: 'Current password is incorrect.' }
    localStorage.setItem('customerPassword', newPassword)
    return { success: true }
    // REAL API: return fetch('/api/auth/change-password', { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${getToken()}`}, body: JSON.stringify({currentPassword,newPassword}) }).then(r=>r.json())
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersApi = {
  // In api.js - update getOrders

async getOrders() {
  await mockDelay()
  const stored = localStorage.getItem('customerOrders')
  if (stored) {
    const orders = JSON.parse(stored)
    // Ensure each order has totalAmount
    const validatedOrders = orders.map(order => ({
      ...order,
      totalAmount: order.totalAmount || 0
    }))
    return { success: true, orders: validatedOrders }
  }
  const { customerOrders } = await import('@/data/ordersData.js')
  localStorage.setItem('customerOrders', JSON.stringify(customerOrders))
  return { success: true, orders: customerOrders }
},

  async getOrder(id) {
    await mockDelay()
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]')
    const order = orders.find((o) => o.id === parseInt(id))
    return order ? { success: true, order } : { success: false, message: 'Order not found.' }
    // REAL API: return fetch(`/api/orders/${id}`, { headers:{ Authorization:`Bearer ${getToken()}` } }).then(r=>r.json())
  },

 // In api.js - update createOrder to include totalAmount
// In api.js - update the createOrder function

async createOrder(orderData) {
  await mockDelay(1200)
  const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]')
  
  // Calculate totalAmount from various possible sources
  let totalAmount = 0
  
  if (orderData.totalAmount) {
    totalAmount = orderData.totalAmount
  } else if (orderData.pricing?.grandTotal) {
    totalAmount = orderData.pricing.grandTotal
  } else if (orderData.items && orderData.items.length > 0) {
    // Calculate from cart items if available
    totalAmount = orderData.items.reduce((sum, item) => {
      return sum + (item.totalPrice || item.quantity * (item.unitPrice || 0))
    }, 0)
  }
  
  const newOrder = {
    id: Date.now(),
    orderNumber: `Order #${1024 + orders.length}`,
    date: new Date().toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' }),
    createdAt: new Date().toISOString(),
    status: 'Pending Review',
    statusValue: 'pending',
    paymentStatus: 'Pending Payment',
    totalAmount: totalAmount,
    product: orderData.product,
    quantity: orderData.quantity,
    sizes: orderData.sizes,
    supplyType: orderData.supplyType,
    deliveryMethod: orderData.deliveryMethod,
    image: orderData.image || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop',
    // Store items array for reorder
    items: orderData.items || [],
    customer: orderData.customer,
    fulfillment: orderData.fulfillment,
    ...orderData
  }
  
  orders.unshift(newOrder)
  localStorage.setItem('customerOrders', JSON.stringify(orders))
  return { success: true, orderId: newOrder.id, order: newOrder }
},

  async cancelOrder(id) {
    await mockDelay()
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]')
    const idx = orders.findIndex((o) => o.id === parseInt(id))
    if (idx === -1) return { success: false, message: 'Order not found.' }
    orders[idx].statusValue = 'cancelled'
    orders[idx].status = 'Cancelled'
    localStorage.setItem('customerOrders', JSON.stringify(orders))
    return { success: true }
    // REAL API: return fetch(`/api/orders/${id}/cancel`, { method:'PATCH', headers:{ Authorization:`Bearer ${getToken()}` } }).then(r=>r.json())
  }
}

// ─── Design Templates ─────────────────────────────────────────────────────────
export const designsApi = {
  async getDesigns() {
    await mockDelay()
    const stored = localStorage.getItem('designTemplates')
    if (stored) return { success: true, designs: JSON.parse(stored) }
    const seed = [
      { id: 1, name: 'ABC Corp Logo', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop', printSize: '3x3 inches', placement: 'Front center', createdAt: 'February 1, 2024' },
      { id: 2, name: 'Coffee Shop Logo', image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400&h=400&fit=crop', printSize: '4x4 inches', placement: 'Wrap around', createdAt: 'January 15, 2024' },
      { id: 3, name: 'Tech Startup Brand', image: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=400&h=400&fit=crop', printSize: '2x2 inches', placement: 'Side print', createdAt: 'March 1, 2024' }
    ]
    localStorage.setItem('designTemplates', JSON.stringify(seed))
    return { success: true, designs: seed }
    // REAL API: return fetch('/api/designs', { headers:{ Authorization:`Bearer ${getToken()}` } }).then(r=>r.json())
  },

  async renameDesign(id, name) {
    await mockDelay()
    const designs = JSON.parse(localStorage.getItem('designTemplates') || '[]')
    const idx = designs.findIndex((d) => d.id === id)
    if (idx === -1) return { success: false, message: 'Not found.' }
    designs[idx].name = name
    localStorage.setItem('designTemplates', JSON.stringify(designs))
    return { success: true }
    // REAL API: return fetch(`/api/designs/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json', Authorization:`Bearer ${getToken()}`}, body: JSON.stringify({name}) }).then(r=>r.json())
  },

  async deleteDesign(id) {
    await mockDelay()
    const designs = JSON.parse(localStorage.getItem('designTemplates') || '[]').filter((d) => d.id !== id)
    localStorage.setItem('designTemplates', JSON.stringify(designs))
    return { success: true }
    // REAL API: return fetch(`/api/designs/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${getToken()}` } }).then(r=>r.json())
  },

  async uploadDesign(file) {
    await mockDelay()
    return { success: true, url: URL.createObjectURL(file) }
    // REAL API: const fd=new FormData(); fd.append('file',file); return fetch('/api/designs/upload', { method:'POST', headers:{ Authorization:`Bearer ${getToken()}` }, body:fd }).then(r=>r.json())
  }
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
export const pricingApi = {
  async getPrice(cupType, quantity, colors = 1) {
    await mockDelay(300)
    const base = { 'PP U-CUPS': 1.8, 'PP Y-CUPS': 1.7, 'SLIM CUPS': 4.0, 'PET CUPS': 2.7, 'PET U-CUPS': 2.2, 'HARD CUPS': 6.85, 'SINGLE WALL PAPER': 1.0, 'DOUBLE WALL WHITE': 7.3, 'DOUBLE WALL BROWN': 7.3, 'DOUBLE WALL BLACK': 7.3 }
    const unitPrice = base[cupType] || 2.0
    const setupFee = (colors - 1) * 500
    return { success: true, unitPrice, setupFee, total: unitPrice * quantity + setupFee }
    // REAL API: return fetch(`/api/price?type=${encodeURIComponent(cupType)}&qty=${quantity}&colors=${colors}`).then(r=>r.json())
  }
}

// ─── User Profile ─────────────────────────────────────────────────────────────
export const profileApi = {
  async getProfile() {
    await mockDelay()
    const raw = localStorage.getItem('currentUser')
    if (!raw) return { success: false, message: 'Not logged in.' }
    const user = JSON.parse(raw)
    return { success: true, user: { ...user, phone: localStorage.getItem('userPhone') || '', company: localStorage.getItem('userCompany') || '' } }
    // REAL API: return fetch('/api/profile', { headers:{ Authorization:`Bearer ${getToken()}` } }).then(r=>r.json())
  },

  async updateProfile(data) {
    await mockDelay()
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
    Object.assign(user, { name: data.name, email: data.email })
    localStorage.setItem('currentUser', JSON.stringify(user))
    localStorage.setItem('userName', data.name)
    localStorage.setItem('userEmail', data.email)
    if (data.phone) localStorage.setItem('userPhone', data.phone)
    if (data.company !== undefined) localStorage.setItem('userCompany', data.company)
    return { success: true }
    // REAL API: return fetch('/api/profile', { method:'PATCH', headers:{'Content-Type':'application/json', Authorization:`Bearer ${getToken()}`}, body: JSON.stringify(data) }).then(r=>r.json())
  }
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const cartApi = {
  async getCart() {
    await mockDelay()
    return { success: true, items: JSON.parse(localStorage.getItem('cartItems') || '[]') }
    // REAL API: return fetch('/api/cart', { headers:{ Authorization:`Bearer ${getToken()}` } }).then(r=>r.json())
  },

  async addToCart(item) {
    await mockDelay()
    const items = JSON.parse(localStorage.getItem('cartItems') || '[]')
    const existing = items.find((i) => i.productId === item.productId && i.size === item.size)
    if (existing) existing.quantity += item.quantity
    else items.push({ ...item, id: Date.now() })
    localStorage.setItem('cartItems', JSON.stringify(items))
    return { success: true, items }
    // REAL API: return fetch('/api/cart', { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${getToken()}`}, body: JSON.stringify(item) }).then(r=>r.json())
  },

  async removeFromCart(id) {
    await mockDelay()
    const items = JSON.parse(localStorage.getItem('cartItems') || '[]').filter((i) => i.id !== id)
    localStorage.setItem('cartItems', JSON.stringify(items))
    return { success: true, items }
    // REAL API: return fetch(`/api/cart/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${getToken()}` } }).then(r=>r.json())
  },

  async clearCart() {
    await mockDelay()
    localStorage.removeItem('cartItems')
    return { success: true }
    // REAL API: return fetch('/api/cart', { method:'DELETE', headers:{ Authorization:`Bearer ${getToken()}` } }).then(r=>r.json())
  }
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messagesApi = {
  async getMessages() {
    await mockDelay()
    return { success: true, messages: JSON.parse(localStorage.getItem('chatMessages') || '[]') }
  },
  async sendMessage(message) {
    await mockDelay()
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]')
    messages.push(message)
    localStorage.setItem('chatMessages', JSON.stringify(messages))
    return { success: true }
  }
}

// ─── Helpers (uncomment when using real API) ──────────────────────────────────
// function getToken() { return localStorage.getItem('customerToken') }