# Calling Vapi from Localhost Applications

## Yes, You Can Absolutely Call Vapi from Localhost!

Calling Vapi from your localhost application is not only possible but is actually the standard development approach. Vapi is designed to work seamlessly with local development environments, and this is how most developers build and test their voice AI applications before deploying to production.

## How Vapi Localhost Integration Works

### Client-Side Integration (Recommended)
Vapi provides a client-side JavaScript SDK (`@vapi-ai/web`) that runs directly in the browser. This means your localhost React application can communicate directly with Vapi's servers without any special configuration.

**Key Benefits:**
- ✅ No CORS issues - Vapi handles cross-origin requests
- ✅ Real-time voice processing in the browser
- ✅ Direct WebRTC connections for optimal audio quality
- ✅ No backend required for basic voice interactions
- ✅ Works on localhost, staging, and production identically

### Architecture Overview
```
Your Localhost React App (http://localhost:3000)
           ↓
    Vapi Web SDK (@vapi-ai/web)
           ↓
    Vapi Cloud Services (api.vapi.ai)
           ↓
    Voice Providers (11Labs, OpenAI, etc.)
```

## Implementation Methods

### Method 1: Direct Web SDK Integration (Easiest)

This is the approach I provided in your VapiDemoComponent. Here's how it works:

```javascript
import Vapi from '@vapi-ai/web';

// Initialize Vapi with your public key
const vapi = new Vapi('your-vapi-public-key');

// Start a call from localhost
const startCall = async () => {
  try {
    await vapi.start('your-assistant-id');
    console.log('Call started from localhost!');
  } catch (error) {
    console.error('Error starting call:', error);
  }
};
```

**Requirements:**
- Vapi public key (not private key)
- Assistant ID (created via API or dashboard)
- Modern browser with microphone permissions
- Internet connection

### Method 2: API Integration with Backend

If you need server-side functionality, you can also call Vapi's REST API from your localhost backend:

```javascript
// From your localhost Express/Node.js server
const response = await fetch('https://api.vapi.ai/call', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    assistantId: 'your-assistant-id',
    customer: {
      number: '+1234567890' // For phone calls
    }
  })
});
```

## Complete Localhost Setup Guide

### Step 1: Install Dependencies

```bash
# In your React project directory
npm install @vapi-ai/web

# Optional: For backend integration
npm install axios dotenv
```

### Step 2: Environment Configuration

Create a `.env.local` file in your React project:

```env
# .env.local
REACT_APP_VAPI_PUBLIC_KEY=your-vapi-public-key-here
REACT_APP_VAPI_ASSISTANT_CUSTOMER_SERVICE=asst_abc123
REACT_APP_VAPI_ASSISTANT_SALES=asst_def456
REACT_APP_VAPI_ASSISTANT_ECOMMERCE=asst_ghi789
REACT_APP_VAPI_ASSISTANT_SCHEDULING=asst_jkl012
```

### Step 3: Create Vapi Hook

```javascript
// hooks/useVapi.js
import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

export const useVapi = () => {
  const [vapi, setVapi] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const vapiInstance = new Vapi(process.env.REACT_APP_VAPI_PUBLIC_KEY);
    
    // Event listeners
    vapiInstance.on('call-start', () => {
      setIsCallActive(true);
      setCallStatus('active');
      console.log('Call started from localhost');
    });

    vapiInstance.on('call-end', () => {
      setIsCallActive(false);
      setCallStatus('ended');
      console.log('Call ended');
    });

    vapiInstance.on('speech-start', () => {
      console.log('User started speaking');
    });

    vapiInstance.on('speech-end', () => {
      console.log('User stopped speaking');
    });

    vapiInstance.on('message', (message) => {
      if (message.type === 'transcript') {
        setTranscript(prev => prev + ' ' + message.transcript);
      }
    });

    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error);
      setCallStatus('error');
    });

    setVapi(vapiInstance);

    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, []);

  const startCall = async (assistantId) => {
    if (!vapi) return;
    
    try {
      setCallStatus('connecting');
      await vapi.start(assistantId);
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('error');
    }
  };

  const endCall = () => {
    if (vapi && isCallActive) {
      vapi.stop();
    }
  };

  const toggleMute = () => {
    if (vapi) {
      vapi.setMuted(!vapi.isMuted());
    }
  };

  const setVolume = (volume) => {
    if (vapi) {
      vapi.setVolume(volume);
    }
  };

  return {
    vapi,
    isCallActive,
    callStatus,
    transcript,
    startCall,
    endCall,
    toggleMute,
    setVolume,
    isMuted: vapi?.isMuted() || false
  };
};
```

### Step 4: Implement in Your Component

