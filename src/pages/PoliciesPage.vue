<!-- src/views/customer/PoliciesPage.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8 max-w-5xl">
      <!-- Header -->
      <div class="mb-8">
        <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft class="w-4 h-4" />
          Back
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Policies & Information</h1>
        <p class="text-gray-500 mt-1">Important information about our services, policies, and terms</p>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div class="overflow-x-auto">
          <div class="flex border-b border-gray-200 min-w-max">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-5 py-3 text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-2"
              :class="activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
            >
              <component :is="tab.icon" class="w-4 h-4" />
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="p-6 md:p-8">
          <!-- FAQ -->
          <div v-if="activeTab === 'faq'">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <HelpCircle class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
                <p class="text-sm text-gray-500">Common questions about our platform and services</p>
              </div>
            </div>

            <div class="space-y-4">
              <div
                v-for="(item, index) in faqData"
                :key="index"
                class="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  @click="toggleFaq(index)"
                  class="w-full px-5 py-3.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span class="font-semibold text-gray-800 text-sm">{{ item.question }}</span>
                  <ChevronDown
                    class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
                    :class="{ 'rotate-180': openFaqs.includes(index) }"
                  />
                </button>
                <div
                  v-show="openFaqs.includes(index)"
                  class="px-5 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 leading-relaxed"
                >
                  {{ item.answer }}
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Policy -->
          <div v-else-if="activeTab === 'shipping'">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Truck class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Shipping Policy</h2>
                <p class="text-sm text-gray-500">How we process and deliver your orders</p>
              </div>
            </div>

            <div class="space-y-6">
              <div v-for="(section, index) in shippingData" :key="index">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ section.title }}</h3>
                <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
                  <li v-for="(point, idx) in section.points" :key="idx" class="flex items-start gap-2">
                    <span class="text-blue-500 mt-1">•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Returns & Refunds -->
          <div v-else-if="activeTab === 'returns'">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <RefreshCw class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Returns & Refunds</h2>
                <p class="text-sm text-gray-500">Understanding our return and refund process</p>
              </div>
            </div>

            <div class="space-y-6">
              <div v-for="(section, index) in returnsData" :key="index">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ section.title }}</h3>
                <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
                  <li v-for="(point, idx) in section.points" :key="idx" class="flex items-start gap-2">
                    <span class="text-blue-500 mt-1">•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Privacy Policy -->
          <div v-else-if="activeTab === 'privacy'">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield class="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Privacy Policy</h2>
                <p class="text-sm text-gray-500">How we handle your personal information</p>
              </div>
            </div>

            <div class="space-y-6">
              <div v-for="(section, index) in privacyData" :key="index">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ section.title }}</h3>
                <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
                  <li v-for="(point, idx) in section.points" :key="idx" class="flex items-start gap-2">
                    <span class="text-blue-500 mt-1">•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div v-else-if="activeTab === 'terms'">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <FileText class="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Terms & Conditions</h2>
                <p class="text-sm text-gray-500">Legal terms governing your use of our platform</p>
              </div>
            </div>

            <div class="space-y-6">
              <div v-for="(section, index) in termsData" :key="index">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ section.title }}</h3>
                <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
                  <li v-for="(point, idx) in section.points" :key="idx" class="flex items-start gap-2">
                    <span class="text-blue-500 mt-1">•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Payment Policy -->
          <div v-else-if="activeTab === 'payment'">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CreditCard class="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Payment Policy</h2>
                <p class="text-sm text-gray-500">Payment methods and processes</p>
              </div>
            </div>

            <div class="space-y-6">
              <div v-for="(section, index) in paymentData" :key="index">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ section.title }}</h3>
                <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
                  <li v-for="(point, idx) in section.points" :key="idx" class="flex items-start gap-2">
                    <span class="text-blue-500 mt-1">•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Order Cancellation -->
          <div v-else-if="activeTab === 'cancellation'">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <XCircle class="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Order Cancellation Policy</h2>
                <p class="text-sm text-gray-500">Understanding when and how orders can be cancelled</p>
              </div>
            </div>

            <div class="space-y-6">
              <div v-for="(section, index) in cancellationData" :key="index">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ section.title }}</h3>
                <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
                  <li v-for="(point, idx) in section.points" :key="idx" class="flex items-start gap-2">
                    <span class="text-blue-500 mt-1">•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Disclaimer -->
          <div v-else-if="activeTab === 'disclaimer'">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle class="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Disclaimer</h2>
                <p class="text-sm text-gray-500">Important legal disclaimers</p>
              </div>
            </div>

            <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p v-for="(paragraph, index) in disclaimerData" :key="index" class="mb-3">
                {{ paragraph }}
              </p>
            </div>
          </div>

          <!-- Contact & Support -->
          <div v-else-if="activeTab === 'contact'">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                <Phone class="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Contact & Support</h2>
                <p class="text-sm text-gray-500">How to get in touch with us</p>
              </div>
            </div>

            <div class="space-y-6">
              <div v-for="(section, index) in contactData" :key="index">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ section.title }}</h3>
                <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
                  <li v-for="(point, idx) in section.points" :key="idx" class="flex items-start gap-2">
                    <span class="text-blue-500 mt-1">•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>

              <!-- Contact Info -->
              <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 class="font-semibold text-gray-800 mb-3">Contact Information</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-3">
                    <Phone class="w-4 h-4 text-gray-400" />
                    <span class="text-gray-600">(02) 1234-5678</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <Mail class="w-4 h-4 text-gray-400" />
                    <span class="text-gray-600">info@acapshop.com</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <MapPin class="w-4 h-4 text-gray-400 mt-0.5" />
                    <span class="text-gray-600">Lot 3 Blk 8 Daisy St., Hobart Village, Ugong 1448 City of Valenzuela, NCR, Third District Philippines</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  Truck,
  RefreshCw,
  Shield,
  FileText,
  CreditCard,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  MapPin
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

