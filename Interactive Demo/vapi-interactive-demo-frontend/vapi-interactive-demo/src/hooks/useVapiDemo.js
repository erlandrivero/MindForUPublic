import { useState, useEffect, useCallback } from 'react'

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production
  : 'http://localhost:5000' // Use full URL in development

export const useVapiDemo = () => {
  const [scenarios, setScenarios] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [conversationLog, setConversationLog] = useState([])
  const [metrics, setMetrics] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch available scenarios
  const fetchScenarios = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/scenarios`)
      if (!response.ok) throw new Error('Failed to fetch scenarios')
      const data = await response.json()
      setScenarios(data.scenarios)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Start a new demo session
  const startDemo = useCallback(async (scenarioId, userInfo) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/api/demo/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario_id: scenarioId,
          user_info: userInfo
        })
      })
      
      if (!response.ok) throw new Error('Failed to start demo')
      
      const data = await response.json()
      setCurrentSession(data)
      setConversationLog([])
      setMetrics({})
      
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  

  // Start a voice call using Vapi Web SDK
  const startCall = useCallback(async (assistantId) => {
    try {
      setLoading(true)
      if (!vapiInstance) {
        throw new Error('Vapi SDK not initialized');
      }
      if (!assistantId) {
        throw new Error('No assistantId provided');
      }
      console.log('[DEBUG] Calling vapi.start with assistantId:', assistantId);
      await vapiInstance.start(assistantId);
      // Update session status
      if (currentSession) {
        setCurrentSession(prev => ({
          ...prev,
          call_active: true,
          status: 'call_active'
        }))
      }
      console.log('[DEBUG] Call started successfully');
    } catch (err) {
      setError(err.message)
      console.error('[DEBUG] Failed to start call:', err);
      alert('Failed to start call: ' + err.message);
      throw err
    } finally {
      setLoading(false)
    }
  }, [currentSession])

  // End a voice call
  const endCall = useCallback(async (sessionId) => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/api/demo/${sessionId}/call/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) throw new Error('Failed to end call')
      
      const data = await response.json()
      
      // Update session status
      if (currentSession) {
        setCurrentSession(prev => ({
          ...prev,
          call_active: false,
          status: 'completed',
          progress: 100
        }))
      }
      
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [currentSession])

  // Continue conversation
  const continueConversation = useCallback(async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/demo/${sessionId}/conversation/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) throw new Error('Failed to continue conversation')
      
      const data = await response.json()
      
      if (data.message) {
        setConversationLog(prev => [...prev, data.message])
      }
      
      // Update session progress
      if (currentSession && data.progress !== undefined) {
        setCurrentSession(prev => ({
          ...prev,
          progress: data.progress
        }))
      }
      
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [currentSession])

  // Get demo status
  const getDemoStatus = useCallback(async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/demo/${sessionId}/status`)
      if (!response.ok) throw new Error('Failed to get demo status')
      
      const data = await response.json()
      
      setCurrentSession(data.session)
      setConversationLog(data.conversation)
      setMetrics(data.metrics)
      
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Get live metrics
  const getLiveMetrics = useCallback(async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/demo/${sessionId}/metrics`)
      if (!response.ok) throw new Error('Failed to get metrics')
      
      const data = await response.json()
      setMetrics(data.metrics)
      
      return data.metrics
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Capture lead information
  const captureLead = useCallback(async (sessionId, contactInfo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lead/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          contact_info: contactInfo
        })
      })
      
      if (!response.ok) throw new Error('Failed to capture lead')
      
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Auto-refresh metrics during active calls
  useEffect(() => {
    let interval
    
    if (currentSession?.call_active && currentSession?.session_id) {
      interval = setInterval(() => {
        getLiveMetrics(currentSession.session_id)
      }, 2000) // Update every 2 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentSession?.call_active, currentSession?.session_id, getLiveMetrics])

  // Load scenarios on mount
  useEffect(() => {
    fetchScenarios()
  }, [fetchScenarios])

  return {
    // State
    scenarios,
    currentSession,
    conversationLog,
    metrics,
    loading,
    error,
    
    // Actions
    startDemo,
    startCall,
    endCall,
    continueConversation,
    getDemoStatus,
    getLiveMetrics,
    captureLead,
    fetchScenarios
  }
}