```javascript
// components/VapiDemo.jsx
import React from 'react';
import { useVapi } from '../hooks/useVapi';

const VapiDemo = () => {
  const {
    isCallActive,
    callStatus,
    transcript,
    startCall,
    endCall,
    toggleMute,
    setVolume,
    isMuted
  } = useVapi();

  const assistantConfigs = {
    'customer-service': process.env.REACT_APP_VAPI_ASSISTANT_CUSTOMER_SERVICE,
    'sales': process.env.REACT_APP_VAPI_ASSISTANT_SALES,
    'ecommerce': process.env.REACT_APP_VAPI_ASSISTANT_ECOMMERCE,
    'scheduling': process.env.REACT_APP_VAPI_ASSISTANT_SCHEDULING
  };

  const handleStartDemo = (scenario) => {
    const assistantId = assistantConfigs[scenario];
    if (assistantId) {
      startCall(assistantId);
    }
  };

  return (
    <div className="vapi-demo">
      <h2>MindForU Voice AI Demo (Running on Localhost)</h2>
      
      <div className="status">
        Status: {callStatus}
        {isCallActive && <span> 🔴 LIVE</span>}
      </div>

      <div className="scenarios">
        {Object.keys(assistantConfigs).map(scenario => (
          <button
            key={scenario}
            onClick={() => handleStartDemo(scenario)}
            disabled={isCallActive}
          >
            Start {scenario} Demo
          </button>
        ))}
      </div>

      {isCallActive && (
        <div className="call-controls">
          <button onClick={endCall}>End Call</button>
          <button onClick={toggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </div>
      )}

      {transcript && (
        <div className="transcript">
          <h3>Conversation:</h3>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VapiDemo;
```

## Testing from Localhost

### Browser Requirements
- **Chrome/Edge**: Full support for WebRTC and audio
- **Firefox**: Full support
- **Safari**: Supported with some limitations
- **Mobile browsers**: Generally supported

### Permissions Required
When testing from localhost, the browser will request:
- ✅ Microphone access (required for voice input)
- ✅ Audio playback (for AI responses)

### Development Server Setup

```bash
# Start your React development server
npm start

# Your app will be available at:
# http://localhost:3000

# Vapi will work immediately - no additional configuration needed!
```

## Common Localhost Issues and Solutions

### Issue 1: CORS Errors
**Problem**: Cross-origin request blocked
**Solution**: This shouldn't happen with Vapi's Web SDK, but if it does:
```javascript
// Vapi handles CORS automatically
// No additional configuration needed
```

### Issue 2: Microphone Permissions
**Problem**: Browser blocks microphone access
**Solution**: 
- Ensure you're using HTTPS in production
- For localhost, HTTP is usually fine
- Check browser permissions settings

### Issue 3: Audio Issues
**Problem**: No audio playback or input
**Solution**:
```javascript
// Check audio permissions
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('Microphone access granted');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.error('Microphone access denied:', error);
  });
```

### Issue 4: Environment Variables
**Problem**: API keys not loading
**Solution**:
```bash
# Restart development server after adding .env.local
npm start

# Verify environment variables are loaded
console.log(process.env.REACT_APP_VAPI_PUBLIC_KEY);
```

## Production vs Localhost Differences

### Localhost Development
- ✅ HTTP allowed for testing
- ✅ Console logging enabled
- ✅ Hot reloading for rapid development
- ✅ Environment variables from .env.local

### Production Deployment
- ✅ HTTPS required for microphone access
- ✅ Optimized builds
- ✅ Environment variables from hosting platform
- ✅ Same Vapi integration code works identically

## Security Considerations

### Public vs Private Keys
- **Public Key**: Safe to use in frontend/localhost ✅
- **Private Key**: Never expose in frontend code ❌

### Environment Variables
```javascript
// ✅ Safe for localhost and production
const publicKey = process.env.REACT_APP_VAPI_PUBLIC_KEY;

// ❌ Never do this in frontend
const privateKey = process.env.VAPI_PRIVATE_KEY; // This won't work anyway
```

## Advanced Localhost Features

### Custom Event Handling
```javascript
// Advanced event handling for localhost development
vapi.on('message', (message) => {
  console.log('Localhost Debug - Message:', message);
  
  switch (message.type) {
    case 'transcript':
      console.log('User said:', message.transcript);
      break;
    case 'function-call':
      console.log('Function called:', message.functionCall);
      break;
    case 'hang':
      console.log('Call ended');
      break;
  }
});
```

### Development Debugging
```javascript
// Enable verbose logging for localhost development
const vapi = new Vapi(publicKey, {
  debug: true, // Enable debug mode
  logLevel: 'verbose' // Detailed logging
});
```

## Next Steps for Your Localhost Setup

1. **Install the Web SDK**: `npm install @vapi-ai/web`
2. **Get your public key** from Vapi dashboard
3. **Create your assistants** using the scripts I provided earlier
4. **Set up environment variables** with your keys and assistant IDs
5. **Implement the useVapi hook** for state management
6. **Test each demo scenario** from localhost
7. **Deploy to production** when ready (same code works!)

Your localhost development environment will work exactly the same as production - Vapi is designed for this seamless experience!

