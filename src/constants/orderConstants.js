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
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'application/pdf', 'application/postscript', 'application/photoshop'],
  ALLOWED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.pdf', '.ai', '.psd'],
  MAX_SIZE_MB: 20,
  MAX_SIZE_BYTES: 20 * 1024 * 1024
}

export const ETA_CONFIG = {
  UPLOAD_DAYS: 7,
  SAVED_TEMPLATE_DAYS: 5
}

export const PHONE_REGEX = /^(?:\+63|0)[0-9]{10}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/