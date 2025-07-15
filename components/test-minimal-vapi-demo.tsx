"use client";
import React from 'react';
import MinimalVapiDemo from './MinimalVapiDemo';

const TestMinimalVapiDemo: React.FC = () => {
  // Replace 'YOUR_ASSISTANT_ID' with an actual assistant ID for testing
  const testAssistantId = process.env.NEXT_PUBLIC_VAPI_TEST_ASSISTANT_ID || 'YOUR_ASSISTANT_ID';

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Minimal Vapi Demo Test</h1>
      <p>This page is for testing the MinimalVapiDemo component in isolation.</p>
      <MinimalVapiDemo assistantId={testAssistantId} />
    </div>
  );
};

export default TestMinimalVapiDemo;