// ─── State ──────────────────────────────────────────────────────────────

const activeTab = ref('faq')
const openFaqs = ref([])

// ─── Tab Configuration ──────────────────────────────────────────────────

const tabs = [
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'returns', label: 'Returns', icon: RefreshCw },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'terms', label: 'Terms', icon: FileText },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'cancellation', label: 'Cancellation', icon: XCircle },
  { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle },
  { id: 'contact', label: 'Contact', icon: Phone }
]

// ─── Tab Mapping for Query Parameters ──────────────────────────────────

const tabMap = {
  'faq': 'faq',
  'shipping': 'shipping',
  'shipping-policy': 'shipping',
  'returns': 'returns',
  'refunds': 'returns',
  'returns-refunds': 'returns',
  'privacy': 'privacy',
  'privacy-policy': 'privacy',
  'terms': 'terms',
  'terms-conditions': 'terms',
  'payment': 'payment',
  'payment-policy': 'payment',
  'cancellation': 'cancellation',
  'order-cancellation': 'cancellation',
  'disclaimer': 'disclaimer',
  'contact': 'contact',
  'contact-support': 'contact',
  'support': 'contact'
}

// ─── FAQ Data ──────────────────────────────────────────────────────────

const faqData = [
  {
    question: 'How do I create an account?',
    answer: 'To access the system, users must first complete the registration process by providing accurate and complete personal information, such as name, contact details, and login credentials. After successful registration, users can log in using their username and password. The account will serve as the user\'s identity within the system and will be used to track all transactions and activities.'
  },
  {
    question: 'Why is account registration required?',
    answer: 'Account registration is necessary to ensure proper monitoring of orders, secure access to system features, and accurate recording of transactions. It also allows the system to maintain a history of user activities and provide personalized services.'
  },
  {
    question: 'What should I do if I forget my login credentials?',
    answer: 'Users may request account recovery through the available system process. Proper verification may be required to ensure that access is granted only to the rightful account owner.'
  },
  {
    question: 'How do I place an order?',
    answer: 'To place an order, users must log in to their account, browse the available products, and select the desired items along with the required quantity. After reviewing the order details, the user may confirm the transaction. Once confirmed, the system automatically records the order and updates the inventory in real time.'
  },
  {
    question: 'What happens after I place an order?',
    answer: 'After placing an order, the system will process the request and record it under the user\'s account. The order will then move through different stages such as pending, processing, and completed. Users can monitor these updates through the dashboard.'
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Orders may be cancelled only before they are processed. Once the system confirms and processes the order, cancellation requests may no longer be accepted to avoid inconsistencies in inventory and transaction records.'
  },
  {
    question: 'How can I track my order status?',
    answer: 'Users can track their orders through the system dashboard. The status of each order is updated in real time, providing transparency and allowing users to monitor progress.'
  },
  {
    question: 'Why are some products unavailable?',
    answer: 'Products may become unavailable when they are out of stock or temporarily restricted. The system automatically prevents ordering of unavailable items to maintain accurate inventory records.'
  },
  {
    question: 'Is my personal information safe?',
    answer: 'Yes, the system implements security measures such as authentication, access control, and secure data storage to protect user information.'
  }
]

