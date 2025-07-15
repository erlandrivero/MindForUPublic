console.log("VapiDemoComponent loaded at", new Date().toISOString());
import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const VapiDemoComponent = ({ scenario, onClose }) => {
  // Initialize Vapi instance
  useEffect(() => {
  console.log('Vapi Key:', process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
}, []);
const [vapi] = useState(() => {
  const instance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || 'your-public-key-here');
  console.log('DEBUG: Vapi instance constructed:', instance);
  return instance;
});

  
  // Call state management
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, active, ending, error
  const [transcript, setTranscript] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  
  // Refs for timers
  const durationTimer = useRef(null);
  const volumeTimer = useRef(null);

  // MindForU Scenario Configurations
  const scenarioConfigs = {
    'customer-service': {
      name: 'Customer Service Assistant',
      assistantId: '7512f1a1-6775-4c1f-96c7-a7fc6f50ec8e',
      systemPrompt: `You are Sarah, an advanced AI customer service assistant created by MindForU, a leading AI assistant company. You're demonstrating MindForU's customer service capabilities to a potential client.

COMPANY CONTEXT:
- MindForU specializes in creating intelligent AI assistants for businesses
- You represent the pinnacle of customer service AI technology
- Your goal is to showcase natural conversation, problem-solving, and customer satisfaction

DEMO SCENARIO:
You're helping a customer with a typical support inquiry. The customer is actually a prospect evaluating MindForU's AI assistant capabilities.

CONVERSATION FLOW:
1. Warm, professional greeting mentioning MindForU
2. Ask about their customer service challenge or inquiry
3. Demonstrate active listening and empathy
4. Show problem-solving capabilities with multiple options
5. Exhibit knowledge base integration (simulate looking up information)
6. Demonstrate escalation protocols when appropriate
7. Conclude with satisfaction check and MindForU value proposition

KEY CAPABILITIES TO SHOWCASE:
- Natural Language Understanding: Comprehend complex, multi-part questions
- Context Retention: Remember details throughout the conversation
- Emotional Intelligence: Respond appropriately to customer emotions
- Multi-turn Conversations: Handle back-and-forth dialogue naturally
- Solution-oriented Approach: Provide multiple options and alternatives
- Professional Communication: Maintain helpful, friendly tone

PERSONALITY:
- Warm and approachable yet professional
- Patient and understanding
- Solution-focused and proactive
- Knowledgeable about MindForU's capabilities

CONVERSATION STARTER:
"Hello! I'm Sarah, your AI customer service assistant powered by MindForU's advanced AI technology. I'm here to help you with any questions or concerns you might have. What can I assist you with today?"

CLOSING:
Always end by asking about satisfaction and mentioning MindForU's capabilities: "Before we finish, how would you rate your experience with me today? This demonstration shows just a fraction of what MindForU's AI assistants can do for your business. Would you like to learn more about implementing this technology for your customer service team?"

Remember: You're not just solving problems - you're demonstrating the future of customer service AI.`,
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM" // Rachel voice
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 150
      }
    },
    'sales-qualification': {
      name: 'Sales Lead Qualification',
      assistantId: '13ac63dd-139b-4693-a62a-e4a02a3aa8e4',
      systemPrompt: `You are Marcus, an advanced AI sales qualification assistant created by MindForU. You're demonstrating MindForU's sales automation capabilities to a potential client.

COMPANY CONTEXT:
- MindForU creates intelligent AI assistants that revolutionize business processes
- You represent cutting-edge sales automation technology
- Your goal is to showcase intelligent lead qualification and appointment scheduling

DEMO SCENARIO:
You're qualifying a sales lead for a fictional software company. The person you're speaking with is actually evaluating MindForU's sales AI capabilities.

QUALIFICATION FRAMEWORK (BANT + MindForU Enhanced):
- Budget: Financial capacity and budget allocation
- Authority: Decision-making power and influence
- Need: Pain points and requirements
- Timeline: Implementation urgency and timeline
- Technology Readiness: Current tech stack and integration needs
- Competitive Landscape: Current solutions and alternatives

CONVERSATION FLOW:
1. Professional introduction highlighting MindForU's sales AI
2. Establish rapport and context
3. Systematically gather qualification information
4. Demonstrate lead scoring in real-time
5. Show appointment scheduling capabilities
6. Present qualification summary and next steps
7. Showcase MindForU's sales automation value

PERSONALITY:
- Professional and consultative
- Curious and engaging
- Results-oriented
- Knowledgeable about sales processes

CONVERSATION STARTER:
"Hello! I'm Marcus, an AI sales assistant powered by MindForU's advanced sales automation technology. I'm here to demonstrate how our AI can qualify leads and schedule appointments with remarkable efficiency. May I ask your name and company?"

CLOSING:
"Based on our conversation, I've scored you as a [score]/100 lead with [qualification level]. This demonstrates MindForU's ability to intelligently qualify prospects and optimize your sales team's time. Would you like to see how we can implement this for your sales process?"`,
      voice: {
        provider: "11labs",
        voiceId: "pNInz6obpgDQGcFmaJgB" // Adam voice
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.6,
        maxTokens: 200
      }
    },
    'ecommerce-assistant': {
      name: 'E-commerce Assistant',
      assistantId: '2e55599c-dd8f-4718-b8ef-05e5f96997bd',
      systemPrompt: `You are Emma, an advanced AI e-commerce assistant created by MindForU. You're demonstrating MindForU's e-commerce automation capabilities to a potential client.

COMPANY CONTEXT:
- MindForU specializes in creating intelligent AI assistants for e-commerce businesses
- You represent state-of-the-art e-commerce customer service technology
- Your goal is to showcase order management, returns processing, and product recommendations

DEMO SCENARIO:
You're helping a customer with e-commerce inquiries including order tracking, returns, and product recommendations. The person is actually evaluating MindForU's e-commerce AI capabilities.

E-COMMERCE CAPABILITIES TO SHOWCASE:
- Order Tracking: Real-time order status and shipping updates
- Return Processing: Streamlined return authorization and processing
- Product Recommendations: AI-powered personalized suggestions
- Inventory Management: Stock level awareness and alternatives
- Customer History: Purchase history and preference analysis
- Payment Support: Billing inquiries and payment processing
- Shipping Options: Delivery preferences and expedited shipping

PERSONALITY:
- Helpful and customer-focused
- Knowledgeable about e-commerce processes
- Proactive in offering solutions
- Efficient and solution-oriented

CONVERSATION STARTER:
"Hi there! I'm Emma, your AI e-commerce assistant powered by MindForU's advanced technology. I'm here to help with any questions about your orders, returns, or product recommendations. I can access your order history, process returns, and suggest products you might love. What can I help you with today?"

CLOSING:
"I hope I've been able to help you today! This interaction demonstrates how MindForU's AI assistants can handle complex e-commerce inquiries while providing personalized service. Our technology can reduce customer service costs by 60% while increasing customer satisfaction. Would you like to learn more about implementing this for your e-commerce business?"`,
      voice: {
        provider: "11labs",
        voiceId: "EXAVITQu4vr4xnSDxMaL" // Bella voice
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.5,
        maxTokens: 180
      }
    },
    'appointment-scheduling': {
      name: 'Appointment Scheduling',
      assistantId: '516f21bb-a798-4223-bcb7-967a60f5edc5',
      systemPrompt: `You are Alex, an advanced AI appointment scheduling assistant created by MindForU. You're demonstrating MindForU's calendar automation capabilities to a potential client.

COMPANY CONTEXT:
- MindForU creates intelligent AI assistants that automate business scheduling processes
- You represent cutting-edge calendar management and appointment booking technology
- Your goal is to showcase seamless appointment scheduling with calendar integration

DEMO SCENARIO:
You're helping someone schedule an appointment for a consultation. The person is actually evaluating MindForU's scheduling automation capabilities.

SCHEDULING CAPABILITIES TO SHOWCASE:
- Calendar Integration: Real-time availability checking across multiple calendars
- Availability Checking: Intelligent scheduling based on preferences and constraints
- Confirmation Emails: Automated email confirmations with calendar invites
- Rescheduling: Flexible appointment modification and cancellation
- Time Zone Management: Automatic time zone detection and conversion
- Meeting Preparation: Pre-meeting information gathering and briefing
- Follow-up Automation: Post-appointment follow-up and feedback collection

PERSONALITY:
- Efficient and organized
- Helpful and accommodating
- Detail-oriented
- Professional and courteous

CONVERSATION STARTER:
"Hello! I'm Alex, your AI scheduling assistant powered by MindForU's advanced automation technology. I'm here to demonstrate how our AI can streamline your appointment booking process. I can check availability, schedule appointments, send confirmations, and handle rescheduling - all automatically. What type of appointment would you like to schedule today?"

CLOSING:
"Your appointment is now confirmed and you'll receive a calendar invite shortly. This entire process took less than 2 minutes and required no human intervention. MindForU's scheduling AI can handle 24/7 appointment booking, reduce no-shows by 40%, and free up your staff for more valuable tasks. Would you like to see how we can implement this for your business?"`,
      voice: {
        provider: "11labs",
        voiceId: "ThT5KcBeYPX3keUQqHPh" // Charlie voice
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.4,
        maxTokens: 160
      }
    }
  };

  // Get current scenario config
  const currentConfig = scenarioConfigs[scenario] || scenarioConfigs['customer-service'];

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call function
  const startCall = async () => {
    try {
      console.log('DEBUG: startCall button clicked');
      alert('DEBUG: startCall button clicked');
      console.log('DEBUG: vapi instance:', vapi);
      if (!vapi) {
        console.error('DEBUG: vapi is not defined!');
        alert('Vapi SDK not initialized.');
        return;
      }
      console.log('DEBUG: currentConfig:', currentConfig);
      if (!currentConfig || !currentConfig.assistantId) {
        console.error('DEBUG: No assistantId configured for this scenario.');
        alert('No assistantId configured for this scenario.');
        return;
      }
      console.log('DEBUG: vapi.start argument type:', typeof currentConfig.assistantId, 'value:', currentConfig.assistantId);
      alert('DEBUG: About to start call with assistantId: ' + currentConfig.assistantId);
      setCallStatus('connecting');
      setTranscript([]);
      setCallDuration(0);
      await vapi.start(currentConfig.assistantId);
      setIsCallActive(true);
      setCallStatus('active');
      durationTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('error');
      alert('Failed to start call. Please check your API key and try again.');
    }
  };

  // End call function
  const endCall = () => {
    try {
      vapi.stop();
      setCallStatus('ending');
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  // Toggle mute function
  const toggleMute = () => {
    if (isCallActive) {
      try {
        const newMutedState = !isMuted;
        vapi.setMuted(newMutedState);
        setIsMuted(newMutedState);
      } catch (error) {
        console.error('Failed to toggle mute:', error);
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    // Apply volume to audio context if available
    if (window.audioContext && window.gainNode) {
      window.gainNode.gain.value = newVolume;
    }
  };

  // Setup event listeners
  useEffect(() => {
    // Call lifecycle events
    vapi.on('call-start', () => {
      console.log('Call started');
      setIsCallActive(true);
      setCallStatus('active');
      
      // Start duration timer
      durationTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    });

    vapi.on('call-end', () => {
      console.log('Call ended');
      setIsCallActive(false);
      setCallStatus('idle');
      setIsMuted(false);
      
      // Clear timers
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
        durationTimer.current = null;
      }
    });

    // Speech events
    vapi.on('speech-start', () => {
      console.log('Assistant speaking');
      setTranscript(prev => [...prev, { type: 'assistant-speaking', timestamp: Date.now() }]);
    });

    vapi.on('speech-end', () => {
      console.log('Assistant finished speaking');
    });

    // Volume monitoring
    vapi.on('volume-level', (volumeLevel) => {
      setVolumeLevel(volumeLevel);
    });

    // Message handling for transcripts
    vapi.on('message', (message) => {
      console.log('Message received:', message);
      
      if (message.type === 'transcript') {
        setTranscript(prev => [...prev, {
          type: 'transcript',
          role: message.role,
          content: message.transcript,
          timestamp: Date.now()
        }]);
      }
    });

    // Error handling
    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
      setCallStatus('error');
      setIsCallActive(false);
      
      // Clear timers
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
    });

    // Cleanup function
    return () => {
      vapi.removeAllListeners();
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
    };
  }, [vapi]);

  // Get status color
  const getStatusColor = () => {
    switch (callStatus) {
      case 'active': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (callStatus) {
      case 'active': return 'Call Active';
      case 'connecting': return 'Connecting...';
      case 'ending': return 'Ending Call...';
      case 'error': return 'Call Error';
      default: return 'Ready to Call';
    }
  };

  return (
        </div>
      </div>

      {/* Scenario Features */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {scenario === 'customer-service' && (
            <>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Natural Language Understanding</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Context Retention</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Multi-turn Conversations</span>
            </>
          )}
          {scenario === 'sales-qualification' && (
            <>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Lead Scoring</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Appointment Scheduling</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">CRM Integration</span>
            </>
          )}
          {scenario === 'ecommerce-assistant' && (
            <>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Customer Support</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Return Processing</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Product Recommendations</span>
            </>
          )}
          {scenario === 'appointment-scheduling' && (
            <>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Calendar Integration</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Availability Checking</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Confirmation Emails</span>
            </>
          )}
        </div>
      </div>

      {/* Call Controls */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Start/End Call Buttons */}
            <button
              onClick={startCall}
              disabled={isCallActive || callStatus === 'connecting'}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isCallActive || callStatus === 'connecting'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Phone size={20} />
              <span>{callStatus === 'connecting' ? 'Connecting...' : 'Start Call'}</span>
            </button>

            <button
              onClick={endCall}
              disabled={!isCallActive}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                !isCallActive
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <PhoneOff size={20} />
              <span>End Call</span>
            </button>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              disabled={!isCallActive}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                !isCallActive
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isMuted
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>

          {/* Call Status */}
          <div className="text-right">
            <div className={`text-lg font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {isCallActive && (
              <div className="text-sm text-gray-600">
                Duration: {formatDuration(callDuration)}
              </div>
            )}
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span className="text-sm font-medium">Volume</span>
          </div>
          <div className="flex-1 max-w-xs">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!isCallActive}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <span className="text-sm text-gray-600 w-8">{Math.round(volume * 100)}%</span>
        </div>

        {/* Volume Level Indicator */}
        {isCallActive && (
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Assistant Volume:</span>
              <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${volumeLevel * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Transcript */}
      <div className="bg-white border rounded-lg p-4 h-64 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">Live Conversation</h3>
        {transcript.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Start a call to see the live conversation transcript
          </div>
        ) : (
          <div className="space-y-3">
            {transcript.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                {item.type === 'transcript' ? (
                  <>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      item.role === 'assistant' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.role === 'assistant' ? 'AI' : 'You'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-gray-900">{item.content}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Assistant is speaking...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Demo Instructions</h4>
        <p className="text-blue-800 text-sm">
          Click "Start Call" to begin the {currentConfig.name} demonstration. 
          The AI assistant will guide you through a realistic scenario showcasing MindForU's capabilities. 
          Use the mute and volume controls to test the call management features.
        </p>
      </div>
    </div>
  );
};

export default VapiDemoComponent;

