# Vapi API Analysis

## Core API Structure

### Authentication
- Bearer token authentication: `Authorization: Bearer <token>`
- Get private API key from dashboard
- Required for all API calls

### Main API Endpoints (from uploaded documentation)

#### 1. Assistants API
- **List**: GET /assistants
- **Create**: POST /assistant
- **Get**: GET /assistant/{id}
- **Update**: PUT /assistant/{id}
- **Delete**: DELETE /assistant/{id}

#### 2. Phone Numbers API
- **List**: GET /phone-numbers
- **Create**: POST /phone-number
- **Get**: GET /phone-number/{id}
- **Update**: PUT /phone-number/{id}
- **Delete**: DELETE /phone-number/{id}

#### 3. Tools API
- **List**: GET /tools
- **Create**: POST /tool
- **Get**: GET /tool/{id}
- **Update**: PUT /tool/{id}
- **Delete**: DELETE /tool/{id}

#### 4. Files API
- **List**: GET /files
- **Create**: POST /file
- **Get**: GET /file/{id}
- **Update**: PUT /file/{id}
- **Delete**: DELETE /file/{id}

#### 5. Knowledge Base API
- **List**: GET /knowledge-bases
- **Create**: POST /knowledge-base
- **Get**: GET /knowledge-base/{id}
- **Update**: PUT /knowledge-base/{id}
- **Delete**: DELETE /knowledge-base/{id}

#### 6. Workflows API
- **List**: GET /workflow
- **Create**: POST /workflow
- **Get**: GET /workflow/{id}
- **Update**: PUT /workflow/{id}
- **Delete**: DELETE /workflow/{id}

#### 7. Squads API
- **List**: GET /squads
- **Create**: POST /squad
- **Get**: GET /squad/{id}
- **Update**: PUT /squad/{id}
- **Delete**: DELETE /squad/{id}

#### 8. Analytics API
- **Get**: GET /analytics

#### 9. Webhooks API
- Server message handling for real-time events

## Two Implementation Approaches

### 1. Assistants (Simple Approach)
- **Best for**: Quick kickstart for simple conversations
- **Use cases**: 
  - Customer support chatbots
  - Simple question-answering agents
  - Getting started quickly with minimal setup
- **Configuration**: Single system prompt to control behavior
- **Implementation**: Direct API calls to create and manage assistants

### 2. Workflows (Complex Approach)
- **Best for**: Complex logic and multi-step processes
- **Use cases**:
  - Appointment scheduling with availability checks
  - Lead qualification with branching questions
  - Complex customer service flows with escalation
- **Configuration**: Visual decision trees and conditional logic
- **Implementation**: Workflow builder with nodes and conditions

## Key Assistant Configuration Options

### Core Components
1. **Transcriber**: Speech-to-text configuration
   - Provider options: Assembly AI, Deepgram, etc.
   - Language settings
   - Confidence thresholds

2. **Model**: Large Language Model configuration
   - Provider options: OpenAI, Anthropic, Google, etc.
   - Model selection (GPT-4, GPT-3.5, Claude, etc.)
   - System messages and prompts
   - Temperature and other parameters

3. **Voice**: Text-to-speech configuration
   - Provider options: ElevenLabs, OpenAI, Azure, etc.
   - Voice selection and customization
   - Speed and pitch settings

### Advanced Features
- **First Message**: Initial greeting or wait for user
- **Voicemail Detection**: Handle voicemail scenarios
- **Background Sound**: Office, off, or custom audio
- **Max Duration**: Call time limits (10 seconds to 12 hours)
- **End Call Phrases**: Automatic call termination triggers
- **Tool Integration**: Connect to external APIs
- **Webhooks**: Real-time event handling
- **Analysis Plan**: Call analytics and insights
- **Compliance**: HIPAA, PCI, SOC2 settings

## SDK Support

### Available SDKs
- **TypeScript/JavaScript**: `@vapi-ai/server-sdk`
- **Python**: Python SDK available
- **React**: `@vapi-ai/web-sdk` for web integration
- **cURL**: Direct REST API calls

### Basic Implementation Example (TypeScript)
```typescript
import { VapiClient } from '@vapi-ai/server-sdk';

const vapi = new VapiClient({
  token: 'YOUR_PRIVATE_API_KEY'
});

async function createCall() {
  const call = await vapi.calls.create({
    phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
    customer: { number: '+1234567890' },
    assistant: {
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: 'You are a helpful AI assistant.'
        }]
      }
    }
  });
}
```

## Integration Capabilities

### Phone Integration
- Make and receive calls on any phone number
- Support for multiple telephony providers (Twilio, Vonage, etc.)
- SIP support for enterprise telephony systems

### Web Integration
- Embed voice calls directly in web applications
- Real-time audio streaming
- WebRTC support for browser-based calls

### Tool Integration
- Connect to external APIs and databases
- Function calling for dynamic data retrieval
- Custom business logic integration

### Webhook Events
- Real-time call status updates
- Conversation transcripts
- Function call results
- Call analytics and metrics

## Message Types

### Client Messages (sent to Client SDKs)
- conversation-update
- function-call
- hang
- model-output
- speech-update
- status-update
- transcript
- tool-calls
- user-interrupted
- voice-input

### Server Messages (sent to Server URL)
- conversation-update
- end-of-call-report
- function-call
- hang
- speech-update
- status-update
- tool-calls
- transfer-destination-request
- user-interrupted

## CLI Tool
- Vapi CLI for terminal-based development
- Project integration and auto-detection
- Webhook forwarding for local testing
- MCP (Model Context Protocol) support
- Multi-account environment switching

