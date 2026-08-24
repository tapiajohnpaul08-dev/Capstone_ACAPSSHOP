<template>
  <footer class="bg-gray-900 text-white mt-auto">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">A</span>
            </div>
            <h3 class="text-lg font-bold">ACAPSHOP</h3>
          </div>
          <p class="text-gray-400 text-sm leading-relaxed">
            Custom printing services for cups, tumblers, lighters, and more. 
            Quality products with your brand, professionally printed.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="font-semibold text-white mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li>
              <router-link to="/customer/dashboard" class="text-gray-400 hover:text-white text-sm transition-colors">
                Home
              </router-link>
            </li>
            <li>
              <router-link to="/customer/dashboard" class="text-gray-400 hover:text-white text-sm transition-colors">
                Product Catalog
              </router-link>
            </li>
            <li>
              <router-link to="/customer/orders" class="text-gray-400 hover:text-white text-sm transition-colors">
                My Orders
              </router-link>
            </li>
            <li>
              <router-link to="/customer/profile" class="text-gray-400 hover:text-white text-sm transition-colors">
                My Account
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="font-semibold text-white mb-4">Support</h4>
          <ul class="space-y-2">
            <li>
              <router-link to="/customer/policies?tab=faq" class="text-gray-400 hover:text-white text-sm transition-colors">
                FAQ
              </router-link>
            </li>
            <li>
              <router-link to="/customer/policies?tab=shipping" class="text-gray-400 hover:text-white text-sm transition-colors">
                Shipping Policy
              </router-link>
            </li>
            <li>
              <router-link to="/customer/policies?tab=returns" class="text-gray-400 hover:text-white text-sm transition-colors">
                Returns & Refunds
              </router-link>
            </li>
            <li>
              <router-link to="/customer/policies?tab=privacy" class="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </router-link>
            </li>
            <li>
              <router-link to="/customer/policies?tab=terms" class="text-gray-400 hover:text-white text-sm transition-colors">
                Terms & Conditions
              </router-link>
            </li>
            <li>
              <router-link to="/customer/policies?tab=payment" class="text-gray-400 hover:text-white text-sm transition-colors">
                Payment Policy
              </router-link>
            </li>
            <li>
              <router-link to="/customer/policies?tab=cancellation" class="text-gray-400 hover:text-white text-sm transition-colors">
                Order Cancellation
              </router-link>
            </li>
            <li>
              <router-link to="/customer/policies?tab=disclaimer" class="text-gray-400 hover:text-white text-sm transition-colors">
                Disclaimer
              </router-link>
            </li>
            <li>
              <router-link to="/customer/policies?tab=contact" class="text-gray-400 hover:text-white text-sm transition-colors">
                Contact & Support
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="font-semibold text-white mb-4">Contact Us</h4>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <Phone class="w-4 h-4 text-gray-400 mt-0.5" />
              <span class="text-gray-400 text-sm">(02) 1234-5678</span>
            </li>
            <li class="flex items-start gap-3">
              <Mail class="w-4 h-4 text-gray-400 mt-0.5" />
              <span class="text-gray-400 text-sm">info@acapshop.com</span>
            </li>
            <li class="flex items-start gap-3">
              <MapPin class="w-4 h-4 text-gray-400 mt-0.5" />
              <span class="text-gray-400 text-sm">5051 QUE Grande Ext. Valenzuela, 1440 Manila, Philippines</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-800 mt-8 pt-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-500 text-xs">
            © 2024 ACAPSHOP. All rights reserved.
          </p>
          <div class="flex gap-4">
            <a href="#" class="text-gray-500 hover:text-white transition-colors">
              <Facebook class="w-5 h-5" />
            </a>
            <a href="#" class="text-gray-500 hover:text-white transition-colors">
              <Twitter class="w-5 h-5" />
            </a>
            <a href="#" class="text-gray-500 hover:text-white transition-colors">
              <Instagram class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-vue-next'
</script>