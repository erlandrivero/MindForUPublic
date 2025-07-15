// React/JavaScript Solution for Creating Vapi Assistants
// Run this script with Node.js to create all 4 MindForU assistants

const fs = require('fs');

const VAPI_API_KEY = 'your-vapi-api-key-here'; // Replace with your actual API key

const assistantConfigs = [
  {
    file: 'mindfor_customer_service_assistant.json',
    name: 'Customer Service Assistant',
    key: 'customer-service'
  },
  {
    file: 'mindfor_sales_lead_qualification.json', 
    name: 'Sales Lead Qualification',
    key: 'sales-qualification'
  },
  {
    file: 'mindfor_ecommerce_assistant.json',
    name: 'E-commerce Assistant', 
    key: 'ecommerce'
  },
  {
    file: 'mindfor_appointment_scheduling.json',
    name: 'Appointment Scheduling',
    key: 'appointment-scheduling'
  }
];

async function createVapiAssistant(config, name) {
  try {
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return { success: true, id: result.id, name };
  } catch (error) {
    return { success: false, error: error.message, name };
  }
}

async function createAllAssistants() {
  console.log('🚀 Creating MindForU Vapi Assistants...\n');
  
  const results = [];
  
  for (const { file, name, key } of assistantConfigs) {
    try {
      console.log(`📝 Creating ${name}...`);
      
      // Read the JSON configuration
      const configData = fs.readFileSync(file, 'utf8');
      const config = JSON.parse(configData);
      
      // Create the assistant
      const result = await createVapiAssistant(config, name);
      
      if (result.success) {
        console.log(`✅ ${name} created successfully!`);
        console.log(`   Assistant ID: ${result.id}\n`);
        results.push({ name, key, id: result.id });
      } else {
        console.log(`❌ Failed to create ${name}: ${result.error}\n`);
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Error processing ${name}: ${error.message}\n`);
    }
  }
  
  if (results.length > 0) {
    console.log('🎉 Assistant Creation Complete!\n');
    console.log('📋 Your Assistant IDs:');
    console.log('========================');
    results.forEach(({ name, id }) => {
      console.log(`${name}: ${id}`);
    });
    
    console.log('\n🔧 React Component Configuration:');
    console.log('==================================');
    console.log('Copy this into your React component:\n');
    
    console.log('const scenarioConfigs = {');
    results.forEach(({ key, id }) => {
      console.log(`  '${key}': {`);
      console.log(`    assistantId: '${id}',`);
      console.log(`    // ... other config`);
      console.log(`  },`);
    });
    console.log('};');
    
    // Generate a complete React configuration file
    generateReactConfig(results);
  } else {
    console.log('❌ No assistants were created successfully.');
    console.log('Please check your API key and JSON files.');
  }
}

function generateReactConfig(results) {
  const configTemplate = `// Generated Vapi Assistant Configuration for MindForU Demo
// Copy this into your React component

export const vapiAssistantConfig = {
${results.map(({ key, id }) => {
  const scenarios = {
    'customer-service': {
      name: 'Customer Service Assistant',
      duration: '3-5 minutes',
      description: 'Experience intelligent customer support with natural conversation flow',
      features: ['Natural Language Understanding', 'Context Retention', 'Multi-turn Conversations']
    },
    'sales-qualification': {
      name: 'Sales Lead Qualification', 
      duration: '4-6 minutes',
      description: 'See how AI can qualify leads and schedule appointments automatically',
      features: ['Lead Scoring', 'Appointment Scheduling', 'CRM Integration']
    },
    'ecommerce': {
      name: 'E-commerce Assistant',
      duration: '3-4 minutes', 
      description: 'Handle customer inquiries, returns, and product recommendations',
      features: ['Order Tracking', 'Return Processing', 'Product Recommendations']
    },
    'appointment-scheduling': {
      name: 'Appointment Scheduling',
      duration: '2-3 minutes',
      description: 'Automate appointment booking with calendar integration',
      features: ['Calendar Integration', 'Availability Checking', 'Confirmation Emails']
    }
  };
  
  const scenario = scenarios[key];
  return `  '${key}': {
    assistantId: '${id}',
    name: '${scenario.name}',
    duration: '${scenario.duration}',
    description: '${scenario.description}',
    features: ${JSON.stringify(scenario.features, null, 6).replace(/\n/g, '\n    ')}
  }`;
}).join(',\n')}
};

// Usage in your React component:
// import { vapiAssistantConfig } from './vapiConfig';
// 
// const handleStartDemo = (scenarioKey) => {
//   const config = vapiAssistantConfig[scenarioKey];
//   vapi.start(config.assistantId);
// };
`;

  fs.writeFileSync('vapiConfig.js', configTemplate);
  console.log('\n📁 Generated vapiConfig.js file with complete configuration!');
  console.log('   Import this file into your React component.');
}

// Run the script
if (require.main === module) {
  // Check if fetch is available (Node.js 18+)
  if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or you can install node-fetch:');
    console.log('   npm install node-fetch');
    console.log('   Then add: const fetch = require("node-fetch"); at the top of this file');
    process.exit(1);
  }
  
  createAllAssistants().catch(console.error);
}

module.exports = { createAllAssistants, createVapiAssistant };