// ─── Shipping Policy Data ─────────────────────────────────────────────

const shippingData = [
  {
    title: 'Order Processing',
    points: [
      'All orders placed through the system are subject to confirmation and product availability.',
      'Processing time may vary depending on the number of orders received, the availability of products, and operational capacity.',
      'The system automatically updates inventory levels once orders are confirmed, ensuring accurate stock monitoring.'
    ]
  },
  {
    title: 'Order Fulfillment',
    points: [
      'Orders may be fulfilled through delivery or scheduled pickup, depending on the arrangement between the customer and ACAPS Trading.',
      'Customers will receive notifications once their orders are ready.',
      'Delivery schedules and timelines may vary depending on factors such as location, order volume, and operational conditions.'
    ]
  },
  {
    title: 'Delays and Limitations',
    points: [
      'High volume of orders',
      'Limited product availability',
      'System maintenance or technical issues',
      'External factors beyond control'
    ]
  },
  {
    title: 'Customer Responsibilities',
    points: [
      'Customers are responsible for providing accurate and complete information, including delivery address and contact details.',
      'Incorrect or incomplete information may result in delays, failed deliveries, or order cancellation.'
    ]
  }
]

// ─── Returns & Refunds Data ───────────────────────────────────────────

const returnsData = [
  {
    title: 'General Policy',
    points: [
      'ACAPS Trading is committed to ensuring customer satisfaction by providing quality products and accurate order processing.',
      'Returns and refunds may be granted under specific conditions.'
    ]
  },
  {
    title: 'Eligible Cases',
    points: [
      'The item received is incorrect',
      'The product is damaged or defective',
      'The order is incomplete'
    ]
  },
  {
    title: 'Conditions for Returns',
    points: [
      'The request must be submitted within a reasonable timeframe after receiving the order',
      'The item must be unused and in its original condition',
      'The item must be returned with complete packaging, if applicable'
    ]
  },
  {
    title: 'Verification Process',
    points: [
      'All return and refund requests are subject to review and verification.',
      'Additional information may be requested from the customer to support the claim.'
    ]
  },
  {
    title: 'Resolution',
    points: [
      'Replacement of the item, or',
      'Refund of the amount paid'
    ]
  },
  {
    title: 'Limitations',
    points: [
      'ACAPS Trading reserves the right to deny any request that does not comply with the policy.',
      'Decisions made after evaluation are considered final.'
    ]
  }
]

// ─── Privacy Policy Data ──────────────────────────────────────────────

