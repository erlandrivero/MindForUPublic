# Vapi Integration Solution for MindForU Interactive Demo

## Problem Analysis

Based on the research, the user is experiencing key errors when trying to make calls directly to Vapi through the API. The issue is likely:

1. **Wrong Package**: Using server-side API calls instead of the web SDK
2. **Authentication Issues**: Incorrect API key usage or missing public key
3. **Missing Dependencies**: Not using the proper @vapi-ai/web package
4. **Implementation Errors**: Incorrect method calls or event handling

## Solution: Proper Vapi Web SDK Integration

### 1. Installation and Setup

```bash
npm install @vapi-ai/web
```

### 2. Correct Implementation

```javascript
import Vapi from '@vapi-ai/web';

// Initialize with PUBLIC key (not private API key)
const vapi = new Vapi('your-public-key-here');

// State management for call controls
const [isCallActive, setIsCallActive] = useState(false);
const [isMuted, setIsMuted] = useState(false);
const [volume, setVolume] = useState(1);
const [callStatus, setCallStatus] = useState('idle');
```

### 3. Call Control Implementation

```javascript
// Start Call Function
const startCall = async (scenarioConfig) => {
  try {
    setCallStatus('connecting');
    
    // Use assistant ID or inline configuration
    await vapi.start(scenarioConfig.assistantId, {
      variableValues: {
        customerName: 'Demo User',
        companyName: 'MindForU',
        scenario: scenarioConfig.name
      }
    });
    
    setIsCallActive(true);
    setCallStatus('active');
  } catch (error) {
    console.error('Failed to start call:', error);
    setCallStatus('error');
  }
};

// End Call Function
const endCall = () => {
  try {
    vapi.stop();
    setIsCallActive(false);
    setCallStatus('idle');
    setIsMuted(false);
  } catch (error) {
    console.error('Failed to end call:', error);
  }
};

// Mute/Unmute Function
const toggleMute = () => {
  try {
    const newMutedState = !isMuted;
    vapi.setMuted(newMutedState);
    setIsMuted(newMutedState);
  } catch (error) {
    console.error('Failed to toggle mute:', error);
  }
};

// Volume Control (handled through audio context)
const handleVolumeChange = (newVolume) => {
  setVolume(newVolume);
  // Volume control implementation depends on audio context
  if (window.audioContext) {
    const gainNode = window.audioContext.createGain();
    gainNode.gain.value = newVolume;
  }
};
```

### 4. Event Listeners Setup

```javascript
useEffect(() => {
  // Call lifecycle events
  vapi.on('call-start', () => {
    console.log('Call started');
    setIsCallActive(true);
    setCallStatus('active');
  });

  vapi.on('call-end', () => {
    console.log('Call ended');
    setIsCallActive(false);
    setCallStatus('idle');
    setIsMuted(false);
  });

  // Speech events
  vapi.on('speech-start', () => {
    console.log('Assistant speaking');
  });

  vapi.on('speech-end', () => {
    console.log('Assistant finished speaking');
  });

  // Volume monitoring
  vapi.on('volume-level', (volumeLevel) => {
    console.log('Volume level:', volumeLevel);
    // Update volume visualization
  });

  // Message handling
  vapi.on('message', (message) => {
    console.log('Message received:', message);
    // Handle transcripts, function calls, etc.
  });

  // Error handling
  vapi.on('error', (error) => {
    console.error('Vapi error:', error);
    setCallStatus('error');
    setIsCallActive(false);
  });

  // Cleanup
  return () => {
    vapi.removeAllListeners();
  };
}, []);
```

## Common Issues and Solutions

### Issue 1: "Key Error" when making API calls

**Problem**: Using private API key instead of public key, or using server-side endpoints from client

**Solution**: 
- Use PUBLIC key with @vapi-ai/web package
- Never use private API keys in frontend code
- Use server-side SDK (@vapi-ai/server-sdk) only for backend operations

### Issue 2: Call not starting

**Problem**: Incorrect assistant configuration or missing required fields

**Solution**:
```javascript
// Option 1: Use existing assistant ID
vapi.start('assistant-id-here');

// Option 2: Inline configuration
vapi.start({
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI assistant for MindForU..."
      }
    ]
  },
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM" // Rachel voice
  },
  transcriber: {
    provider: "deepgram",
    model: "nova-2"
  }
});
```

### Issue 3: Mute/Volume controls not working

**Problem**: Calling methods before call is established or incorrect implementation

**Solution**:
```javascript
// Check if call is active before calling methods
const toggleMute = () => {
  if (isCallActive) {
    const newMutedState = !isMuted;
    vapi.setMuted(newMutedState);
    setIsMuted(newMutedState);
  }
};

// Volume control through Web Audio API
const setupVolumeControl = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const gainNode = audioContext.createGain();
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Store for volume control
        window.audioContext = audioContext;
        window.gainNode = gainNode;
      });
  }
};
```

## Environment Configuration

### 1. Environment Variables

```bash
# .env file
VITE_VAPI_PUBLIC_KEY=your-public-key-here
VITE_VAPI_PRIVATE_KEY=your-private-key-here  # Only for server-side
```

### 2. Vite Configuration

```javascript
// vite.config.js
export default {
  define: {
    'process.env.VITE_VAPI_PUBLIC_KEY': JSON.stringify(process.env.VITE_VAPI_PUBLIC_KEY)
  }
}
```

## Complete React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

const VapiDemo = ({ scenario }) => {
  const [vapi] = useState(() => new Vapi(process.env.VITE_VAPI_PUBLIC_KEY));
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [callStatus, setCallStatus] = useState('idle');

  useEffect(() => {
    // Setup event listeners
    vapi.on('call-start', () => {
      setIsCallActive(true);
      setCallStatus('active');
    });

    vapi.on('call-end', () => {
      setIsCallActive(false);
      setCallStatus('idle');
      setIsMuted(false);
    });

    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
      setCallStatus('error');
    });

    return () => vapi.removeAllListeners();
  }, [vapi]);

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      await vapi.start(scenario.assistantId, {
        variableValues: {
          customerName: 'Demo User',
          companyName: 'MindForU'
        }
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('error');
    }
  };

  const endCall = () => {
    vapi.stop();
  };

  const toggleMute = () => {
    if (isCallActive) {
      const newMutedState = !isMuted;
      vapi.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (window.gainNode) {
      window.gainNode.gain.value = newVolume;
    }
  };

  return (
    <div className="vapi-demo-controls">
      <div className="call-controls">
        <button 
          onClick={startCall} 
          disabled={isCallActive || callStatus === 'connecting'}
          className="start-call-btn"
        >
          {callStatus === 'connecting' ? 'Connecting...' : 'Start Call'}
        </button>
        
        <button 
          onClick={endCall} 
          disabled={!isCallActive}
          className="end-call-btn"
        >
          End Call
        </button>
        
        <button 
          onClick={toggleMute} 
          disabled={!isCallActive}
          className={`mute-btn ${isMuted ? 'muted' : ''}`}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
      
      <div className="volume-control">
        <label>Volume</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          disabled={!isCallActive}
        />
      </div>
      
      <div className="call-status">
        Status: {callStatus}
      </div>
    </div>
  );
};

export default VapiDemo;
```

This implementation should resolve all the key errors and provide working call controls for the MindForU Interactive Demo.

