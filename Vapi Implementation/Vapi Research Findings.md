# Vapi Research Findings

## What is Vapi?
Vapi is a developer platform for building voice AI agents that can handle phone calls with minimal human intervention. It's an orchestration layer over three core modules: transcriber, language model, and text-to-speech.

## Core Products & Features

### 1. Voice AI Agents
- **Inbound calls**: Handle incoming phone calls automatically
- **Outbound calls**: Make automated phone calls to customers
- **Multilingual support**: 100+ languages supported
- **Natural conversations**: Human-like voice interactions

### 2. Chat API (New Feature)
- Text-based conversations using the same intelligence as voice agents
- Same configuration, tools, and memory across voice and chat
- Extends voice agent capabilities to text interactions

### 3. Workflows
- Complex voice agent routing and resolution
- Adaptive conversation flows
- Integration with existing tech stacks

### 4. Key Technical Features
- **API-native**: Everything exposed as API with 1000s of configurations
- **Tool calling**: Integrate with your APIs for data fetching and actions
- **Bring your own models**: Use your own API keys for STT, LLM, TTS
- **A/B testing**: Test different prompts, voices, and flows
- **Automated testing**: Test suites to identify hallucination risks
- **Sub-500ms latency**: Ultra-low latency interactions
- **99.9% uptime**: Enterprise-grade reliability

### 5. Enterprise Features
- SOC2, HIPAA, PCI compliance
- AI guardrails to prevent hallucinations
- Forward-deployed team support
- Custom enterprise clusters
- SSO and SLA options

## Pricing Structure

### Base Pricing Plans
1. **Ad-Hoc Infra (Pay-as-you-go)**
   - $0.05/minute base hosting cost
   - $10 included credit
   - 10 concurrent lines included (+$10/line/month)
   - Best for: Testing and low-volume usage

2. **Agency Plan - $500/month**
   - 3,000 bundled minutes included
   - $0.18/minute overage
   - 50 concurrent lines included
   - Best for: Agencies and medium-volume usage

3. **Startup Plan - $1,000/month**
   - 7,500 bundled minutes included
   - $0.16/minute overage
   - 100 concurrent lines included
   - Best for: Growing startups with higher volume

4. **Enterprise Plan - Custom**
   - Unlimited concurrent lines
   - Custom pricing and features
   - Best for: Large enterprises

### Additional Costs (BYOK - Bring Your Own Keys)
- **Speech-to-Text (STT)**: ~$0.01/minute (e.g., Deepgram)
- **Large Language Model**: Variable (e.g., GPT-3.5, GPT-4)
- **Text-to-Speech (TTS)**: Variable depending on provider
- **Telephony**: Separate costs for phone number providers (Twilio, Vonage, etc.)

### SMS/Chat Pricing
- $0.005 per message across all plans
- Model costs are BYOK/at-cost

### Add-ons
- **HIPAA/DPA/PCI compliance**: +$1,000/month
- **SIP support**: Included in paid plans
- **Additional concurrent lines**: $10/line/month

## Best Cost-Effective Combinations

### For Low Volume (< 1,000 minutes/month)
- **Plan**: Ad-Hoc Infra (Pay-as-you-go)
- **STT**: Deepgram (~$0.01/min)
- **LLM**: GPT-3.5-turbo (cost-effective)
- **TTS**: Basic provider (~$0.01-0.02/min)
- **Total estimated cost**: ~$0.07-0.08/minute

### For Medium Volume (1,000-5,000 minutes/month)
- **Plan**: Agency Plan ($500/month)
- **Effective rate**: ~$0.17/minute (including bundled minutes)
- **STT**: Deepgram
- **LLM**: GPT-4 for better quality
- **TTS**: Premium provider for better voice quality

### For High Volume (5,000+ minutes/month)
- **Plan**: Startup Plan ($1,000/month)
- **Effective rate**: ~$0.13-0.16/minute
- **Optimization**: Use efficient models and caching strategies

## Use Cases Beyond Calls & Text Response

### 1. Customer Service Automation
- 24/7 customer support
- Ticket routing and resolution
- FAQ handling

### 2. Sales & Lead Qualification
- Outbound sales calls
- Lead scoring and qualification
- Appointment scheduling

### 3. Healthcare Applications
- Appointment reminders
- Prescription refill notifications
- Patient intake and screening

### 4. E-commerce & Retail
- Order status inquiries
- Product recommendations
- Return and refund processing

### 5. Financial Services
- Account balance inquiries
- Payment reminders
- Fraud alerts and verification

### 6. Real Estate
- Property inquiries
- Showing scheduling
- Follow-up calls

### 7. Education & Training
- Student enrollment assistance
- Course information
- Assessment and feedback

### 8. Logistics & Transportation
- Delivery notifications
- Route optimization
- Driver communication

## Integration Capabilities
- 40+ app integrations available
- Webhook support for real-time events
- REST API for all operations
- SDKs for TypeScript, Python, React
- Custom tool integration for business logic