const privacyData = [
  {
    title: 'Collection of Information',
    points: [
      'The system collects personal information necessary for its operation, including but not limited to user identification, contact details, account credentials, and transaction history.',
      'This information is collected during account registration and system usage.'
    ]
  },
  {
    title: 'Use of Information',
    points: [
      'Processing and managing orders',
      'Maintaining accurate transaction records',
      'Improving system performance and functionality',
      'Communicating important updates and notifications'
    ]
  },
  {
    title: 'Data Security',
    points: [
      'ACAPS Trading implements appropriate technical and organizational measures to protect user data.',
      'Only authorized personnel are allowed to access sensitive information, and such access is limited to necessary functions.'
    ]
  },
  {
    title: 'Data Sharing',
    points: [
      'Personal information will not be sold or shared with third parties without user consent.',
      'Disclosure may only occur when required by law or authorized authorities.'
    ]
  },
  {
    title: 'User Responsibilities',
    points: [
      'Users are responsible for maintaining the confidentiality of their account credentials.',
      'Any unauthorized access or suspicious activity must be reported immediately.'
    ]
  },
  {
    title: 'Policy Updates',
    points: [
      'ACAPS Trading reserves the right to update this Privacy Policy as necessary.',
      'Users are encouraged to review this policy periodically to stay informed of any changes.'
    ]
  }
]

// ─── Terms & Conditions Data ──────────────────────────────────────────

const termsData = [
  {
    title: 'Acceptance of Terms',
    points: [
      'By creating an account and using the system, the user acknowledges that they have read, understood, and agreed to be bound by these Terms and Conditions.',
      'ACAPS Trading reserves the right to modify or update these Terms and Conditions at any time without prior notice.'
    ]
  },
  {
    title: 'User Accounts',
    points: [
      'Users are required to provide accurate, complete, and up-to-date information during registration.',
      'Users are solely responsible for maintaining the confidentiality of their account credentials.',
      'Users must immediately report any unauthorized use or suspicious activity related to their account.'
    ]
  },
  {
    title: 'Use of the System',
    points: [
      'The system is intended solely for legitimate ordering, inventory monitoring, and related business transactions.',
      'Users are strictly prohibited from providing false information, attempting unauthorized access, or using the system for fraudulent purposes.'
    ]
  },
  {
    title: 'Orders and Transactions',
    points: [
      'All orders submitted through the system are subject to confirmation and product availability.',
      'Users are responsible for ensuring that all order details are accurate before confirming the transaction.',
      'Once an order has been confirmed and processed, it may no longer be modified or cancelled.'
    ]
  },
  {
    title: 'Pricing and Product Information',
    points: [
      'All product prices and details displayed in the system are subject to change without prior notice.',
      'ACAPS Trading reserves the right to correct errors and, if necessary, cancel or adjust affected orders.'
    ]
  },
  {
    title: 'Limitation of Liability',
    points: [
      'ACAPS Trading shall not be held liable for losses resulting from system downtime, user input errors, delays due to unforeseen circumstances, or unauthorized access due to user negligence.'
    ]
  }
]

// ─── Payment Policy Data ──────────────────────────────────────────────

const paymentData = [
  {
    title: 'Accepted Payment Methods',
    points: [
      'Cash on Delivery (COD)',
      'Cash on Pickup',
      'Digital payment services (e.g., e-wallets such as GCash)',
      'Bank transfer or other approved payment channels'
    ]
  },
  {
    title: 'Payment Process',
    points: [
      'All payments must be completed based on the selected payment method during the ordering process.',
      'For Cash on Delivery or Cash on Pickup, payment must be made in full upon receipt of the order.',
      'Orders will only be processed once payment confirmation has been received.'
    ]
  },
  {
    title: 'Payment Verification',
    points: [
      'ACAPS Trading reserves the right to verify payment before processing the order.',
      'Customers may be required to provide proof of payment for validation purposes.'
    ]
  },
  {
    title: 'Failed or Incomplete Payments',
    points: [
      'In cases where payment is unsuccessful, incomplete, or not received within the required timeframe, the order may be automatically cancelled or placed on hold.'
    ]
  },
  {
    title: 'Pricing and Charges',
    points: [
      'All prices displayed in the system are subject to change without prior notice.',
      'Additional charges, such as delivery fees, may apply depending on the order and location.'
    ]
  },
  {
    title: 'Refunds Related to Payments',
    points: [
      'Refunds, when applicable, will be processed in accordance with the Returns and Refunds Policy.'
    ]
  }
]

// ─── Cancellation Policy Data ─────────────────────────────────────────

