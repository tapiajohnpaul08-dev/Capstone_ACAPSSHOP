// src/constants/orderConstants.js
export const ORDER_TYPES = {
  COMPANY_PRODUCT: 'company-product',
  OWN_CUPS: 'own-cups'
}

export const DESIGN_SOURCES = {
  UPLOAD: 'upload',
  SAVED: 'saved'
}

export const FULFILLMENT_METHODS = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup'
}

export const FILE_CONSTANTS = {
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.pdf'],
  MAX_SIZE_BYTES: 20 * 1024 * 1024, // 20MB
  MAX_SIZE_MB: 20
}

export const ETA_CONFIG = {
  UPLOAD_DAYS: '5-7',
  SAVED_TEMPLATE_DAYS: '3-5'
}

export const PHONE_REGEX = /^(?:\+63|0)[0-9]{10}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/