import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneCall, 
  MessageSquare, 
  Users, 
  ShoppingCart, 
  Calendar,
  Play,
  Volume2,
  Settings,
  BarChart3,
  CheckCircle,
  Clock,
  Zap,
  Loader2
} from 'lucide-react'
import { useVapiDemo } from './hooks/useVapiDemo'
import { useVapiClient } from './hooks/useVapiClient'
import VapiMiniButtons from './components/VapiMiniButtons.jsx';
import './App.css'

function App() {
  const [currentDemo, setCurrentDemo] = useState('welcome')
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [userInfo, setUserInfo] = useState({
    name: '',
    company: '',
    useCase: '',
    industry: ''
  })

  const {
    scenarios,
    currentSession,
    conversationLog,
    metrics,
    loading,
    error,
    startDemo,
    startCall,
    endCall,
    continueConversation
  } = useVapiDemo()

  // Timer effect for call duration
  useEffect(() => {
    let interval
    if (currentSession?.call_active) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
    }
    return () => clearInterval(interval)
  }, [currentSession?.call_active])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartDemo = async (scenarioId) => {
    try {
      await startDemo(scenarioId, userInfo)
      setCurrentDemo('demo')
    } catch (err) {
      console.error('Failed to start demo:', err)
    }
  }

  const handleStartCall = async () => {
    if (!currentSession?.session_id) return
    
    try {
      await startCall(currentSession.session_id)
    } catch (err) {
      console.error('Failed to start call:', err)
    }
  }

  const handleEndCall = async () => {
    if (!currentSession?.session_id) return
    
    try {
      await endCall(currentSession.session_id)
    } catch (err) {
      console.error('Failed to end call:', err)
    }
  }

  const handleContinueConversation = async () => {
    if (!currentSession?.session_id) return
    
    try {
      await continueConversation(currentSession.session_id)
    } catch (err) {
      console.error('Failed to continue conversation:', err)
    }
  }

  const getScenarioIcon = (scenarioId) => {
    const icons = {
      'customer-service': <MessageSquare className="w-6 h-6" />,
      'sales-qualification': <Users className="w-6 h-6" />,
      'ecommerce-support': <ShoppingCart className="w-6 h-6" />,
      'appointment-booking': <Calendar className="w-6 h-6" />
    }
    return icons[scenarioId] || <MessageSquare className="w-6 h-6" />
  }

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-full">
              <Mic className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Experience Vapi Voice AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how advanced voice AI can transform your business with natural conversations, 
            intelligent responses, and seamless integrations. Try our interactive demos below.
          </p>
        </div>

        {/* Error Display (Backend) */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}
        {/* Error Display (Vapi SDK) */}
        {sdkError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-red-800">Vapi SDK Error: {sdkError.toString()}</p>
          </div>
        )}

        {/* User Information Form */}
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Personalize Your Demo Experience</CardTitle>
            <CardDescription>
              Tell us about your business to see the most relevant examples
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={userInfo.company}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Your Company"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={userInfo.industry}
                onChange={(e) => setUserInfo(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., Healthcare, E-commerce, SaaS"
              />
            </div>
            <div>
              <Label htmlFor="useCase">Primary Use Case</Label>
              <Textarea
                id="useCase"
                value={userInfo.useCase}
                onChange={(e) => setUserInfo(prev => ({ ...prev, useCase: e.target.value }))}
                placeholder="What would you like to automate or improve with voice AI?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Demo Scenarios */}
        {loading && scenarios.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading demo scenarios...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      {getScenarioIcon(scenario.id)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{scenario.title}</CardTitle>
                      <Badge variant="secondary">{scenario.estimated_time}</Badge>
                    </div>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Key Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {scenario.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleStartDemo(scenario.id)}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Start Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">
                Sub-second response times with advanced AI processing
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">99.9% Accuracy</h3>
              <p className="text-gray-600 text-sm">
                Industry-leading speech recognition and natural language understanding
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Settings className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Easy Integration</h3>
              <p className="text-gray-600 text-sm">
                Seamless integration with your existing systems and workflows
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const DemoScreen = () => {
    // Vapi SDK-powered state and controls
    const {
      callActive: sdkCallActive,
      transcript: sdkTranscript,
      volume: sdkVolume,
      error: sdkError,
      isMuted: sdkIsMuted,
      startCall: sdkStartCall,
      stopCall: sdkStopCall,
      setMicMuted: sdkSetMicMuted,
      sendMessage: sdkSendMessage,
    } = useVapiClient();
    const scenario = scenarios.find(s => s.id === currentSession?.scenario_id);
    const assistantId = scenario?.assistantId || scenario?.assistant_id || 'your-assistant-id';

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentDemo('welcome')}
              >
                ← Back to Scenarios
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{scenario?.title}</h1>
                <p className="text-gray-600">{scenario?.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Demo Progress</div>
              <Progress value={currentSession?.progress || 0} className="w-32" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Call Interface */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Voice Interaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Call Controls (Backend) */}
                  <div className="flex items-center gap-4 mt-6">
  <VapiMiniButtons assistantId={scenario.assistantId || scenario.assistant_id} />
</div>

                  {/* Conversation Log */}
                  <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                    <h3 className="font-medium mb-3">Conversation Transcript</h3>
                    {conversationLog.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Start the demo call to see the conversation transcript
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {conversationLog.map((entry, index) => (
                          <div key={index} className={`flex ${entry.speaker === 'User' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs p-3 rounded-lg ${
                              entry.speaker === 'User' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <div className="text-xs opacity-75 mb-1">{entry.speaker}</div>
                              <div>{entry.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demo Information */}
            <div className="space-y-6">
              {/* Scenario Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Demo Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Features Demonstrated:</h4>
                    <div className="space-y-2">
                      {scenario?.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Estimated Duration:</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">{scenario?.estimated_time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Live Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.accuracy ? `${metrics.accuracy}%` : '98.5%'}
                      </div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.response_time ? `${metrics.response_time}s` : '0.3s'}
                      </div>
                      <div className="text-xs text-gray-600">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {metrics.intent_recognition ? `${metrics.intent_recognition}%` : '95%'}
                      </div>
                      <div className="text-xs text-gray-600">Intent Recognition</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {metrics.user_satisfaction ? `${metrics.user_satisfaction}/5` : '4.8/5'}
                      </div>
                      <div className="text-xs text-gray-600">User Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Ready to Get Started?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">
                    Schedule Implementation Call
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download Technical Specs
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Pricing Plans
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {currentDemo === 'welcome' ? <WelcomeScreen /> : <DemoScreen />}
    </div>
  )
}

export default App