const cancellationData = [
  {
    title: 'Cancellation by Customer',
    points: [
      'Customers may request to cancel an order provided that the request is made before the order has been processed or prepared.',
      'Once the order status has changed to "processed," "packed," or any equivalent stage, cancellation requests may no longer be accepted.'
    ]
  },
  {
    title: 'Cancellation Process',
    points: [
      'To request a cancellation, customers must submit the request through the system or contact the authorized support channel.',
      'Cancellation requests are not considered valid until officially acknowledged by ACAPS Trading.'
    ]
  },
  {
    title: 'Cancellation by ACAPS Trading',
    points: [
      'Product is out of stock or unavailable',
      'Payment is not completed or verified within the required timeframe',
      'Incorrect or incomplete customer information',
      'Suspected fraudulent or unauthorized transaction',
      'System or operational errors'
    ]
  },
  {
    title: 'Refund for Cancelled Orders',
    points: [
      'If an order is successfully cancelled and payment has already been made, the refund will be processed in accordance with the Returns and Refunds Policy.'
    ]
  },
  {
    title: 'Limitations',
    points: [
      'Repeated or excessive cancellation of orders by a user may result in restrictions or suspension of account privileges.'
    ]
  }
]

// ─── Disclaimer Data ──────────────────────────────────────────────────

const disclaimerData = [
  'ACAPS Trading makes every effort to ensure that all information provided within the system is accurate and up to date. However, the company does not guarantee that all product descriptions, pricing, availability, or system features are free from errors or interruptions.',
  'Product appearance, including color and packaging, may vary from what is displayed due to differences in display settings or supplier changes. Availability of products is subject to inventory levels and may change without prior notice.',
  'ACAPS Trading shall not be held liable for any direct or indirect damages resulting from the use of the system, including but not limited to delays, inaccuracies, or system interruptions.'
]

// ─── Contact & Support Data ──────────────────────────────────────────

const contactData = [
  {
    title: 'Customer Support',
    points: [
      'ACAPS Trading provides customer support to assist users with inquiries, concerns, and issues related to the system, orders, and transactions.',
      'Order-related inquiries',
      'Payment concerns',
      'Returns and refund requests',
      'Technical issues within the system'
    ]
  },
  {
    title: 'Contact Channels',
    points: [
      'Official email address',
      'Contact number',
      'Social media page or messaging platform'
    ]
  },
  {
    title: 'Response Time',
    points: [
      'ACAPS Trading aims to respond to all inquiries within a reasonable timeframe.',
      'Response times may vary depending on the volume of requests and the nature of the concern.'
    ]
  },
  {
    title: 'Customer Responsibility',
    points: [
      'Customers are encouraged to provide complete and accurate information when submitting inquiries or requests to facilitate faster resolution.'
    ]
  }
]

// ─── Methods ──────────────────────────────────────────────────────────

function toggleFaq(index) {
  const idx = openFaqs.value.indexOf(index)
  if (idx === -1) {
    openFaqs.value.push(index)
  } else {
    openFaqs.value.splice(idx, 1)
  }
}

// ─── Set Active Tab from Route Query ──────────────────────────────────

function setActiveTabFromQuery() {
  const tabParam = route.query.tab
  if (tabParam) {
    // Handle both direct matches and variations
    const mappedTab = tabMap[tabParam.toLowerCase()]
    if (mappedTab && tabs.some(t => t.id === mappedTab)) {
      activeTab.value = mappedTab
      return
    }
    
    // If no mapping, check if it matches a tab ID directly
    if (tabs.some(t => t.id === tabParam.toLowerCase())) {
      activeTab.value = tabParam.toLowerCase()
      return
    }
  }
  
  // Default to FAQ if no valid tab is found
  activeTab.value = 'faq'
}

// ─── Lifecycle ─────────────────────────────────────────────────────────

onMounted(() => {
  setActiveTabFromQuery()
})

// Watch for query changes
import { watch } from 'vue'
watch(() => route.query.tab, () => {
  setActiveTabFromQuery()
})
</script>

<style scoped>
/* Smooth transitions */
.chevron-enter-active,
.chevron-leave-active {
  transition: all 0.3s ease;
}

/* Custom scrollbar for tab content */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>