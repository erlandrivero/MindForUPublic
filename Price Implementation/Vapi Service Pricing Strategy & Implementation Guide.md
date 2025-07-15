# Vapi Service Pricing Strategy & Implementation Guide

**Author**: Manus AI  
**Date**: July 11, 2025  
**Version**: 1.0

## Table of Contents

1. [Pricing Strategy Design](#pricing-strategy-design)
2. [MongoDB Schema and Data Models](#mongodb-schema-and-data-models)
3. [Stripe Payment Integration](#stripe-payment-integration)
4. [Customer Management System](#customer-management-system)
5. [Demo and Lead Handling](#demo-and-lead-handling)
6. [Complete Implementation Guide](#complete-implementation-guide)
7. [Testing and Deployment](#testing-and-deployment)

---

## Pricing Strategy Design

### Market Analysis and Cost Structure

Based on Vapi's pricing model where the base platform fee is $0.05 per minute plus provider costs (STT ~$0.01/min, LLM variable, TTS ~$0.01-0.02/min), your total cost per minute ranges from $0.07 to $0.12 depending on the provider stack chosen. To maintain healthy margins while remaining competitive, a pricing strategy should target 300-500% markup on costs.

### Recommended Pricing Tiers

#### Starter Plan - $99 for 80 minutes
- **Cost per minute**: $1.24
- **Target market**: Small businesses, freelancers, testing
- **Margin**: ~400% (assuming $0.25 cost per minute with premium providers)
- **Features**: Basic voice AI, standard support, 30-day usage window
- **Overage rate**: $1.50 per additional minute

#### Professional Plan - $249 for 250 minutes  
- **Cost per minute**: $0.996
- **Target market**: Growing businesses, agencies
- **Margin**: ~400% 
- **Features**: Advanced voice AI, priority support, 60-day usage window, basic analytics
- **Overage rate**: $1.25 per additional minute

#### Business Plan - $499 for 600 minutes
- **Cost per minute**: $0.83
- **Target market**: Established businesses, high-volume users
- **Margin**: ~330%
- **Features**: Premium voice AI, dedicated support, 90-day usage window, advanced analytics, custom integrations
- **Overage rate**: $1.00 per additional minute

#### Enterprise Plan - $999 for 1,500 minutes
- **Cost per minute**: $0.67
- **Target market**: Large enterprises, high-volume applications
- **Margin**: ~270%
- **Features**: Enterprise voice AI, 24/7 support, 120-day usage window, white-label options, custom development
- **Overage rate**: $0.85 per additional minute

#### Enterprise Plus - $1,999 for 3,500 minutes
- **Cost per minute**: $0.57
- **Target market**: Very large enterprises, platform integrators
- **Margin**: ~230%
- **Features**: All Enterprise features plus dedicated infrastructure, SLA guarantees, unlimited integrations
- **Overage rate**: $0.75 per additional minute

### Pricing Psychology and Strategy

The pricing structure follows established SaaS pricing psychology principles. The $99 entry point removes the psychological barrier of the $100 threshold while providing substantial value. Each tier offers approximately 2.5x the minutes of the previous tier while reducing the per-minute cost, encouraging upgrades.

The 80-minute starter package provides enough usage for meaningful testing and small-scale deployment while creating a natural upgrade path as usage grows. The overage pricing is intentionally higher than the bundled rates to encourage plan upgrades rather than overage usage.

### Competitive Positioning

This pricing positions your service in the premium segment of the voice AI market, justified by the advanced capabilities of Vapi's platform and your value-added services. The pricing is competitive with enterprise communication solutions while being accessible to smaller businesses through the starter tier.

### Revenue Projections

Based on typical SaaS conversion rates and pricing tier distribution:
- 40% of customers choose Starter ($99)
- 35% choose Professional ($249) 
- 20% choose Business ($499)
- 4% choose Enterprise ($999)
- 1% choose Enterprise Plus ($1,999)

With 1,000 customers, monthly recurring revenue would be approximately $234,000, with healthy margins supporting growth and customer acquisition costs.


## MongoDB Schema and Data Models

### Database Design Philosophy

The MongoDB schema design follows a document-oriented approach optimized for the specific access patterns of a voice AI service. The design prioritizes query performance for real-time operations while maintaining data consistency and supporting analytical reporting requirements.

The schema uses embedded documents for related data that is frequently accessed together, while maintaining references for data that may be queried independently. This approach minimizes the number of database queries required for common operations while maintaining flexibility for complex reporting needs.

### Core Collections

#### Customers Collection

The customers collection serves as the central repository for all customer information, including account details, subscription status, and usage tracking. The schema supports both individual and enterprise customers with flexible contact and billing information.

```javascript
// customers collection schema
{
  _id: ObjectId,
  customerNumber: String, // Format: "CUST-YYYYMMDD-XXXX" (unique)
  email: String, // unique index
  profile: {
    firstName: String,
    lastName: String,
    company: String,
    phone: String,
    timezone: String,
    language: String // default: "en-US"
  },
  billing: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    taxId: String, // VAT/Tax ID for business customers
    billingEmail: String // if different from main email
  },
  subscription: {
    planId: String, // references pricing_plans.planId
    status: String, // "active", "cancelled", "suspended", "trial"
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    minutesIncluded: Number,
    minutesUsed: Number,
    minutesRemaining: Number,
    autoRenew: Boolean,
    trialEnd: Date,
    cancelledAt: Date,
    cancelReason: String
  },
  stripeCustomerId: String, // Stripe customer ID
  vapiConfig: {
    assistantIds: [String], // Array of Vapi assistant IDs
    phoneNumbers: [String], // Array of assigned phone numbers
    webhookUrl: String,
    apiKeyHash: String // Hashed API key for security
  },
  usage: {
    totalMinutesUsed: Number,
    currentMonthMinutes: Number,
    lastCallDate: Date,
    averageCallDuration: Number,
    totalCalls: Number
  },
  metadata: {
    source: String, // "demo", "website", "referral", "api"
    referralCode: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    notes: String
  },
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  isActive: Boolean
}
```

#### Pricing Plans Collection

The pricing plans collection defines all available subscription tiers and their associated features. This collection enables dynamic pricing changes and A/B testing of different pricing strategies without code modifications.

```javascript
// pricing_plans collection schema
{
  _id: ObjectId,
  planId: String, // unique identifier like "starter", "professional", etc.
  name: String,
  description: String,
  pricing: {
    amount: Number, // in cents
    currency: String, // "usd"
    interval: String, // "month", "year"
    intervalCount: Number // 1 for monthly, 12 for yearly
  },
  features: {
    minutesIncluded: Number,
    overageRate: Number, // per minute in cents
    usageWindow: Number, // days until minutes expire
    maxConcurrentCalls: Number,
    supportLevel: String, // "standard", "priority", "dedicated"
    analyticsLevel: String, // "basic", "advanced", "enterprise"
    customIntegrations: Boolean,
    whiteLabel: Boolean,
    slaGuarantee: Boolean
  },
  limits: {
    maxAssistants: Number,
    maxPhoneNumbers: Number,
    maxWebhooks: Number,
    apiRateLimit: Number // requests per minute
  },
  stripePriceId: String, // Stripe price ID for billing
  isActive: Boolean,
  sortOrder: Number, // for display ordering
  createdAt: Date,
  updatedAt: Date
}
```

#### Usage Tracking Collection

The usage tracking collection provides detailed logging of all voice AI usage, enabling accurate billing, analytics, and optimization insights. The schema supports real-time usage monitoring and historical analysis.

```javascript
// usage_logs collection schema
{
  _id: ObjectId,
  customerNumber: String, // indexed
  callId: String, // Vapi call ID
  sessionId: String, // for grouping related calls
  usage: {
    startTime: Date,
    endTime: Date,
    duration: Number, // in seconds
    durationMinutes: Number, // calculated field for billing
    callType: String, // "inbound", "outbound", "test"
    phoneNumber: String,
    customerPhone: String
  },
  costs: {
    vapiCost: Number, // Vapi platform cost in cents
    sttCost: Number, // Speech-to-text cost
    llmCost: Number, // Language model cost
    ttsCost: Number, // Text-to-speech cost
    telephonyCost: Number, // Phone service cost
    totalCost: Number // sum of all costs
  },
  quality: {
    audioQuality: Number, // 0-1 score
    responseTime: Number, // average response time in ms
    completionRate: Number, // 0-1 score
    userSatisfaction: Number, // if available
    errorCount: Number
  },
  metadata: {
    assistantId: String,
    assistantName: String,
    transcript: String, // full conversation transcript
    summary: String, // AI-generated summary
    intent: String, // detected user intent
    resolution: String, // "resolved", "escalated", "abandoned"
    tags: [String] // for categorization
  },
  billing: {
    planId: String,
    billingPeriod: String, // "2025-01" format
    charged: Boolean,
    chargeAmount: Number, // amount charged to customer in cents
    isOverage: Boolean
  },
  createdAt: Date
}
```

#### Demo Requests Collection

The demo requests collection manages all demo and trial requests, supporting lead qualification and conversion tracking. The schema captures comprehensive lead information for sales and marketing analysis.

```javascript
// demo_requests collection schema
{
  _id: ObjectId,
  demoNumber: String, // Format: "DEMO-YYYYMMDD-XXXX" (unique)
  leadInfo: {
    email: String,
    firstName: String,
    lastName: String,
    company: String,
    jobTitle: String,
    phone: String,
    website: String,
    companySize: String, // "1-10", "11-50", "51-200", "201-1000", "1000+"
    industry: String,
    useCase: String,
    expectedVolume: String // "< 1000", "1000-5000", "5000+", "enterprise"
  },
  demoDetails: {
    requestedDate: Date,
    preferredTime: String,
    timezone: String,
    demoType: String, // "live", "self-service", "trial"
    duration: Number, // requested duration in minutes
    specialRequests: String,
    technicalRequirements: String
  },
  qualification: {
    budget: String, // "< $500", "$500-2000", "$2000-5000", "$5000+"
    timeline: String, // "immediate", "1-3 months", "3-6 months", "6+ months"
    authority: String, // "decision maker", "influencer", "researcher"
    currentSolution: String,
    painPoints: [String],
    leadScore: Number // 0-100 calculated score
  },
  status: {
    current: String, // "requested", "scheduled", "completed", "converted", "lost"
    scheduledDate: Date,
    completedDate: Date,
    followUpDate: Date,
    assignedTo: String, // sales rep ID
    notes: [String],
    conversionProbability: Number // 0-100
  },
  tracking: {
    source: String, // "website", "referral", "advertising", "social"
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    referralCode: String,
    landingPage: String,
    ipAddress: String,
    userAgent: String
  },
  trial: {
    isTrialRequested: Boolean,
    trialDuration: Number, // days
    trialStartDate: Date,
    trialEndDate: Date,
    trialUsage: {
      minutesUsed: Number,
      callsCompleted: Number,
      lastActivity: Date
    },
    trialCustomerNumber: String // if converted to trial customer
  },
  createdAt: Date,
  updatedAt: Date,
  convertedAt: Date,
  convertedToCustomerNumber: String
}
```

#### Payments Collection

The payments collection tracks all financial transactions, providing comprehensive billing history and supporting revenue recognition and financial reporting requirements.

```javascript
// payments collection schema
{
  _id: ObjectId,
  paymentId: String, // unique payment identifier
  customerNumber: String, // indexed
  stripePaymentIntentId: String,
  stripeInvoiceId: String,
  billing: {
    amount: Number, // in cents
    currency: String,
    description: String,
    billingPeriod: {
      start: Date,
      end: Date,
      label: String // "January 2025"
    },
    planId: String,
    planName: String
  },
  usage: {
    includedMinutes: Number,
    usedMinutes: Number,
    overageMinutes: Number,
    overageAmount: Number, // in cents
    usageDetails: [{
      date: Date,
      minutes: Number,
      cost: Number
    }]
  },
  payment: {
    status: String, // "pending", "succeeded", "failed", "refunded"
    method: String, // "card", "bank_transfer", "invoice"
    paidAt: Date,
    failedAt: Date,
    failureReason: String,
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String
  },
  taxes: {
    taxRate: Number, // percentage
    taxAmount: Number, // in cents
    taxRegion: String,
    taxId: String
  },
  metadata: {
    invoiceNumber: String,
    dueDate: Date,
    notes: String,
    tags: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes and Performance Optimization

To ensure optimal query performance, the following indexes should be created on the collections:

```javascript
// Customer collection indexes
db.customers.createIndex({ "customerNumber": 1 }, { unique: true })
db.customers.createIndex({ "email": 1 }, { unique: true })
db.customers.createIndex({ "stripeCustomerId": 1 })
db.customers.createIndex({ "subscription.status": 1 })
db.customers.createIndex({ "createdAt": 1 })
db.customers.createIndex({ "metadata.source": 1 })

// Usage logs indexes
db.usage_logs.createIndex({ "customerNumber": 1, "createdAt": -1 })
db.usage_logs.createIndex({ "callId": 1 }, { unique: true })
db.usage_logs.createIndex({ "billing.billingPeriod": 1 })
db.usage_logs.createIndex({ "usage.startTime": 1 })
db.usage_logs.createIndex({ "billing.charged": 1 })

// Demo requests indexes
db.demo_requests.createIndex({ "demoNumber": 1 }, { unique: true })
db.demo_requests.createIndex({ "leadInfo.email": 1 })
db.demo_requests.createIndex({ "status.current": 1 })
db.demo_requests.createIndex({ "createdAt": 1 })
db.demo_requests.createIndex({ "qualification.leadScore": -1 })

// Payments indexes
db.payments.createIndex({ "customerNumber": 1, "createdAt": -1 })
db.payments.createIndex({ "paymentId": 1 }, { unique: true })
db.payments.createIndex({ "stripePaymentIntentId": 1 })
db.payments.createIndex({ "payment.status": 1 })
db.payments.createIndex({ "billing.billingPeriod.start": 1 })

// Pricing plans indexes
db.pricing_plans.createIndex({ "planId": 1 }, { unique: true })
db.pricing_plans.createIndex({ "isActive": 1, "sortOrder": 1 })
```

### Data Validation and Constraints

MongoDB schema validation ensures data integrity and consistency across all collections. The validation rules enforce required fields, data types, and business logic constraints.

```javascript
// Customer collection validation
db.createCollection("customers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["customerNumber", "email", "profile", "subscription", "createdAt"],
      properties: {
        customerNumber: {
          bsonType: "string",
          pattern: "^CUST-[0-9]{8}-[0-9]{4}$"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        "subscription.status": {
          enum: ["active", "cancelled", "suspended", "trial"]
        },
        "subscription.minutesUsed": {
          bsonType: "number",
          minimum: 0
        }
      }
    }
  }
})

// Usage logs validation
db.createCollection("usage_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["customerNumber", "callId", "usage", "costs", "createdAt"],
      properties: {
        "usage.duration": {
          bsonType: "number",
          minimum: 0
        },
        "costs.totalCost": {
          bsonType: "number",
          minimum: 0
        }
      }
    }
  }
})
```


## Stripe Payment Integration

### Stripe Configuration and Setup

The Stripe integration provides comprehensive payment processing capabilities including subscription management, usage-based billing, and automated invoice generation. The implementation follows Stripe's best practices for security, reliability, and scalability.

The integration supports multiple payment scenarios including one-time payments, recurring subscriptions, usage-based billing for overages, and trial period management. The system handles webhook events for real-time payment status updates and automated customer lifecycle management.

### Stripe Product and Price Configuration

Before implementing the payment system, configure your products and prices in Stripe to match your pricing strategy. This configuration enables dynamic pricing management and supports A/B testing of different pricing models.

```python
import stripe
from datetime import datetime, timedelta
import os

# Stripe configuration
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

class StripeProductManager:
    def __init__(self):
        self.products = {}
        self.prices = {}
    
    def create_products_and_prices(self):
        """Create all products and prices in Stripe"""
        
        # Starter Plan
        starter_product = stripe.Product.create(
            name="Starter Plan",
            description="Perfect for small businesses and testing - 80 minutes included",
            metadata={
                "plan_id": "starter",
                "minutes_included": "80",
                "usage_window_days": "30"
            }
        )
        
        starter_price = stripe.Price.create(
            product=starter_product.id,
            unit_amount=9900,  # $99.00 in cents
            currency='usd',
            recurring={'interval': 'month'},
            metadata={
                "plan_id": "starter",
                "overage_rate": "150"  # $1.50 per minute in cents
            }
        )
        
        # Professional Plan
        professional_product = stripe.Product.create(
            name="Professional Plan",
            description="For growing businesses - 250 minutes included",
            metadata={
                "plan_id": "professional",
                "minutes_included": "250",
                "usage_window_days": "60"
            }
        )
        
        professional_price = stripe.Price.create(
            product=professional_product.id,
            unit_amount=24900,  # $249.00 in cents
            currency='usd',
            recurring={'interval': 'month'},
            metadata={
                "plan_id": "professional",
                "overage_rate": "125"  # $1.25 per minute in cents
            }
        )
        
        # Business Plan
        business_product = stripe.Product.create(
            name="Business Plan",
            description="For established businesses - 600 minutes included",
            metadata={
                "plan_id": "business",
                "minutes_included": "600",
                "usage_window_days": "90"
            }
        )
        
        business_price = stripe.Price.create(
            product=business_product.id,
            unit_amount=49900,  # $499.00 in cents
            currency='usd',
            recurring={'interval': 'month'},
            metadata={
                "plan_id": "business",
                "overage_rate": "100"  # $1.00 per minute in cents
            }
        )
        
        # Enterprise Plan
        enterprise_product = stripe.Product.create(
            name="Enterprise Plan",
            description="For large enterprises - 1,500 minutes included",
            metadata={
                "plan_id": "enterprise",
                "minutes_included": "1500",
                "usage_window_days": "120"
            }
        )
        
        enterprise_price = stripe.Price.create(
            product=enterprise_product.id,
            unit_amount=99900,  # $999.00 in cents
            currency='usd',
            recurring={'interval': 'month'},
            metadata={
                "plan_id": "enterprise",
                "overage_rate": "85"  # $0.85 per minute in cents
            }
        )
        
        # Enterprise Plus Plan
        enterprise_plus_product = stripe.Product.create(
            name="Enterprise Plus Plan",
            description="For very large enterprises - 3,500 minutes included",
            metadata={
                "plan_id": "enterprise_plus",
                "minutes_included": "3500",
                "usage_window_days": "120"
            }
        )
        
        enterprise_plus_price = stripe.Price.create(
            product=enterprise_plus_product.id,
            unit_amount=199900,  # $1,999.00 in cents
            currency='usd',
            recurring={'interval': 'month'},
            metadata={
                "plan_id": "enterprise_plus",
                "overage_rate": "75"  # $0.75 per minute in cents
            }
        )
        
        return {
            "starter": {"product": starter_product, "price": starter_price},
            "professional": {"product": professional_product, "price": professional_price},
            "business": {"product": business_product, "price": business_price},
            "enterprise": {"product": enterprise_product, "price": enterprise_price},
            "enterprise_plus": {"product": enterprise_plus_product, "price": enterprise_plus_price}
        }
```

### Customer and Subscription Management

The customer management system integrates Stripe customers with your MongoDB customer records, maintaining data consistency and enabling comprehensive customer lifecycle management.

```python
from pymongo import MongoClient
from datetime import datetime, timedelta
import uuid
import hashlib

class CustomerManager:
    def __init__(self, mongo_uri, stripe_api_key):
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client.vapi_service
        stripe.api_key = stripe_api_key
    
    def generate_customer_number(self):
        """Generate unique customer number in format CUST-YYYYMMDD-XXXX"""
        today = datetime.now().strftime("%Y%m%d")
        random_suffix = str(uuid.uuid4().int)[:4]
        return f"CUST-{today}-{random_suffix}"
    
    def create_customer(self, email, profile_data, plan_id, payment_method_id=None):
        """Create new customer with Stripe integration"""
        
        # Generate unique customer number
        customer_number = self.generate_customer_number()
        
        # Ensure customer number is unique
        while self.db.customers.find_one({"customerNumber": customer_number}):
            customer_number = self.generate_customer_number()
        
        # Create Stripe customer
        stripe_customer = stripe.Customer.create(
            email=email,
            name=f"{profile_data.get('firstName', '')} {profile_data.get('lastName', '')}",
            phone=profile_data.get('phone'),
            metadata={
                "customer_number": customer_number,
                "company": profile_data.get('company', ''),
                "source": profile_data.get('source', 'direct')
            }
        )
        
        # Attach payment method if provided
        if payment_method_id:
            stripe.PaymentMethod.attach(
                payment_method_id,
                customer=stripe_customer.id
            )
            
            # Set as default payment method
            stripe.Customer.modify(
                stripe_customer.id,
                invoice_settings={'default_payment_method': payment_method_id}
            )
        
        # Get plan details
        plan = self.db.pricing_plans.find_one({"planId": plan_id})
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        # Calculate subscription period
        current_period_start = datetime.utcnow()
        current_period_end = current_period_start + timedelta(days=30)  # Monthly billing
        
        # Create MongoDB customer record
        customer_doc = {
            "customerNumber": customer_number,
            "email": email,
            "profile": {
                "firstName": profile_data.get('firstName', ''),
                "lastName": profile_data.get('lastName', ''),
                "company": profile_data.get('company', ''),
                "phone": profile_data.get('phone', ''),
                "timezone": profile_data.get('timezone', 'UTC'),
                "language": profile_data.get('language', 'en-US')
            },
            "billing": profile_data.get('billing', {}),
            "subscription": {
                "planId": plan_id,
                "status": "trial" if profile_data.get('trial', False) else "active",
                "currentPeriodStart": current_period_start,
                "currentPeriodEnd": current_period_end,
                "minutesIncluded": plan['features']['minutesIncluded'],
                "minutesUsed": 0,
                "minutesRemaining": plan['features']['minutesIncluded'],
                "autoRenew": True,
                "trialEnd": current_period_start + timedelta(days=14) if profile_data.get('trial', False) else None
            },
            "stripeCustomerId": stripe_customer.id,
            "vapiConfig": {
                "assistantIds": [],
                "phoneNumbers": [],
                "webhookUrl": "",
                "apiKeyHash": ""
            },
            "usage": {
                "totalMinutesUsed": 0,
                "currentMonthMinutes": 0,
                "lastCallDate": None,
                "averageCallDuration": 0,
                "totalCalls": 0
            },
            "metadata": {
                "source": profile_data.get('source', 'direct'),
                "referralCode": profile_data.get('referralCode'),
                "utmSource": profile_data.get('utmSource'),
                "utmMedium": profile_data.get('utmMedium'),
                "utmCampaign": profile_data.get('utmCampaign'),
                "notes": ""
            },
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "lastLoginAt": None,
            "isActive": True
        }
        
        # Insert customer record
        result = self.db.customers.insert_one(customer_doc)
        
        return {
            "customer_number": customer_number,
            "stripe_customer_id": stripe_customer.id,
            "mongo_id": str(result.inserted_id)
        }
    
    def create_subscription(self, customer_number, plan_id, trial_days=None):
        """Create Stripe subscription for customer"""
        
        # Get customer record
        customer = self.db.customers.find_one({"customerNumber": customer_number})
        if not customer:
            raise ValueError(f"Customer {customer_number} not found")
        
        # Get plan details
        plan = self.db.pricing_plans.find_one({"planId": plan_id})
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        # Create subscription parameters
        subscription_params = {
            "customer": customer['stripeCustomerId'],
            "items": [{"price": plan['stripePriceId']}],
            "metadata": {
                "customer_number": customer_number,
                "plan_id": plan_id
            },
            "expand": ["latest_invoice.payment_intent"]
        }
        
        # Add trial period if specified
        if trial_days:
            subscription_params["trial_period_days"] = trial_days
        
        # Create Stripe subscription
        subscription = stripe.Subscription.create(**subscription_params)
        
        # Update customer record
        self.db.customers.update_one(
            {"customerNumber": customer_number},
            {
                "$set": {
                    "subscription.status": "trialing" if trial_days else "active",
                    "subscription.stripeSubscriptionId": subscription.id,
                    "subscription.currentPeriodStart": datetime.fromtimestamp(subscription.current_period_start),
                    "subscription.currentPeriodEnd": datetime.fromtimestamp(subscription.current_period_end),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return subscription
```

### Usage-Based Billing Implementation

The usage-based billing system tracks customer usage in real-time and generates accurate invoices including overage charges. The system integrates with Vapi webhooks to capture usage data automatically.

```python
class UsageBillingManager:
    def __init__(self, mongo_uri, stripe_api_key):
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client.vapi_service
        stripe.api_key = stripe_api_key
    
    def record_usage(self, customer_number, call_data):
        """Record usage from Vapi webhook"""
        
        # Get customer record
        customer = self.db.customers.find_one({"customerNumber": customer_number})
        if not customer:
            raise ValueError(f"Customer {customer_number} not found")
        
        # Calculate duration in minutes (round up)
        duration_seconds = call_data.get('duration', 0)
        duration_minutes = max(1, (duration_seconds + 59) // 60)  # Round up to next minute
        
        # Calculate costs
        vapi_cost = duration_minutes * 5  # $0.05 per minute in cents
        stt_cost = duration_minutes * 1   # ~$0.01 per minute in cents
        llm_cost = call_data.get('llm_cost', duration_minutes * 2)  # Variable LLM cost
        tts_cost = duration_minutes * 1   # ~$0.01 per minute in cents
        telephony_cost = call_data.get('telephony_cost', duration_minutes * 1)
        total_cost = vapi_cost + stt_cost + llm_cost + tts_cost + telephony_cost
        
        # Create usage log
        usage_log = {
            "customerNumber": customer_number,
            "callId": call_data.get('call_id'),
            "sessionId": call_data.get('session_id'),
            "usage": {
                "startTime": datetime.fromisoformat(call_data.get('start_time')),
                "endTime": datetime.fromisoformat(call_data.get('end_time')),
                "duration": duration_seconds,
                "durationMinutes": duration_minutes,
                "callType": call_data.get('call_type', 'inbound'),
                "phoneNumber": call_data.get('phone_number'),
                "customerPhone": call_data.get('customer_phone')
            },
            "costs": {
                "vapiCost": vapi_cost,
                "sttCost": stt_cost,
                "llmCost": llm_cost,
                "ttsCost": tts_cost,
                "telephonyCost": telephony_cost,
                "totalCost": total_cost
            },
            "quality": {
                "audioQuality": call_data.get('audio_quality', 1.0),
                "responseTime": call_data.get('response_time', 1000),
                "completionRate": call_data.get('completion_rate', 1.0),
                "userSatisfaction": call_data.get('user_satisfaction'),
                "errorCount": call_data.get('error_count', 0)
            },
            "metadata": {
                "assistantId": call_data.get('assistant_id'),
                "assistantName": call_data.get('assistant_name'),
                "transcript": call_data.get('transcript', ''),
                "summary": call_data.get('summary', ''),
                "intent": call_data.get('intent'),
                "resolution": call_data.get('resolution', 'completed'),
                "tags": call_data.get('tags', [])
            },
            "billing": {
                "planId": customer['subscription']['planId'],
                "billingPeriod": datetime.utcnow().strftime("%Y-%m"),
                "charged": False,
                "chargeAmount": 0,
                "isOverage": False
            },
            "createdAt": datetime.utcnow()
        }
        
        # Insert usage log
        self.db.usage_logs.insert_one(usage_log)
        
        # Update customer usage
        self.update_customer_usage(customer_number, duration_minutes)
        
        return usage_log
    
    def update_customer_usage(self, customer_number, minutes_used):
        """Update customer usage counters"""
        
        customer = self.db.customers.find_one({"customerNumber": customer_number})
        if not customer:
            return
        
        # Calculate new usage
        new_minutes_used = customer['subscription']['minutesUsed'] + minutes_used
        minutes_remaining = max(0, customer['subscription']['minutesIncluded'] - new_minutes_used)
        
        # Update customer record
        self.db.customers.update_one(
            {"customerNumber": customer_number},
            {
                "$set": {
                    "subscription.minutesUsed": new_minutes_used,
                    "subscription.minutesRemaining": minutes_remaining,
                    "usage.totalMinutesUsed": customer['usage']['totalMinutesUsed'] + minutes_used,
                    "usage.currentMonthMinutes": customer['usage']['currentMonthMinutes'] + minutes_used,
                    "usage.lastCallDate": datetime.utcnow(),
                    "usage.totalCalls": customer['usage']['totalCalls'] + 1,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        # Check for overage and create invoice item if needed
        if new_minutes_used > customer['subscription']['minutesIncluded']:
            self.handle_overage(customer_number, minutes_used)
    
    def handle_overage(self, customer_number, overage_minutes):
        """Handle overage billing"""
        
        customer = self.db.customers.find_one({"customerNumber": customer_number})
        plan = self.db.pricing_plans.find_one({"planId": customer['subscription']['planId']})
        
        if not customer or not plan:
            return
        
        # Calculate overage amount
        overage_rate = plan['features']['overageRate']  # in cents per minute
        overage_amount = overage_minutes * overage_rate
        
        # Create Stripe invoice item for overage
        stripe.InvoiceItem.create(
            customer=customer['stripeCustomerId'],
            amount=overage_amount,
            currency='usd',
            description=f"Overage usage: {overage_minutes} minutes at ${overage_rate/100:.2f} per minute",
            metadata={
                "customer_number": customer_number,
                "overage_minutes": str(overage_minutes),
                "billing_period": datetime.utcnow().strftime("%Y-%m")
            }
        )
        
        # Update usage logs to mark as overage
        self.db.usage_logs.update_many(
            {
                "customerNumber": customer_number,
                "billing.charged": False,
                "billing.isOverage": False
            },
            {
                "$set": {
                    "billing.isOverage": True,
                    "billing.chargeAmount": overage_rate
                }
            }
        )
```

### Webhook Event Handling

Stripe webhooks provide real-time notifications of payment events, enabling automated customer lifecycle management and billing operations.

```python
from flask import Flask, request, jsonify
import stripe
import hmac
import hashlib

class StripeWebhookHandler:
    def __init__(self, mongo_uri, stripe_api_key, webhook_secret):
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client.vapi_service
        stripe.api_key = stripe_api_key
        self.webhook_secret = webhook_secret
    
    def verify_webhook_signature(self, payload, signature):
        """Verify Stripe webhook signature"""
        try:
            stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            return True
        except ValueError:
            return False
        except stripe.error.SignatureVerificationError:
            return False
    
    def handle_webhook(self, payload, signature):
        """Handle Stripe webhook events"""
        
        if not self.verify_webhook_signature(payload, signature):
            return {"error": "Invalid signature"}, 400
        
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
        except Exception as e:
            return {"error": str(e)}, 400
        
        # Handle different event types
        if event['type'] == 'customer.subscription.created':
            self.handle_subscription_created(event['data']['object'])
        elif event['type'] == 'customer.subscription.updated':
            self.handle_subscription_updated(event['data']['object'])
        elif event['type'] == 'customer.subscription.deleted':
            self.handle_subscription_deleted(event['data']['object'])
        elif event['type'] == 'invoice.payment_succeeded':
            self.handle_payment_succeeded(event['data']['object'])
        elif event['type'] == 'invoice.payment_failed':
            self.handle_payment_failed(event['data']['object'])
        elif event['type'] == 'customer.subscription.trial_will_end':
            self.handle_trial_ending(event['data']['object'])
        
        return {"received": True}, 200
    
    def handle_subscription_created(self, subscription):
        """Handle new subscription creation"""
        customer_number = subscription['metadata'].get('customer_number')
        if not customer_number:
            return
        
        self.db.customers.update_one(
            {"customerNumber": customer_number},
            {
                "$set": {
                    "subscription.stripeSubscriptionId": subscription['id'],
                    "subscription.status": subscription['status'],
                    "subscription.currentPeriodStart": datetime.fromtimestamp(subscription['current_period_start']),
                    "subscription.currentPeriodEnd": datetime.fromtimestamp(subscription['current_period_end']),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
    
    def handle_payment_succeeded(self, invoice):
        """Handle successful payment"""
        customer_id = invoice['customer']
        
        # Find customer by Stripe ID
        customer = self.db.customers.find_one({"stripeCustomerId": customer_id})
        if not customer:
            return
        
        # Create payment record
        payment_record = {
            "paymentId": f"PAY-{datetime.utcnow().strftime('%Y%m%d')}-{invoice['id'][-8:]}",
            "customerNumber": customer['customerNumber'],
            "stripePaymentIntentId": invoice.get('payment_intent'),
            "stripeInvoiceId": invoice['id'],
            "billing": {
                "amount": invoice['amount_paid'],
                "currency": invoice['currency'],
                "description": invoice.get('description', 'Monthly subscription'),
                "billingPeriod": {
                    "start": datetime.fromtimestamp(invoice['period_start']),
                    "end": datetime.fromtimestamp(invoice['period_end']),
                    "label": datetime.fromtimestamp(invoice['period_start']).strftime("%B %Y")
                },
                "planId": customer['subscription']['planId'],
                "planName": customer['subscription']['planId'].title()
            },
            "payment": {
                "status": "succeeded",
                "method": "card",
                "paidAt": datetime.fromtimestamp(invoice['status_transitions']['paid_at']),
                "failedAt": None,
                "failureReason": None
            },
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        self.db.payments.insert_one(payment_record)
        
        # Reset usage for new billing period
        plan = self.db.pricing_plans.find_one({"planId": customer['subscription']['planId']})
        if plan:
            self.db.customers.update_one(
                {"customerNumber": customer['customerNumber']},
                {
                    "$set": {
                        "subscription.minutesUsed": 0,
                        "subscription.minutesRemaining": plan['features']['minutesIncluded'],
                        "usage.currentMonthMinutes": 0,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
    
    def handle_payment_failed(self, invoice):
        """Handle failed payment"""
        customer_id = invoice['customer']
        
        customer = self.db.customers.find_one({"stripeCustomerId": customer_id})
        if not customer:
            return
        
        # Update customer status
        self.db.customers.update_one(
            {"customerNumber": customer['customerNumber']},
            {
                "$set": {
                    "subscription.status": "past_due",
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        # Create failed payment record
        payment_record = {
            "paymentId": f"PAY-{datetime.utcnow().strftime('%Y%m%d')}-{invoice['id'][-8:]}",
            "customerNumber": customer['customerNumber'],
            "stripeInvoiceId": invoice['id'],
            "billing": {
                "amount": invoice['amount_due'],
                "currency": invoice['currency'],
                "description": invoice.get('description', 'Monthly subscription')
            },
            "payment": {
                "status": "failed",
                "failedAt": datetime.utcnow(),
                "failureReason": "Payment method declined"
            },
            "createdAt": datetime.utcnow()
        }
        
        self.db.payments.insert_one(payment_record)
```


## Customer Management System

### Demo Request Management

The demo request system captures leads from your landing page and automatically generates customer numbers for tracking and conversion. The system integrates with your existing lead capture forms and provides comprehensive lead qualification and follow-up capabilities.

```python
import uuid
from datetime import datetime, timedelta
import re
from typing import Dict, List, Optional

class DemoManager:
    def __init__(self, mongo_uri):
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client.vapi_service
    
    def generate_demo_number(self):
        """Generate unique demo number in format DEMO-YYYYMMDD-XXXX"""
        today = datetime.now().strftime("%Y%m%d")
        random_suffix = str(uuid.uuid4().int)[:4]
        return f"DEMO-{today}-{random_suffix}"
    
    def calculate_lead_score(self, lead_data: Dict) -> int:
        """Calculate lead score based on qualification criteria"""
        score = 0
        
        # Company size scoring
        company_size = lead_data.get('companySize', '')
        if company_size == '1000+':
            score += 30
        elif company_size == '201-1000':
            score += 25
        elif company_size == '51-200':
            score += 20
        elif company_size == '11-50':
            score += 15
        elif company_size == '1-10':
            score += 10
        
        # Budget scoring
        budget = lead_data.get('budget', '')
        if budget == '$5000+':
            score += 25
        elif budget == '$2000-5000':
            score += 20
        elif budget == '$500-2000':
            score += 15
        elif budget == '< $500':
            score += 5
        
        # Timeline scoring
        timeline = lead_data.get('timeline', '')
        if timeline == 'immediate':
            score += 20
        elif timeline == '1-3 months':
            score += 15
        elif timeline == '3-6 months':
            score += 10
        elif timeline == '6+ months':
            score += 5
        
        # Authority scoring
        authority = lead_data.get('authority', '')
        if authority == 'decision maker':
            score += 15
        elif authority == 'influencer':
            score += 10
        elif authority == 'researcher':
            score += 5
        
        # Expected volume scoring
        volume = lead_data.get('expectedVolume', '')
        if volume == 'enterprise':
            score += 10
        elif volume == '5000+':
            score += 8
        elif volume == '1000-5000':
            score += 6
        elif volume == '< 1000':
            score += 3
        
        return min(score, 100)  # Cap at 100
    
    def create_demo_request(self, form_data: Dict, tracking_data: Dict = None) -> Dict:
        """Create new demo request from landing page form"""
        
        # Generate unique demo number
        demo_number = self.generate_demo_number()
        
        # Ensure demo number is unique
        while self.db.demo_requests.find_one({"demoNumber": demo_number}):
            demo_number = self.generate_demo_number()
        
        # Validate email format
        email = form_data.get('email', '').lower().strip()
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError("Invalid email format")
        
        # Check for duplicate email in recent requests (last 30 days)
        recent_cutoff = datetime.utcnow() - timedelta(days=30)
        existing_demo = self.db.demo_requests.find_one({
            "leadInfo.email": email,
            "createdAt": {"$gte": recent_cutoff}
        })
        
        if existing_demo:
            return {
                "status": "duplicate",
                "demo_number": existing_demo['demoNumber'],
                "message": "Demo request already exists for this email"
            }
        
        # Calculate lead score
        lead_score = self.calculate_lead_score(form_data)
        
        # Create demo request document
        demo_request = {
            "demoNumber": demo_number,
            "leadInfo": {
                "email": email,
                "firstName": form_data.get('firstName', '').strip(),
                "lastName": form_data.get('lastName', '').strip(),
                "company": form_data.get('company', '').strip(),
                "jobTitle": form_data.get('jobTitle', '').strip(),
                "phone": form_data.get('phone', '').strip(),
                "website": form_data.get('website', '').strip(),
                "companySize": form_data.get('companySize', ''),
                "industry": form_data.get('industry', ''),
                "useCase": form_data.get('useCase', ''),
                "expectedVolume": form_data.get('expectedVolume', '')
            },
            "demoDetails": {
                "requestedDate": datetime.fromisoformat(form_data.get('requestedDate')) if form_data.get('requestedDate') else None,
                "preferredTime": form_data.get('preferredTime', ''),
                "timezone": form_data.get('timezone', 'UTC'),
                "demoType": form_data.get('demoType', 'live'),
                "duration": int(form_data.get('duration', 30)),
                "specialRequests": form_data.get('specialRequests', ''),
                "technicalRequirements": form_data.get('technicalRequirements', '')
            },
            "qualification": {
                "budget": form_data.get('budget', ''),
                "timeline": form_data.get('timeline', ''),
                "authority": form_data.get('authority', ''),
                "currentSolution": form_data.get('currentSolution', ''),
                "painPoints": form_data.get('painPoints', []),
                "leadScore": lead_score
            },
            "status": {
                "current": "requested",
                "scheduledDate": None,
                "completedDate": None,
                "followUpDate": datetime.utcnow() + timedelta(hours=24),  # Follow up in 24 hours
                "assignedTo": self.assign_sales_rep(lead_score),
                "notes": [],
                "conversionProbability": self.calculate_conversion_probability(lead_score)
            },
            "tracking": {
                "source": tracking_data.get('source', 'website') if tracking_data else 'website',
                "utmSource": tracking_data.get('utm_source') if tracking_data else None,
                "utmMedium": tracking_data.get('utm_medium') if tracking_data else None,
                "utmCampaign": tracking_data.get('utm_campaign') if tracking_data else None,
                "referralCode": tracking_data.get('referral_code') if tracking_data else None,
                "landingPage": tracking_data.get('landing_page') if tracking_data else None,
                "ipAddress": tracking_data.get('ip_address') if tracking_data else None,
                "userAgent": tracking_data.get('user_agent') if tracking_data else None
            },
            "trial": {
                "isTrialRequested": form_data.get('requestTrial', False),
                "trialDuration": 14,  # Default 14-day trial
                "trialStartDate": None,
                "trialEndDate": None,
                "trialUsage": {
                    "minutesUsed": 0,
                    "callsCompleted": 0,
                    "lastActivity": None
                },
                "trialCustomerNumber": None
            },
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "convertedAt": None,
            "convertedToCustomerNumber": None
        }
        
        # Insert demo request
        result = self.db.demo_requests.insert_one(demo_request)
        
        # Send notifications based on lead score
        self.send_demo_notifications(demo_request)
        
        return {
            "status": "created",
            "demo_number": demo_number,
            "lead_score": lead_score,
            "assigned_to": demo_request['status']['assignedTo'],
            "follow_up_date": demo_request['status']['followUpDate'].isoformat()
        }
    
    def assign_sales_rep(self, lead_score: int) -> str:
        """Assign sales representative based on lead score"""
        if lead_score >= 80:
            return "senior_sales"  # High-value leads to senior reps
        elif lead_score >= 60:
            return "mid_sales"     # Medium-value leads to mid-level reps
        else:
            return "junior_sales"  # Lower-value leads to junior reps
    
    def calculate_conversion_probability(self, lead_score: int) -> int:
        """Calculate conversion probability based on lead score"""
        if lead_score >= 80:
            return 75
        elif lead_score >= 60:
            return 50
        elif lead_score >= 40:
            return 30
        else:
            return 15
    
    def send_demo_notifications(self, demo_request: Dict):
        """Send notifications for new demo requests"""
        # This would integrate with your notification system
        # (email, Slack, CRM, etc.)
        
        lead_score = demo_request['qualification']['leadScore']
        demo_number = demo_request['demoNumber']
        
        if lead_score >= 80:
            # High-priority notification for high-value leads
            self.send_urgent_notification(demo_request)
        elif lead_score >= 60:
            # Standard notification for medium-value leads
            self.send_standard_notification(demo_request)
        else:
            # Low-priority notification for lower-value leads
            self.send_low_priority_notification(demo_request)
    
    def convert_demo_to_trial(self, demo_number: str, trial_plan: str = "starter") -> Dict:
        """Convert demo request to trial customer"""
        
        # Get demo request
        demo = self.db.demo_requests.find_one({"demoNumber": demo_number})
        if not demo:
            raise ValueError(f"Demo request {demo_number} not found")
        
        if demo['status']['current'] == 'converted':
            return {
                "status": "already_converted",
                "customer_number": demo['convertedToCustomerNumber']
            }
        
        # Create trial customer
        customer_manager = CustomerManager(self.mongo_client.address, None)
        
        profile_data = {
            "firstName": demo['leadInfo']['firstName'],
            "lastName": demo['leadInfo']['lastName'],
            "company": demo['leadInfo']['company'],
            "phone": demo['leadInfo']['phone'],
            "source": "demo_conversion",
            "trial": True
        }
        
        customer_result = customer_manager.create_customer(
            email=demo['leadInfo']['email'],
            profile_data=profile_data,
            plan_id=trial_plan
        )
        
        # Update demo request
        self.db.demo_requests.update_one(
            {"demoNumber": demo_number},
            {
                "$set": {
                    "status.current": "converted",
                    "convertedAt": datetime.utcnow(),
                    "convertedToCustomerNumber": customer_result['customer_number'],
                    "trial.trialCustomerNumber": customer_result['customer_number'],
                    "trial.trialStartDate": datetime.utcnow(),
                    "trial.trialEndDate": datetime.utcnow() + timedelta(days=14),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return {
            "status": "converted",
            "customer_number": customer_result['customer_number'],
            "trial_end_date": (datetime.utcnow() + timedelta(days=14)).isoformat()
        }
```

### Customer Number Generation System

The customer number generation system ensures unique identification for all customers and demo requests while maintaining a consistent format that supports easy identification and sorting.

```python
class CustomerNumberGenerator:
    def __init__(self, mongo_uri):
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client.vapi_service
    
    def generate_customer_number(self, prefix: str = "CUST") -> str:
        """Generate unique customer number with specified prefix"""
        today = datetime.now().strftime("%Y%m%d")
        
        # Get the next sequence number for today
        sequence = self.get_next_sequence(prefix, today)
        
        # Format: PREFIX-YYYYMMDD-XXXX
        return f"{prefix}-{today}-{sequence:04d}"
    
    def get_next_sequence(self, prefix: str, date_str: str) -> int:
        """Get next sequence number for the given prefix and date"""
        
        # Use MongoDB's findAndModify for atomic increment
        result = self.db.sequences.find_one_and_update(
            {"_id": f"{prefix}-{date_str}"},
            {"$inc": {"sequence": 1}},
            upsert=True,
            return_document=True
        )
        
        return result['sequence']
    
    def validate_customer_number(self, customer_number: str) -> bool:
        """Validate customer number format"""
        pattern = r'^(CUST|DEMO|TRIAL)-\d{8}-\d{4}$'
        return bool(re.match(pattern, customer_number))
    
    def parse_customer_number(self, customer_number: str) -> Dict:
        """Parse customer number into components"""
        if not self.validate_customer_number(customer_number):
            raise ValueError("Invalid customer number format")
        
        parts = customer_number.split('-')
        return {
            "prefix": parts[0],
            "date": parts[1],
            "sequence": int(parts[2]),
            "year": int(parts[1][:4]),
            "month": int(parts[1][4:6]),
            "day": int(parts[1][6:8])
        }
```

### Lead Qualification and Scoring

The lead qualification system automatically scores leads based on multiple criteria and routes them to appropriate sales representatives for optimal conversion rates.

```python
class LeadQualificationEngine:
    def __init__(self, mongo_uri):
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client.vapi_service
        
        # Scoring weights for different criteria
        self.scoring_weights = {
            "company_size": 0.3,
            "budget": 0.25,
            "timeline": 0.2,
            "authority": 0.15,
            "volume": 0.1
        }
    
    def qualify_lead(self, lead_data: Dict) -> Dict:
        """Comprehensive lead qualification"""
        
        # Calculate individual scores
        company_score = self.score_company_size(lead_data.get('companySize', ''))
        budget_score = self.score_budget(lead_data.get('budget', ''))
        timeline_score = self.score_timeline(lead_data.get('timeline', ''))
        authority_score = self.score_authority(lead_data.get('authority', ''))
        volume_score = self.score_volume(lead_data.get('expectedVolume', ''))
        
        # Calculate weighted total score
        total_score = (
            company_score * self.scoring_weights["company_size"] +
            budget_score * self.scoring_weights["budget"] +
            timeline_score * self.scoring_weights["timeline"] +
            authority_score * self.scoring_weights["authority"] +
            volume_score * self.scoring_weights["volume"]
        )
        
        # Determine lead grade
        if total_score >= 80:
            grade = "A"
            priority = "high"
        elif total_score >= 60:
            grade = "B"
            priority = "medium"
        elif total_score >= 40:
            grade = "C"
            priority = "low"
        else:
            grade = "D"
            priority = "very_low"
        
        # Determine recommended actions
        actions = self.get_recommended_actions(total_score, lead_data)
        
        return {
            "total_score": round(total_score, 2),
            "grade": grade,
            "priority": priority,
            "component_scores": {
                "company_size": company_score,
                "budget": budget_score,
                "timeline": timeline_score,
                "authority": authority_score,
                "volume": volume_score
            },
            "recommended_actions": actions,
            "estimated_value": self.estimate_customer_value(lead_data),
            "conversion_probability": self.calculate_conversion_probability(total_score)
        }
    
    def score_company_size(self, company_size: str) -> int:
        """Score based on company size"""
        size_scores = {
            "1000+": 100,
            "201-1000": 85,
            "51-200": 70,
            "11-50": 55,
            "1-10": 40,
            "": 0
        }
        return size_scores.get(company_size, 0)
    
    def score_budget(self, budget: str) -> int:
        """Score based on budget range"""
        budget_scores = {
            "$5000+": 100,
            "$2000-5000": 80,
            "$500-2000": 60,
            "< $500": 30,
            "": 0
        }
        return budget_scores.get(budget, 0)
    
    def score_timeline(self, timeline: str) -> int:
        """Score based on implementation timeline"""
        timeline_scores = {
            "immediate": 100,
            "1-3 months": 80,
            "3-6 months": 60,
            "6+ months": 30,
            "": 0
        }
        return timeline_scores.get(timeline, 0)
    
    def score_authority(self, authority: str) -> int:
        """Score based on decision-making authority"""
        authority_scores = {
            "decision maker": 100,
            "influencer": 70,
            "researcher": 40,
            "": 0
        }
        return authority_scores.get(authority, 0)
    
    def score_volume(self, volume: str) -> int:
        """Score based on expected usage volume"""
        volume_scores = {
            "enterprise": 100,
            "5000+": 85,
            "1000-5000": 70,
            "< 1000": 50,
            "": 0
        }
        return volume_scores.get(volume, 0)
    
    def estimate_customer_value(self, lead_data: Dict) -> Dict:
        """Estimate potential customer lifetime value"""
        
        # Base monthly value estimates by company size
        size_values = {
            "1000+": 1999,      # Enterprise Plus
            "201-1000": 999,    # Enterprise
            "51-200": 499,      # Business
            "11-50": 249,       # Professional
            "1-10": 99          # Starter
        }
        
        monthly_value = size_values.get(lead_data.get('companySize', ''), 99)
        
        # Adjust based on expected volume
        volume_multipliers = {
            "enterprise": 2.0,
            "5000+": 1.5,
            "1000-5000": 1.2,
            "< 1000": 1.0
        }
        
        volume_multiplier = volume_multipliers.get(lead_data.get('expectedVolume', ''), 1.0)
        adjusted_monthly = monthly_value * volume_multiplier
        
        # Calculate lifetime value (assuming 24-month average retention)
        lifetime_value = adjusted_monthly * 24
        
        return {
            "monthly_value": round(adjusted_monthly, 2),
            "annual_value": round(adjusted_monthly * 12, 2),
            "lifetime_value": round(lifetime_value, 2)
        }
    
    def get_recommended_actions(self, score: float, lead_data: Dict) -> List[str]:
        """Get recommended actions based on lead score"""
        actions = []
        
        if score >= 80:
            actions.extend([
                "Schedule demo within 24 hours",
                "Assign to senior sales representative",
                "Prepare custom proposal",
                "Offer enterprise trial"
            ])
        elif score >= 60:
            actions.extend([
                "Schedule demo within 48 hours",
                "Assign to experienced sales representative",
                "Provide detailed product information",
                "Offer standard trial"
            ])
        elif score >= 40:
            actions.extend([
                "Schedule demo within 1 week",
                "Assign to junior sales representative",
                "Send educational content",
                "Offer self-service trial"
            ])
        else:
            actions.extend([
                "Add to nurture campaign",
                "Send educational content series",
                "Follow up in 30 days",
                "Qualify further before demo"
            ])
        
        # Add specific actions based on pain points
        pain_points = lead_data.get('painPoints', [])
        if 'cost_reduction' in pain_points:
            actions.append("Prepare ROI calculator")
        if 'scalability' in pain_points:
            actions.append("Demonstrate enterprise features")
        if 'integration' in pain_points:
            actions.append("Prepare integration documentation")
        
        return actions
```

### Customer Lifecycle Management

The customer lifecycle management system tracks customers through all stages from demo request to active subscription, providing comprehensive analytics and automated workflows.

```python
class CustomerLifecycleManager:
    def __init__(self, mongo_uri):
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client.vapi_service
    
    def get_customer_journey(self, customer_number: str) -> Dict:
        """Get complete customer journey from demo to current status"""
        
        # Find customer record
        customer = self.db.customers.find_one({"customerNumber": customer_number})
        if not customer:
            raise ValueError(f"Customer {customer_number} not found")
        
        # Find original demo request
        demo_request = self.db.demo_requests.find_one({
            "convertedToCustomerNumber": customer_number
        })
        
        # Get usage history
        usage_logs = list(self.db.usage_logs.find({
            "customerNumber": customer_number
        }).sort("createdAt", 1))
        
        # Get payment history
        payments = list(self.db.payments.find({
            "customerNumber": customer_number
        }).sort("createdAt", 1))
        
        # Calculate journey metrics
        journey_metrics = self.calculate_journey_metrics(
            customer, demo_request, usage_logs, payments
        )
        
        return {
            "customer": customer,
            "demo_request": demo_request,
            "usage_summary": {
                "total_calls": len(usage_logs),
                "total_minutes": sum(log['usage']['durationMinutes'] for log in usage_logs),
                "average_call_duration": journey_metrics['avg_call_duration'],
                "last_activity": usage_logs[-1]['createdAt'] if usage_logs else None
            },
            "payment_summary": {
                "total_payments": len(payments),
                "total_revenue": sum(payment['billing']['amount'] for payment in payments),
                "last_payment": payments[-1]['createdAt'] if payments else None
            },
            "journey_metrics": journey_metrics
        }
    
    def calculate_journey_metrics(self, customer: Dict, demo_request: Dict, 
                                usage_logs: List, payments: List) -> Dict:
        """Calculate key journey metrics"""
        
        metrics = {}
        
        # Time to conversion (demo to customer)
        if demo_request and customer:
            demo_date = demo_request['createdAt']
            customer_date = customer['createdAt']
            metrics['time_to_conversion_days'] = (customer_date - demo_date).days
        
        # Time to first usage
        if usage_logs and customer:
            first_usage = usage_logs[0]['createdAt']
            customer_date = customer['createdAt']
            metrics['time_to_first_usage_days'] = (first_usage - customer_date).days
        
        # Usage patterns
        if usage_logs:
            total_minutes = sum(log['usage']['durationMinutes'] for log in usage_logs)
            metrics['avg_call_duration'] = total_minutes / len(usage_logs)
            
            # Monthly usage trend
            monthly_usage = {}
            for log in usage_logs:
                month_key = log['createdAt'].strftime('%Y-%m')
                if month_key not in monthly_usage:
                    monthly_usage[month_key] = 0
                monthly_usage[month_key] += log['usage']['durationMinutes']
            
            metrics['monthly_usage_trend'] = monthly_usage
        
        # Revenue metrics
        if payments:
            total_revenue = sum(payment['billing']['amount'] for payment in payments)
            metrics['total_revenue'] = total_revenue / 100  # Convert from cents
            metrics['average_monthly_revenue'] = (total_revenue / len(payments)) / 100
        
        # Customer health score
        metrics['health_score'] = self.calculate_health_score(customer, usage_logs, payments)
        
        return metrics
    
    def calculate_health_score(self, customer: Dict, usage_logs: List, payments: List) -> int:
        """Calculate customer health score (0-100)"""
        score = 0
        
        # Usage activity (40 points)
        if usage_logs:
            last_usage = usage_logs[-1]['createdAt']
            days_since_usage = (datetime.utcnow() - last_usage).days
            
            if days_since_usage <= 7:
                score += 40
            elif days_since_usage <= 30:
                score += 30
            elif days_since_usage <= 90:
                score += 20
            else:
                score += 5
        
        # Payment status (30 points)
        subscription_status = customer['subscription']['status']
        if subscription_status == 'active':
            score += 30
        elif subscription_status == 'trialing':
            score += 25
        elif subscription_status == 'past_due':
            score += 10
        
        # Usage vs. plan (20 points)
        minutes_used = customer['subscription']['minutesUsed']
        minutes_included = customer['subscription']['minutesIncluded']
        
        if minutes_included > 0:
            usage_ratio = minutes_used / minutes_included
            if 0.3 <= usage_ratio <= 0.8:  # Optimal usage range
                score += 20
            elif 0.1 <= usage_ratio < 0.3:  # Low usage
                score += 15
            elif usage_ratio > 0.8:  # High usage
                score += 18
        
        # Growth trend (10 points)
        if len(usage_logs) >= 2:
            recent_usage = sum(
                log['usage']['durationMinutes'] 
                for log in usage_logs[-5:]  # Last 5 calls
            )
            older_usage = sum(
                log['usage']['durationMinutes'] 
                for log in usage_logs[-10:-5]  # Previous 5 calls
            )
            
            if recent_usage > older_usage:
                score += 10
            elif recent_usage == older_usage:
                score += 5
        
        return min(score, 100)
```


## Complete Implementation Guide

### Flask Application Architecture

The Flask application provides a comprehensive REST API for managing the Vapi service, including customer management, demo requests, subscription handling, and usage tracking. The architecture follows best practices for scalability, security, and maintainability.

The application structure separates concerns into distinct modules: models for data representation, routes for API endpoints, services for business logic, and utilities for common functionality. This modular approach enables easy testing, maintenance, and feature expansion.

### Environment Configuration

The application requires several environment variables for proper configuration. Create a `.env` file in your project root with the following variables:

```bash
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vapi_service
MONGODB_DB_NAME=vapi_service

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Vapi Configuration
VAPI_PRIVATE_KEY=your_vapi_private_key
VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_WEBHOOK_SECRET=your_vapi_webhook_secret

# Email Configuration (for notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Application Configuration
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Database Models Implementation

The database models provide object-relational mapping for MongoDB collections, enabling type-safe database operations and data validation.

```python
# src/models/customer.py
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pymongo import MongoClient
import os

class Customer:
    def __init__(self, mongo_uri: str = None):
        self.mongo_uri = mongo_uri or os.getenv('MONGODB_URI')
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client[os.getenv('MONGODB_DB_NAME', 'vapi_service')]
        self.collection = self.db.customers
    
    def create(self, customer_data: Dict) -> Dict:
        """Create new customer record"""
        customer_data['createdAt'] = datetime.utcnow()
        customer_data['updatedAt'] = datetime.utcnow()
        
        result = self.collection.insert_one(customer_data)
        customer_data['_id'] = str(result.inserted_id)
        return customer_data
    
    def find_by_customer_number(self, customer_number: str) -> Optional[Dict]:
        """Find customer by customer number"""
        return self.collection.find_one({"customerNumber": customer_number})
    
    def find_by_email(self, email: str) -> Optional[Dict]:
        """Find customer by email"""
        return self.collection.find_one({"email": email})
    
    def update_usage(self, customer_number: str, minutes_used: int) -> bool:
        """Update customer usage"""
        result = self.collection.update_one(
            {"customerNumber": customer_number},
            {
                "$inc": {
                    "subscription.minutesUsed": minutes_used,
                    "usage.totalMinutesUsed": minutes_used,
                    "usage.currentMonthMinutes": minutes_used,
                    "usage.totalCalls": 1
                },
                "$set": {
                    "usage.lastCallDate": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    def get_active_customers(self) -> List[Dict]:
        """Get all active customers"""
        return list(self.collection.find({
            "isActive": True,
            "subscription.status": {"$in": ["active", "trialing"]}
        }))

# src/models/demo_request.py
class DemoRequest:
    def __init__(self, mongo_uri: str = None):
        self.mongo_uri = mongo_uri or os.getenv('MONGODB_URI')
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client[os.getenv('MONGODB_DB_NAME', 'vapi_service')]
        self.collection = self.db.demo_requests
    
    def create(self, demo_data: Dict) -> Dict:
        """Create new demo request"""
        demo_data['createdAt'] = datetime.utcnow()
        demo_data['updatedAt'] = datetime.utcnow()
        
        result = self.collection.insert_one(demo_data)
        demo_data['_id'] = str(result.inserted_id)
        return demo_data
    
    def find_by_demo_number(self, demo_number: str) -> Optional[Dict]:
        """Find demo request by demo number"""
        return self.collection.find_one({"demoNumber": demo_number})
    
    def find_by_email(self, email: str, days_back: int = 30) -> Optional[Dict]:
        """Find recent demo request by email"""
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        return self.collection.find_one({
            "leadInfo.email": email,
            "createdAt": {"$gte": cutoff_date}
        })
    
    def update_status(self, demo_number: str, status: str, notes: str = None) -> bool:
        """Update demo request status"""
        update_data = {
            "status.current": status,
            "updatedAt": datetime.utcnow()
        }
        
        if notes:
            update_data["$push"] = {"status.notes": {
                "note": notes,
                "timestamp": datetime.utcnow()
            }}
        
        result = self.collection.update_one(
            {"demoNumber": demo_number},
            {"$set": update_data}
        )
        return result.modified_count > 0

# src/models/usage_log.py
class UsageLog:
    def __init__(self, mongo_uri: str = None):
        self.mongo_uri = mongo_uri or os.getenv('MONGODB_URI')
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client[os.getenv('MONGODB_DB_NAME', 'vapi_service')]
        self.collection = self.db.usage_logs
    
    def create(self, usage_data: Dict) -> Dict:
        """Create new usage log"""
        usage_data['createdAt'] = datetime.utcnow()
        
        result = self.collection.insert_one(usage_data)
        usage_data['_id'] = str(result.inserted_id)
        return usage_data
    
    def get_customer_usage(self, customer_number: str, 
                          start_date: datetime = None, 
                          end_date: datetime = None) -> List[Dict]:
        """Get usage logs for customer within date range"""
        query = {"customerNumber": customer_number}
        
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            query["createdAt"] = date_filter
        
        return list(self.collection.find(query).sort("createdAt", -1))
    
    def get_monthly_usage(self, customer_number: str, year: int, month: int) -> Dict:
        """Get monthly usage summary for customer"""
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        pipeline = [
            {
                "$match": {
                    "customerNumber": customer_number,
                    "createdAt": {"$gte": start_date, "$lt": end_date}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "totalMinutes": {"$sum": "$usage.durationMinutes"},
                    "totalCalls": {"$sum": 1},
                    "totalCost": {"$sum": "$costs.totalCost"},
                    "avgCallDuration": {"$avg": "$usage.durationMinutes"}
                }
            }
        ]
        
        result = list(self.collection.aggregate(pipeline))
        return result[0] if result else {
            "totalMinutes": 0,
            "totalCalls": 0,
            "totalCost": 0,
            "avgCallDuration": 0
        }
```

### API Routes Implementation

The API routes provide RESTful endpoints for all system functionality, including proper error handling, input validation, and response formatting.

```python
# src/routes/customers.py
from flask import Blueprint, request, jsonify
from src.models.customer import Customer
from src.services.customer_service import CustomerService
from src.services.stripe_service import StripeService
from src.utils.validators import validate_email, validate_phone
from src.utils.auth import require_api_key
import logging

customer_bp = Blueprint('customers', __name__, url_prefix='/api/customers')
logger = logging.getLogger(__name__)

@customer_bp.route('/', methods=['POST'])
def create_customer():
    """Create new customer"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'firstName', 'lastName', 'planId']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({"error": "Invalid email format"}), 400
        
        # Check for existing customer
        customer_service = CustomerService()
        existing_customer = customer_service.find_by_email(data['email'])
        if existing_customer:
            return jsonify({"error": "Customer already exists"}), 409
        
        # Create customer
        result = customer_service.create_customer(
            email=data['email'],
            profile_data={
                'firstName': data['firstName'],
                'lastName': data['lastName'],
                'company': data.get('company', ''),
                'phone': data.get('phone', ''),
                'timezone': data.get('timezone', 'UTC'),
                'source': data.get('source', 'api')
            },
            plan_id=data['planId'],
            payment_method_id=data.get('paymentMethodId')
        )
        
        return jsonify({
            "success": True,
            "customer": result
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating customer: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@customer_bp.route('/<customer_number>', methods=['GET'])
@require_api_key
def get_customer(customer_number):
    """Get customer by customer number"""
    try:
        customer_service = CustomerService()
        customer = customer_service.find_by_customer_number(customer_number)
        
        if not customer:
            return jsonify({"error": "Customer not found"}), 404
        
        # Remove sensitive information
        customer.pop('stripeCustomerId', None)
        customer.pop('vapiConfig', None)
        
        return jsonify({
            "success": True,
            "customer": customer
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting customer: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@customer_bp.route('/<customer_number>/usage', methods=['GET'])
@require_api_key
def get_customer_usage(customer_number):
    """Get customer usage statistics"""
    try:
        customer_service = CustomerService()
        usage_stats = customer_service.get_usage_statistics(customer_number)
        
        return jsonify({
            "success": True,
            "usage": usage_stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting customer usage: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@customer_bp.route('/<customer_number>/subscription', methods=['PUT'])
@require_api_key
def update_subscription(customer_number):
    """Update customer subscription"""
    try:
        data = request.get_json()
        
        if not data.get('planId'):
            return jsonify({"error": "Missing planId"}), 400
        
        customer_service = CustomerService()
        result = customer_service.update_subscription(
            customer_number=customer_number,
            new_plan_id=data['planId']
        )
        
        return jsonify({
            "success": True,
            "subscription": result
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating subscription: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# src/routes/demos.py
from flask import Blueprint, request, jsonify
from src.services.demo_service import DemoService
from src.utils.validators import validate_email
import logging

demo_bp = Blueprint('demos', __name__, url_prefix='/api/demos')
logger = logging.getLogger(__name__)

@demo_bp.route('/request', methods=['POST'])
def create_demo_request():
    """Create new demo request from landing page"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'firstName', 'lastName']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validate email
        if not validate_email(data['email']):
            return jsonify({"error": "Invalid email format"}), 400
        
        # Extract tracking data from headers
        tracking_data = {
            'source': request.headers.get('X-Source', 'website'),
            'utm_source': request.headers.get('X-UTM-Source'),
            'utm_medium': request.headers.get('X-UTM-Medium'),
            'utm_campaign': request.headers.get('X-UTM-Campaign'),
            'referral_code': request.headers.get('X-Referral-Code'),
            'landing_page': request.headers.get('X-Landing-Page'),
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent')
        }
        
        # Create demo request
        demo_service = DemoService()
        result = demo_service.create_demo_request(data, tracking_data)
        
        return jsonify({
            "success": True,
            "demo": result
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating demo request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@demo_bp.route('/<demo_number>', methods=['GET'])
def get_demo_request(demo_number):
    """Get demo request by demo number"""
    try:
        demo_service = DemoService()
        demo = demo_service.find_by_demo_number(demo_number)
        
        if not demo:
            return jsonify({"error": "Demo request not found"}), 404
        
        return jsonify({
            "success": True,
            "demo": demo
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting demo request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@demo_bp.route('/<demo_number>/convert', methods=['POST'])
def convert_demo_to_trial(demo_number):
    """Convert demo request to trial customer"""
    try:
        data = request.get_json()
        trial_plan = data.get('planId', 'starter')
        
        demo_service = DemoService()
        result = demo_service.convert_demo_to_trial(demo_number, trial_plan)
        
        return jsonify({
            "success": True,
            "conversion": result
        }), 200
        
    except Exception as e:
        logger.error(f"Error converting demo to trial: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# src/routes/webhooks.py
from flask import Blueprint, request, jsonify
from src.services.webhook_service import WebhookService
import logging

webhook_bp = Blueprint('webhooks', __name__, url_prefix='/api/webhooks')
logger = logging.getLogger(__name__)

@webhook_bp.route('/stripe', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events"""
    try:
        payload = request.get_data()
        signature = request.headers.get('Stripe-Signature')
        
        webhook_service = WebhookService()
        result = webhook_service.handle_stripe_webhook(payload, signature)
        
        return jsonify(result[0]), result[1]
        
    except Exception as e:
        logger.error(f"Error handling Stripe webhook: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@webhook_bp.route('/vapi', methods=['POST'])
def vapi_webhook():
    """Handle Vapi webhook events"""
    try:
        data = request.get_json()
        
        webhook_service = WebhookService()
        result = webhook_service.handle_vapi_webhook(data)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error handling Vapi webhook: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@webhook_bp.route('/usage', methods=['POST'])
def usage_webhook():
    """Handle usage tracking webhook"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['customer_number', 'call_id', 'duration']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        webhook_service = WebhookService()
        result = webhook_service.handle_usage_webhook(data)
        
        return jsonify({
            "success": True,
            "usage_logged": result
        }), 200
        
    except Exception as e:
        logger.error(f"Error handling usage webhook: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
```

### Service Layer Implementation

The service layer encapsulates business logic and provides a clean interface between the API routes and data models.

```python
# src/services/customer_service.py
from src.models.customer import Customer
from src.models.usage_log import UsageLog
from src.services.stripe_service import StripeService
from src.utils.customer_number_generator import CustomerNumberGenerator
from datetime import datetime, timedelta
import logging

class CustomerService:
    def __init__(self):
        self.customer_model = Customer()
        self.usage_model = UsageLog()
        self.stripe_service = StripeService()
        self.number_generator = CustomerNumberGenerator()
        self.logger = logging.getLogger(__name__)
    
    def create_customer(self, email: str, profile_data: dict, 
                       plan_id: str, payment_method_id: str = None) -> dict:
        """Create new customer with Stripe integration"""
        
        # Generate customer number
        customer_number = self.number_generator.generate_customer_number()
        
        # Create Stripe customer
        stripe_customer = self.stripe_service.create_customer(
            email=email,
            name=f"{profile_data.get('firstName', '')} {profile_data.get('lastName', '')}",
            phone=profile_data.get('phone'),
            metadata={
                "customer_number": customer_number,
                "company": profile_data.get('company', ''),
                "source": profile_data.get('source', 'direct')
            }
        )
        
        # Attach payment method if provided
        if payment_method_id:
            self.stripe_service.attach_payment_method(
                payment_method_id, stripe_customer.id
            )
        
        # Get plan details
        plan = self.get_plan_details(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        # Create customer record
        customer_data = {
            "customerNumber": customer_number,
            "email": email,
            "profile": profile_data,
            "subscription": {
                "planId": plan_id,
                "status": "trial" if profile_data.get('trial', False) else "active",
                "currentPeriodStart": datetime.utcnow(),
                "currentPeriodEnd": datetime.utcnow() + timedelta(days=30),
                "minutesIncluded": plan['features']['minutesIncluded'],
                "minutesUsed": 0,
                "minutesRemaining": plan['features']['minutesIncluded'],
                "autoRenew": True,
                "trialEnd": datetime.utcnow() + timedelta(days=14) if profile_data.get('trial', False) else None
            },
            "stripeCustomerId": stripe_customer.id,
            "usage": {
                "totalMinutesUsed": 0,
                "currentMonthMinutes": 0,
                "lastCallDate": None,
                "averageCallDuration": 0,
                "totalCalls": 0
            },
            "metadata": {
                "source": profile_data.get('source', 'direct'),
                "referralCode": profile_data.get('referralCode'),
                "notes": ""
            },
            "isActive": True
        }
        
        # Save customer
        customer = self.customer_model.create(customer_data)
        
        # Create subscription if not trial
        if not profile_data.get('trial', False):
            subscription = self.stripe_service.create_subscription(
                customer_id=stripe_customer.id,
                price_id=plan['stripePriceId'],
                metadata={
                    "customer_number": customer_number,
                    "plan_id": plan_id
                }
            )
            
            # Update customer with subscription ID
            self.customer_model.collection.update_one(
                {"customerNumber": customer_number},
                {"$set": {"subscription.stripeSubscriptionId": subscription.id}}
            )
        
        return {
            "customer_number": customer_number,
            "stripe_customer_id": stripe_customer.id,
            "plan": plan_id,
            "status": customer_data['subscription']['status']
        }
    
    def find_by_customer_number(self, customer_number: str) -> dict:
        """Find customer by customer number"""
        return self.customer_model.find_by_customer_number(customer_number)
    
    def find_by_email(self, email: str) -> dict:
        """Find customer by email"""
        return self.customer_model.find_by_email(email)
    
    def get_usage_statistics(self, customer_number: str) -> dict:
        """Get comprehensive usage statistics for customer"""
        
        customer = self.find_by_customer_number(customer_number)
        if not customer:
            raise ValueError(f"Customer {customer_number} not found")
        
        # Get current month usage
        now = datetime.utcnow()
        current_month_usage = self.usage_model.get_monthly_usage(
            customer_number, now.year, now.month
        )
        
        # Get last 6 months usage trend
        usage_trend = []
        for i in range(6):
            month_date = now - timedelta(days=30 * i)
            monthly_data = self.usage_model.get_monthly_usage(
                customer_number, month_date.year, month_date.month
            )
            usage_trend.append({
                "month": month_date.strftime("%Y-%m"),
                "minutes": monthly_data['totalMinutes'],
                "calls": monthly_data['totalCalls'],
                "cost": monthly_data['totalCost']
            })
        
        # Calculate health score
        health_score = self.calculate_health_score(customer)
        
        return {
            "current_period": {
                "minutes_included": customer['subscription']['minutesIncluded'],
                "minutes_used": customer['subscription']['minutesUsed'],
                "minutes_remaining": customer['subscription']['minutesRemaining'],
                "usage_percentage": (customer['subscription']['minutesUsed'] / 
                                   customer['subscription']['minutesIncluded']) * 100
            },
            "current_month": current_month_usage,
            "usage_trend": usage_trend,
            "health_score": health_score,
            "last_activity": customer['usage']['lastCallDate']
        }
    
    def calculate_health_score(self, customer: dict) -> int:
        """Calculate customer health score (0-100)"""
        score = 0
        
        # Usage activity (40 points)
        if customer['usage']['lastCallDate']:
            days_since_usage = (datetime.utcnow() - customer['usage']['lastCallDate']).days
            if days_since_usage <= 7:
                score += 40
            elif days_since_usage <= 30:
                score += 30
            elif days_since_usage <= 90:
                score += 20
            else:
                score += 5
        
        # Subscription status (30 points)
        status = customer['subscription']['status']
        if status == 'active':
            score += 30
        elif status == 'trialing':
            score += 25
        elif status == 'past_due':
            score += 10
        
        # Usage ratio (20 points)
        minutes_used = customer['subscription']['minutesUsed']
        minutes_included = customer['subscription']['minutesIncluded']
        
        if minutes_included > 0:
            usage_ratio = minutes_used / minutes_included
            if 0.3 <= usage_ratio <= 0.8:
                score += 20
            elif 0.1 <= usage_ratio < 0.3:
                score += 15
            elif usage_ratio > 0.8:
                score += 18
        
        # Account age (10 points)
        account_age = (datetime.utcnow() - customer['createdAt']).days
        if account_age >= 90:
            score += 10
        elif account_age >= 30:
            score += 7
        elif account_age >= 7:
            score += 5
        
        return min(score, 100)

# src/services/demo_service.py
from src.models.demo_request import DemoRequest
from src.services.customer_service import CustomerService
from src.utils.customer_number_generator import CustomerNumberGenerator
from src.utils.lead_scorer import LeadScorer
from src.utils.notifications import NotificationService
import logging

class DemoService:
    def __init__(self):
        self.demo_model = DemoRequest()
        self.customer_service = CustomerService()
        self.number_generator = CustomerNumberGenerator()
        self.lead_scorer = LeadScorer()
        self.notification_service = NotificationService()
        self.logger = logging.getLogger(__name__)
    
    def create_demo_request(self, form_data: dict, tracking_data: dict = None) -> dict:
        """Create new demo request with lead scoring"""
        
        # Check for duplicate email
        existing_demo = self.demo_model.find_by_email(form_data['email'])
        if existing_demo:
            return {
                "status": "duplicate",
                "demo_number": existing_demo['demoNumber'],
                "message": "Demo request already exists for this email"
            }
        
        # Generate demo number
        demo_number = self.number_generator.generate_customer_number("DEMO")
        
        # Calculate lead score
        lead_qualification = self.lead_scorer.qualify_lead(form_data)
        
        # Create demo request
        demo_data = {
            "demoNumber": demo_number,
            "leadInfo": {
                "email": form_data['email'].lower().strip(),
                "firstName": form_data.get('firstName', '').strip(),
                "lastName": form_data.get('lastName', '').strip(),
                "company": form_data.get('company', '').strip(),
                "jobTitle": form_data.get('jobTitle', '').strip(),
                "phone": form_data.get('phone', '').strip(),
                "website": form_data.get('website', '').strip(),
                "companySize": form_data.get('companySize', ''),
                "industry": form_data.get('industry', ''),
                "useCase": form_data.get('useCase', ''),
                "expectedVolume": form_data.get('expectedVolume', '')
            },
            "demoDetails": {
                "requestedDate": None,
                "preferredTime": form_data.get('preferredTime', ''),
                "timezone": form_data.get('timezone', 'UTC'),
                "demoType": form_data.get('demoType', 'live'),
                "duration": int(form_data.get('duration', 30)),
                "specialRequests": form_data.get('specialRequests', ''),
                "technicalRequirements": form_data.get('technicalRequirements', '')
            },
            "qualification": {
                "budget": form_data.get('budget', ''),
                "timeline": form_data.get('timeline', ''),
                "authority": form_data.get('authority', ''),
                "currentSolution": form_data.get('currentSolution', ''),
                "painPoints": form_data.get('painPoints', []),
                "leadScore": lead_qualification['total_score']
            },
            "status": {
                "current": "requested",
                "assignedTo": self.assign_sales_rep(lead_qualification['total_score']),
                "notes": [],
                "conversionProbability": lead_qualification['conversion_probability']
            },
            "tracking": tracking_data or {},
            "trial": {
                "isTrialRequested": form_data.get('requestTrial', False),
                "trialDuration": 14,
                "trialStartDate": None,
                "trialEndDate": None,
                "trialUsage": {
                    "minutesUsed": 0,
                    "callsCompleted": 0,
                    "lastActivity": None
                }
            }
        }
        
        # Save demo request
        demo = self.demo_model.create(demo_data)
        
        # Send notifications
        self.send_demo_notifications(demo)
        
        return {
            "status": "created",
            "demo_number": demo_number,
            "lead_score": lead_qualification['total_score'],
            "lead_grade": lead_qualification['grade'],
            "estimated_value": lead_qualification['estimated_value'],
            "recommended_actions": lead_qualification['recommended_actions']
        }
    
    def convert_demo_to_trial(self, demo_number: str, trial_plan: str = "starter") -> dict:
        """Convert demo request to trial customer"""
        
        demo = self.demo_model.find_by_demo_number(demo_number)
        if not demo:
            raise ValueError(f"Demo request {demo_number} not found")
        
        if demo.get('convertedToCustomerNumber'):
            return {
                "status": "already_converted",
                "customer_number": demo['convertedToCustomerNumber']
            }
        
        # Create trial customer
        profile_data = {
            "firstName": demo['leadInfo']['firstName'],
            "lastName": demo['leadInfo']['lastName'],
            "company": demo['leadInfo']['company'],
            "phone": demo['leadInfo']['phone'],
            "source": "demo_conversion",
            "trial": True
        }
        
        customer_result = self.customer_service.create_customer(
            email=demo['leadInfo']['email'],
            profile_data=profile_data,
            plan_id=trial_plan
        )
        
        # Update demo request
        self.demo_model.collection.update_one(
            {"demoNumber": demo_number},
            {
                "$set": {
                    "status.current": "converted",
                    "convertedAt": datetime.utcnow(),
                    "convertedToCustomerNumber": customer_result['customer_number'],
                    "trial.trialCustomerNumber": customer_result['customer_number'],
                    "trial.trialStartDate": datetime.utcnow(),
                    "trial.trialEndDate": datetime.utcnow() + timedelta(days=14),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return {
            "status": "converted",
            "customer_number": customer_result['customer_number'],
            "trial_end_date": (datetime.utcnow() + timedelta(days=14)).isoformat()
        }
```


## Testing and Deployment

### Local Development Setup

Setting up the local development environment requires careful configuration of all dependencies and services. The development environment should mirror production as closely as possible to ensure reliable deployment.

First, ensure you have Python 3.8 or higher, MongoDB, and Node.js installed on your development machine. Clone the repository and navigate to the project directory to begin the setup process.

```bash
# Clone and setup the project
git clone <your-repository-url>
cd vapi-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Install MongoDB (Ubuntu/Debian)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create environment file
cp .env.example .env
# Edit .env with your configuration values
```

Configure your environment variables in the `.env` file with appropriate values for development. Use test API keys for Stripe and Vapi to avoid affecting production data during development.

```bash
# Development environment configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vapi_service_dev
MONGODB_DB_NAME=vapi_service_dev

# Stripe Test Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret

# Vapi Test Configuration
VAPI_PRIVATE_KEY=your_test_vapi_private_key
VAPI_PUBLIC_KEY=your_test_vapi_public_key
```

Initialize the database with the required collections and indexes by running the setup script:

```python
# src/utils/database_setup.py
from pymongo import MongoClient
import os
from datetime import datetime

def setup_database():
    """Initialize database with collections and indexes"""
    
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client[os.getenv('MONGODB_DB_NAME')]
    
    # Create collections with validation
    create_customers_collection(db)
    create_demo_requests_collection(db)
    create_usage_logs_collection(db)
    create_payments_collection(db)
    create_pricing_plans_collection(db)
    
    # Create indexes
    create_indexes(db)
    
    # Insert default pricing plans
    insert_default_pricing_plans(db)
    
    print("Database setup completed successfully")

def create_customers_collection(db):
    """Create customers collection with validation"""
    db.create_collection("customers", {
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["customerNumber", "email", "profile", "subscription"],
                "properties": {
                    "customerNumber": {
                        "bsonType": "string",
                        "pattern": "^CUST-[0-9]{8}-[0-9]{4}$"
                    },
                    "email": {
                        "bsonType": "string",
                        "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                    }
                }
            }
        }
    })

def create_indexes(db):
    """Create all required indexes"""
    
    # Customer indexes
    db.customers.create_index([("customerNumber", 1)], unique=True)
    db.customers.create_index([("email", 1)], unique=True)
    db.customers.create_index([("stripeCustomerId", 1)])
    db.customers.create_index([("subscription.status", 1)])
    
    # Demo request indexes
    db.demo_requests.create_index([("demoNumber", 1)], unique=True)
    db.demo_requests.create_index([("leadInfo.email", 1)])
    db.demo_requests.create_index([("status.current", 1)])
    db.demo_requests.create_index([("qualification.leadScore", -1)])
    
    # Usage log indexes
    db.usage_logs.create_index([("customerNumber", 1), ("createdAt", -1)])
    db.usage_logs.create_index([("callId", 1)], unique=True)
    db.usage_logs.create_index([("billing.billingPeriod", 1)])
    
    # Payment indexes
    db.payments.create_index([("customerNumber", 1), ("createdAt", -1)])
    db.payments.create_index([("paymentId", 1)], unique=True)
    db.payments.create_index([("stripePaymentIntentId", 1)])

def insert_default_pricing_plans(db):
    """Insert default pricing plans"""
    
    plans = [
        {
            "planId": "starter",
            "name": "Starter Plan",
            "description": "Perfect for small businesses and testing",
            "pricing": {
                "amount": 9900,
                "currency": "usd",
                "interval": "month",
                "intervalCount": 1
            },
            "features": {
                "minutesIncluded": 80,
                "overageRate": 150,
                "usageWindow": 30,
                "maxConcurrentCalls": 2,
                "supportLevel": "standard",
                "analyticsLevel": "basic",
                "customIntegrations": False,
                "whiteLabel": False,
                "slaGuarantee": False
            },
            "limits": {
                "maxAssistants": 2,
                "maxPhoneNumbers": 1,
                "maxWebhooks": 3,
                "apiRateLimit": 100
            },
            "isActive": True,
            "sortOrder": 1,
            "createdAt": datetime.utcnow()
        },
        {
            "planId": "professional",
            "name": "Professional Plan",
            "description": "For growing businesses",
            "pricing": {
                "amount": 24900,
                "currency": "usd",
                "interval": "month",
                "intervalCount": 1
            },
            "features": {
                "minutesIncluded": 250,
                "overageRate": 125,
                "usageWindow": 60,
                "maxConcurrentCalls": 5,
                "supportLevel": "priority",
                "analyticsLevel": "advanced",
                "customIntegrations": True,
                "whiteLabel": False,
                "slaGuarantee": False
            },
            "limits": {
                "maxAssistants": 5,
                "maxPhoneNumbers": 3,
                "maxWebhooks": 10,
                "apiRateLimit": 500
            },
            "isActive": True,
            "sortOrder": 2,
            "createdAt": datetime.utcnow()
        }
        # Add other plans...
    ]
    
    for plan in plans:
        db.pricing_plans.update_one(
            {"planId": plan["planId"]},
            {"$set": plan},
            upsert=True
        )

if __name__ == "__main__":
    setup_database()
```

### Unit Testing Implementation

Comprehensive unit testing ensures code reliability and facilitates safe refactoring. The test suite covers all major functionality including customer management, demo requests, usage tracking, and payment processing.

```python
# tests/test_customer_service.py
import unittest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from services.customer_service import CustomerService
from models.customer import Customer

class TestCustomerService(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        self.customer_service = CustomerService()
        self.customer_service.customer_model = Mock()
        self.customer_service.stripe_service = Mock()
        self.customer_service.number_generator = Mock()
        
        # Mock customer data
        self.mock_customer_data = {
            "customerNumber": "CUST-20250711-0001",
            "email": "test@example.com",
            "profile": {
                "firstName": "John",
                "lastName": "Doe",
                "company": "Test Corp"
            },
            "subscription": {
                "planId": "starter",
                "status": "active",
                "minutesIncluded": 80,
                "minutesUsed": 20,
                "minutesRemaining": 60
            },
            "usage": {
                "totalMinutesUsed": 20,
                "totalCalls": 5,
                "lastCallDate": datetime.utcnow()
            },
            "createdAt": datetime.utcnow()
        }
    
    def test_create_customer_success(self):
        """Test successful customer creation"""
        
        # Setup mocks
        self.customer_service.number_generator.generate_customer_number.return_value = "CUST-20250711-0001"
        self.customer_service.stripe_service.create_customer.return_value = Mock(id="cus_test123")
        self.customer_service.customer_model.create.return_value = self.mock_customer_data
        
        # Mock plan details
        with patch.object(self.customer_service, 'get_plan_details') as mock_get_plan:
            mock_get_plan.return_value = {
                "features": {"minutesIncluded": 80},
                "stripePriceId": "price_test123"
            }
            
            # Test customer creation
            result = self.customer_service.create_customer(
                email="test@example.com",
                profile_data={"firstName": "John", "lastName": "Doe"},
                plan_id="starter"
            )
            
            # Assertions
            self.assertEqual(result["customer_number"], "CUST-20250711-0001")
            self.assertEqual(result["plan"], "starter")
            self.customer_service.stripe_service.create_customer.assert_called_once()
            self.customer_service.customer_model.create.assert_called_once()
    
    def test_create_customer_duplicate_email(self):
        """Test customer creation with duplicate email"""
        
        # Setup mock to return existing customer
        self.customer_service.customer_model.find_by_email.return_value = self.mock_customer_data
        
        # Test should raise exception or handle gracefully
        with self.assertRaises(ValueError):
            self.customer_service.create_customer(
                email="test@example.com",
                profile_data={"firstName": "John", "lastName": "Doe"},
                plan_id="starter"
            )
    
    def test_calculate_health_score(self):
        """Test health score calculation"""
        
        # Test with healthy customer
        healthy_customer = self.mock_customer_data.copy()
        healthy_customer['usage']['lastCallDate'] = datetime.utcnow() - timedelta(days=3)
        healthy_customer['subscription']['status'] = 'active'
        
        score = self.customer_service.calculate_health_score(healthy_customer)
        self.assertGreaterEqual(score, 70)  # Should be high score
        
        # Test with inactive customer
        inactive_customer = self.mock_customer_data.copy()
        inactive_customer['usage']['lastCallDate'] = datetime.utcnow() - timedelta(days=100)
        inactive_customer['subscription']['status'] = 'past_due'
        
        score = self.customer_service.calculate_health_score(inactive_customer)
        self.assertLessEqual(score, 30)  # Should be low score

# tests/test_demo_service.py
class TestDemoService(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        self.demo_service = DemoService()
        self.demo_service.demo_model = Mock()
        self.demo_service.number_generator = Mock()
        self.demo_service.lead_scorer = Mock()
        
        self.mock_form_data = {
            "email": "lead@example.com",
            "firstName": "Jane",
            "lastName": "Smith",
            "company": "Lead Corp",
            "companySize": "51-200",
            "budget": "$2000-5000",
            "timeline": "1-3 months"
        }
    
    def test_create_demo_request_success(self):
        """Test successful demo request creation"""
        
        # Setup mocks
        self.demo_service.demo_model.find_by_email.return_value = None
        self.demo_service.number_generator.generate_customer_number.return_value = "DEMO-20250711-0001"
        self.demo_service.lead_scorer.qualify_lead.return_value = {
            "total_score": 75,
            "grade": "B",
            "conversion_probability": 50,
            "estimated_value": {"monthly_value": 249},
            "recommended_actions": ["Schedule demo within 48 hours"]
        }
        
        # Test demo creation
        result = self.demo_service.create_demo_request(self.mock_form_data)
        
        # Assertions
        self.assertEqual(result["status"], "created")
        self.assertEqual(result["demo_number"], "DEMO-20250711-0001")
        self.assertEqual(result["lead_score"], 75)
        self.demo_service.demo_model.create.assert_called_once()
    
    def test_create_demo_request_duplicate(self):
        """Test demo request creation with duplicate email"""
        
        # Setup mock to return existing demo
        self.demo_service.demo_model.find_by_email.return_value = {
            "demoNumber": "DEMO-20250710-0001"
        }
        
        # Test demo creation
        result = self.demo_service.create_demo_request(self.mock_form_data)
        
        # Assertions
        self.assertEqual(result["status"], "duplicate")
        self.assertEqual(result["demo_number"], "DEMO-20250710-0001")

# tests/test_api_routes.py
class TestAPIRoutes(unittest.TestCase):
    
    def setUp(self):
        """Set up test Flask app"""
        from src.main import create_app
        self.app = create_app(testing=True)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
    
    def tearDown(self):
        """Clean up after tests"""
        self.app_context.pop()
    
    def test_create_customer_endpoint(self):
        """Test customer creation endpoint"""
        
        customer_data = {
            "email": "test@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "planId": "starter"
        }
        
        with patch('src.services.customer_service.CustomerService') as mock_service:
            mock_service.return_value.create_customer.return_value = {
                "customer_number": "CUST-20250711-0001",
                "plan": "starter",
                "status": "active"
            }
            
            response = self.client.post('/api/customers/', 
                                      json=customer_data,
                                      content_type='application/json')
            
            self.assertEqual(response.status_code, 201)
            data = response.get_json()
            self.assertTrue(data["success"])
            self.assertIn("customer", data)
    
    def test_create_demo_request_endpoint(self):
        """Test demo request creation endpoint"""
        
        demo_data = {
            "email": "lead@example.com",
            "firstName": "Jane",
            "lastName": "Smith",
            "company": "Lead Corp"
        }
        
        with patch('src.services.demo_service.DemoService') as mock_service:
            mock_service.return_value.create_demo_request.return_value = {
                "status": "created",
                "demo_number": "DEMO-20250711-0001",
                "lead_score": 75
            }
            
            response = self.client.post('/api/demos/request',
                                      json=demo_data,
                                      content_type='application/json')
            
            self.assertEqual(response.status_code, 201)
            data = response.get_json()
            self.assertTrue(data["success"])
            self.assertIn("demo", data)

if __name__ == '__main__':
    unittest.main()
```

### Integration Testing

Integration tests verify that different components work together correctly, particularly the interactions with external services like Stripe and Vapi.

```python
# tests/test_integration.py
import unittest
import os
import stripe
from datetime import datetime, timedelta
from pymongo import MongoClient

class TestStripeIntegration(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        stripe.api_key = os.getenv('STRIPE_TEST_SECRET_KEY')
        cls.mongo_client = MongoClient(os.getenv('MONGODB_TEST_URI'))
        cls.db = cls.mongo_client[os.getenv('MONGODB_TEST_DB_NAME')]
    
    def setUp(self):
        """Clean up test data before each test"""
        # Clean up test customers and subscriptions
        self.cleanup_test_data()
    
    def tearDown(self):
        """Clean up test data after each test"""
        self.cleanup_test_data()
    
    def cleanup_test_data(self):
        """Remove test data from Stripe and MongoDB"""
        # Clean up MongoDB test data
        self.db.customers.delete_many({"email": {"$regex": "test.*@example.com"}})
        self.db.demo_requests.delete_many({"leadInfo.email": {"$regex": "test.*@example.com"}})
        
        # Clean up Stripe test data would go here
        # Note: In real tests, you'd use Stripe's test mode
    
    def test_customer_creation_with_stripe(self):
        """Test end-to-end customer creation with Stripe"""
        
        from src.services.customer_service import CustomerService
        
        customer_service = CustomerService()
        
        # Create customer
        result = customer_service.create_customer(
            email="test.integration@example.com",
            profile_data={
                "firstName": "Integration",
                "lastName": "Test",
                "company": "Test Corp"
            },
            plan_id="starter"
        )
        
        # Verify customer was created
        self.assertIsNotNone(result["customer_number"])
        self.assertIsNotNone(result["stripe_customer_id"])
        
        # Verify in database
        customer = self.db.customers.find_one({
            "customerNumber": result["customer_number"]
        })
        self.assertIsNotNone(customer)
        self.assertEqual(customer["email"], "test.integration@example.com")
        
        # Verify in Stripe
        stripe_customer = stripe.Customer.retrieve(result["stripe_customer_id"])
        self.assertEqual(stripe_customer.email, "test.integration@example.com")

class TestVapiIntegration(unittest.TestCase):
    
    def test_usage_webhook_processing(self):
        """Test processing of Vapi usage webhooks"""
        
        from src.services.webhook_service import WebhookService
        
        # Create test customer first
        test_customer = {
            "customerNumber": "CUST-20250711-TEST",
            "email": "test.vapi@example.com",
            "subscription": {
                "planId": "starter",
                "minutesIncluded": 80,
                "minutesUsed": 0,
                "minutesRemaining": 80
            }
        }
        
        self.db.customers.insert_one(test_customer)
        
        # Simulate Vapi webhook data
        webhook_data = {
            "customer_number": "CUST-20250711-TEST",
            "call_id": "call_test_123",
            "duration": 120,  # 2 minutes
            "start_time": datetime.utcnow().isoformat(),
            "end_time": (datetime.utcnow() + timedelta(minutes=2)).isoformat(),
            "call_type": "inbound",
            "transcript": "Test conversation transcript"
        }
        
        webhook_service = WebhookService()
        result = webhook_service.handle_usage_webhook(webhook_data)
        
        # Verify usage was recorded
        self.assertTrue(result)
        
        # Verify customer usage was updated
        updated_customer = self.db.customers.find_one({
            "customerNumber": "CUST-20250711-TEST"
        })
        self.assertEqual(updated_customer["subscription"]["minutesUsed"], 2)
        self.assertEqual(updated_customer["subscription"]["minutesRemaining"], 78)
        
        # Verify usage log was created
        usage_log = self.db.usage_logs.find_one({
            "customerNumber": "CUST-20250711-TEST",
            "callId": "call_test_123"
        })
        self.assertIsNotNone(usage_log)
        self.assertEqual(usage_log["usage"]["durationMinutes"], 2)

if __name__ == '__main__':
    unittest.main()
```

### Production Deployment

Production deployment requires careful configuration of security, monitoring, and scalability features. The deployment process should be automated and include proper backup and rollback procedures.

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/vapi_service
    depends_on:
      - mongo
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    
  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure_password
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/
COPY .env .

# Create logs directory
RUN mkdir -p logs

# Set environment variables
ENV PYTHONPATH=/app
ENV FLASK_APP=src.main:app

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "src.main:app"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server web:5000;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=webhook:10m rate=100r/s;
    
    server {
        listen 80;
        server_name your-domain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name your-domain.com;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
        
        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Webhook endpoints (higher rate limit)
        location /api/webhooks/ {
            limit_req zone=webhook burst=50 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health check
        location /health {
            proxy_pass http://app;
            access_log off;
        }
        
        # Static files
        location /static/ {
            alias /app/src/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Monitoring and Logging

Comprehensive monitoring and logging ensure system reliability and enable quick issue resolution. The monitoring setup includes application metrics, error tracking, and performance monitoring.

```python
# src/utils/monitoring.py
import logging
import time
from functools import wraps
from flask import request, g
import psutil
import os
from datetime import datetime

class ApplicationMonitor:
    def __init__(self, app=None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize monitoring for Flask app"""
        
        # Configure logging
        self.setup_logging(app)
        
        # Add request monitoring
        app.before_request(self.before_request)
        app.after_request(self.after_request)
        
        # Add error handlers
        app.errorhandler(Exception)(self.handle_exception)
    
    def setup_logging(self, app):
        """Configure application logging"""
        
        # Create logs directory
        os.makedirs('logs', exist_ok=True)
        
        # Configure root logger
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s %(levelname)s %(name)s: %(message)s',
            handlers=[
                logging.FileHandler('logs/app.log'),
                logging.StreamHandler()
            ]
        )
        
        # Configure specific loggers
        loggers = {
            'werkzeug': logging.WARNING,  # Reduce Flask request logs
            'stripe': logging.INFO,
            'pymongo': logging.WARNING,
            'requests': logging.WARNING
        }
        
        for logger_name, level in loggers.items():
            logging.getLogger(logger_name).setLevel(level)
    
    def before_request(self):
        """Record request start time and details"""
        g.start_time = time.time()
        g.request_id = self.generate_request_id()
        
        # Log request details
        logging.info(f"Request {g.request_id}: {request.method} {request.path}")
    
    def after_request(self, response):
        """Log request completion and performance metrics"""
        
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            
            # Log response details
            logging.info(
                f"Request {g.request_id} completed: "
                f"status={response.status_code} duration={duration:.3f}s"
            )
            
            # Log slow requests
            if duration > 2.0:
                logging.warning(
                    f"Slow request {g.request_id}: "
                    f"{request.method} {request.path} took {duration:.3f}s"
                )
        
        return response
    
    def handle_exception(self, error):
        """Handle and log application exceptions"""
        
        request_id = getattr(g, 'request_id', 'unknown')
        
        logging.error(
            f"Exception in request {request_id}: {str(error)}",
            exc_info=True
        )
        
        # Return appropriate error response
        if hasattr(error, 'code'):
            return {"error": "An error occurred"}, error.code
        else:
            return {"error": "Internal server error"}, 500
    
    def generate_request_id(self):
        """Generate unique request ID"""
        import uuid
        return str(uuid.uuid4())[:8]

def monitor_performance(func):
    """Decorator to monitor function performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            
            logging.info(f"Function {func.__name__} completed in {duration:.3f}s")
            
            if duration > 1.0:
                logging.warning(f"Slow function {func.__name__}: {duration:.3f}s")
            
            return result
            
        except Exception as e:
            duration = time.time() - start_time
            logging.error(
                f"Function {func.__name__} failed after {duration:.3f}s: {str(e)}",
                exc_info=True
            )
            raise
    
    return wrapper

class SystemMetrics:
    """Collect and report system metrics"""
    
    @staticmethod
    def get_system_metrics():
        """Get current system metrics"""
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
            "load_average": os.getloadavg() if hasattr(os, 'getloadavg') else None,
            "process_count": len(psutil.pids())
        }
    
    @staticmethod
    def get_application_metrics(db):
        """Get application-specific metrics"""
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "total_customers": db.customers.count_documents({}),
            "active_customers": db.customers.count_documents({"isActive": True}),
            "demo_requests_today": db.demo_requests.count_documents({
                "createdAt": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0)}
            }),
            "usage_logs_today": db.usage_logs.count_documents({
                "createdAt": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0)}
            }),
            "total_revenue_today": db.payments.aggregate([
                {"$match": {
                    "createdAt": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0)},
                    "payment.status": "succeeded"
                }},
                {"$group": {"_id": None, "total": {"$sum": "$billing.amount"}}}
            ])
        }
```

This comprehensive implementation guide provides everything needed to build, test, and deploy a production-ready Vapi service with MongoDB storage and Stripe payments. The system includes robust customer management, demo handling, usage tracking, and automated billing capabilities with proper monitoring and security measures.

