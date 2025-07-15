import React, { useState } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Users, 
  ShoppingCart, 
  Calendar,
  Headphones,
  Clock,
  TrendingUp,
  CheckCircle,
  Play
} from 'lucide-react';

const ImprovedDemoPage = () => {
  const [activeDemo, setActiveDemo] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const scenarioConfigs = {
    'customer-service': {
      id: 'customer-service',
      title: 'Customer Service Assistant',
      subtitle: 'Sarah - Your AI Support Specialist',
      duration: '3-5 minutes',
      description: 'Experience intelligent customer support with natural conversation flow and perfect context retention',
      icon: Headphones,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'Natural Language Understanding',
        'Context Retention',
        'Multi-turn Conversations'
      ],
      metrics: {
        efficiency: '80% faster response',
        satisfaction: '4.8/5 rating',
        cost: '60% cost reduction'
      },
      assistantId: 'asst_customer_service_id'
    },
    'sales-qualification': {
      id: 'sales-qualification',
      title: 'Sales Lead Qualification',
      subtitle: 'Marcus - Your AI Sales Assistant',
      duration: '4-6 minutes',
      description: 'See how AI qualifies prospects and schedules appointments with 300% higher conversion rates',
      icon: Users,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: [
        'Lead Scoring & BANT Qualification',
        'Appointment Scheduling',
        'Objection Handling'
      ],
      metrics: {
        conversion: '300% higher leads',
        speed: '5x faster qualification',
        accuracy: '95% qualification accuracy'
      },
      assistantId: 'asst_sales_qualification_id'
    },
    'ecommerce': {
      id: 'ecommerce',
      title: 'E-Commerce Assistant',
      subtitle: 'Emma - Your AI Shopping Assistant',
      duration: '3-4 minutes',
      description: 'Handle customer inquiries, process returns, and provide personalized recommendations instantly',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        'Order Tracking',
        'Product Recommendations',
        'Return Processing'
      ],
      metrics: {
        satisfaction: '35% higher satisfaction',
        sales: '25% increase in sales',
        support: '70% fewer tickets'
      },
      assistantId: 'asst_ecommerce_id'
    },
    'appointment-scheduling': {
      id: 'appointment-scheduling',
      title: 'Appointment Scheduling',
      subtitle: 'Alex - Your AI Scheduling Assistant',
      duration: '2-3 minutes',
      description: 'Automate booking with smart calendar integration and 40% reduction in no-shows',
      icon: Calendar,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      features: [
        'Calendar Integration',
        'Availability Checking',
        'Confirmation Emails'
      ],
      metrics: {
        noShows: '40% fewer no-shows',
        efficiency: '60% time savings',
        accuracy: '99% booking accuracy'
      },
      assistantId: 'asst_appointment_scheduling_id'
    }
  };

  const handleStartDemo = async (scenarioId) => {
    setActiveDemo(scenarioId);
    setCallStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setCallStatus('active');
    }, 2000);
    
    // Here you would integrate with your Vapi implementation
    // const config = scenarioConfigs[scenarioId];
    // await vapi.start(config.assistantId);
  };

  const handleEndCall = () => {
    setCallStatus('idle');
    setActiveDemo(null);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const DemoCard = ({ config }) => {
    const IconComponent = config.icon;
    const isActive = activeDemo === config.id;
    
    return (
      <div className={`
        relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg
        ${isActive ? `${config.lightColor} ${config.borderColor} shadow-lg` : 'bg-white border-gray-200 hover:border-gray-300'}
      `}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${config.color} text-white`}>
              <IconComponent size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
              <p className="text-sm text-gray-600">{config.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">{config.duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 leading-relaxed">{config.description}</p>

        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {config.features.map((feature, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp size={16} className="text-green-500 mr-2" />
            <span className="text-sm font-semibold text-gray-700">Business Impact</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(config.metrics).map(([key, value]) => (
              <div key={key} className="flex items-center text-sm text-gray-600">
                <CheckCircle size={12} className="text-green-500 mr-2" />
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleStartDemo(config.id)}
          disabled={activeDemo && activeDemo !== config.id}
          className={`
            w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200
            ${isActive 
              ? `${config.color} text-white` 
              : activeDemo 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : `border-2 ${config.borderColor} ${config.color.replace('bg-', 'text-')} hover:${config.color} hover:text-white`
            }
          `}
        >
          {isActive ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Demo Active</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Play size={16} />
              <span>Start Demo</span>
            </div>
          )}
        </button>
      </div>
    );
  };

  const CallControls = () => {
    if (!activeDemo || callStatus === 'idle') return null;

    const activeConfig = scenarioConfigs[activeDemo];

    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 min-w-96">
          {/* Status Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${activeConfig.color} text-white`}>
                <activeConfig.icon size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{activeConfig.title}</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    callStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                    callStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm text-gray-600 capitalize">{callStatus}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleEndCall}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <PhoneOff size={20} />
            </button>
          </div>

          {/* Call Controls */}
          {callStatus === 'active' && (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-lg transition-colors ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              <div className="flex items-center space-x-3 flex-1">
                <Volume2 size={20} className="text-gray-600" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 w-8">{Math.round(volume * 100)}</span>
              </div>
            </div>
          )}

          {/* Connection Status */}
          {callStatus === 'connecting' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Connecting to AI assistant...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="p-2 bg-teal-500 text-white rounded-lg">
                <Phone size={24} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">MindForU Interactive AI Assistant Demo</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose a scenario and explore how MindForU's AI assistants can transform your business operations with intelligent voice interactions.
            </p>
            <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
              <CheckCircle size={16} />
              <span>Powered by Advanced AI Technology</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.values(scenarioConfigs).map((config) => (
            <DemoCard key={config.id} config={config} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <TrendingUp size={16} />
                <span className="text-sm">Reduce costs by 60%</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle size={16} />
                <span className="text-sm">Increase satisfaction by 35%</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock size={16} />
                <span className="text-sm">5x faster processing</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Powered by MindForU | Contact: demo@mindfor.com | 
              <span className="font-medium"> Experience the future of business AI today</span>
            </p>
          </div>
        </div>
      </div>

      {/* Call Controls Overlay */}
      <CallControls />
    </div>
  );
};

export default ImprovedDemoPage;

