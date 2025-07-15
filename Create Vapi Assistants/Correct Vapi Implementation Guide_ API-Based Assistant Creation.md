# Correct Vapi Implementation Guide: API-Based Assistant Creation

## Important Update: No JSON Upload in Dashboard

After checking the current Vapi dashboard interface, I discovered that **there is no JSON upload feature** in the dashboard. Instead, Vapi uses API-based assistant creation. Here's the correct way to use your JSON configurations with zero manual work.

## How Vapi Actually Works

Vapi offers two methods for creating assistants:

1. **Transient (Inline)**: Configuration passed directly in each API call
2. **Permanent (Stored)**: Configuration stored on Vapi servers via API, then referenced by ID

For your demo system, we'll use **Permanent** assistants because:
- ✅ Reusable across multiple calls
- ✅ Manageable through dashboard after creation
- ✅ Better performance (smaller API requests)
- ✅ Consistent configuration

## Step-by-Step Implementation

### Step 1: Get Your Vapi API Key

1. Log into your Vapi dashboard at https://dashboard.vapi.ai
2. Navigate to "API Keys" or "Settings"
3. Copy your API key (starts with `vapi_`)
4. Keep this secure - you'll need it for API calls

### Step 2: Create Assistants via API

I'll provide you with ready-to-run scripts that use your JSON configurations to create all 4 assistants automatically.

#### Option A: Using cURL (Command Line)

Create a file called `create_assistants.sh`:

```bash
#!/bin/bash

# Set your Vapi API key here
VAPI_API_KEY="your-vapi-api-key-here"

echo "Creating MindForU Customer Service Assistant..."
CUSTOMER_SERVICE_RESPONSE=$(curl -s -X POST "https://api.vapi.ai/assistant" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @mindfor_customer_service_assistant.json)

CUSTOMER_SERVICE_ID=$(echo $CUSTOMER_SERVICE_RESPONSE | jq -r '.id')
echo "Customer Service Assistant ID: $CUSTOMER_SERVICE_ID"

echo "Creating MindForU Sales Lead Qualification..."
SALES_RESPONSE=$(curl -s -X POST "https://api.vapi.ai/assistant" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @mindfor_sales_lead_qualification.json)

SALES_ID=$(echo $SALES_RESPONSE | jq -r '.id')
echo "Sales Lead Qualification ID: $SALES_ID"

echo "Creating MindForU E-commerce Assistant..."
ECOMMERCE_RESPONSE=$(curl -s -X POST "https://api.vapi.ai/assistant" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @mindfor_ecommerce_assistant.json)

ECOMMERCE_ID=$(echo $ECOMMERCE_RESPONSE | jq -r '.id')
echo "E-commerce Assistant ID: $ECOMMERCE_ID"

echo "Creating MindForU Appointment Scheduling..."
APPOINTMENT_RESPONSE=$(curl -s -X POST "https://api.vapi.ai/assistant" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @mindfor_appointment_scheduling.json)

APPOINTMENT_ID=$(echo $APPOINTMENT_RESPONSE | jq -r '.id')
echo "Appointment Scheduling ID: $APPOINTMENT_ID"

echo ""
echo "All assistants created successfully!"
echo ""
echo "Copy these IDs for your React component:"
echo "Customer Service: $CUSTOMER_SERVICE_ID"
echo "Sales Qualification: $SALES_ID"
echo "E-commerce: $ECOMMERCE_ID"
echo "Appointment Scheduling: $APPOINTMENT_ID"
```

#### Option B: Using Node.js Script

Create a file called `create_assistants.js`:

```javascript
const fs = require('fs');
const https = require('https');

const VAPI_API_KEY = 'your-vapi-api-key-here';

const assistantFiles = [
  { file: 'mindfor_customer_service_assistant.json', name: 'Customer Service' },
  { file: 'mindfor_sales_lead_qualification.json', name: 'Sales Qualification' },
  { file: 'mindfor_ecommerce_assistant.json', name: 'E-commerce' },
  { file: 'mindfor_appointment_scheduling.json', name: 'Appointment Scheduling' }
];

async function createAssistant(config, name) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(config);
    
    const options = {
      hostname: 'api.vapi.ai',
      port: 443,
      path: '/assistant',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({ name, id: response.id, response });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function createAllAssistants() {
  console.log('Creating MindForU assistants...\n');
  
  const results = [];
  
  for (const { file, name } of assistantFiles) {
    try {
      console.log(`Creating ${name}...`);
      const config = JSON.parse(fs.readFileSync(file, 'utf8'));
      const result = await createAssistant(config, name);
      results.push(result);
      console.log(`✅ ${name} created with ID: ${result.id}\n`);
    } catch (error) {
      console.error(`❌ Error creating ${name}:`, error.message);
    }
  }
  
  console.log('All assistants created successfully!\n');
  console.log('Copy these IDs for your React component:');
  results.forEach(({ name, id }) => {
    console.log(`${name}: ${id}`);
  });
  
  // Generate React component configuration
  console.log('\nReact Component Configuration:');
  console.log('const scenarioConfigs = {');
  console.log(`  'customer-service': { assistantId: '${results[0]?.id}' },`);
  console.log(`  'sales-qualification': { assistantId: '${results[1]?.id}' },`);
  console.log(`  'ecommerce': { assistantId: '${results[2]?.id}' },`);
  console.log(`  'appointment-scheduling': { assistantId: '${results[3]?.id}' }`);
  console.log('};');
}

createAllAssistants().catch(console.error);
```

#### Option C: Using Python Script

Create a file called `create_assistants.py`:

```python
import json
import requests
import os

VAPI_API_KEY = 'your-vapi-api-key-here'
API_URL = 'https://api.vapi.ai/assistant'

assistant_files = [
    {'file': 'mindfor_customer_service_assistant.json', 'name': 'Customer Service', 'key': 'customer-service'},
    {'file': 'mindfor_sales_lead_qualification.json', 'name': 'Sales Qualification', 'key': 'sales-qualification'},
    {'file': 'mindfor_ecommerce_assistant.json', 'name': 'E-commerce', 'key': 'ecommerce'},
    {'file': 'mindfor_appointment_scheduling.json', 'name': 'Appointment Scheduling', 'key': 'appointment-scheduling'}
]

def create_assistant(config, name):
    headers = {
        'Authorization': f'Bearer {VAPI_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(API_URL, json=config, headers=headers)
    
    if response.status_code == 201:
        return response.json()
    else:
        raise Exception(f"Failed to create {name}: {response.status_code} - {response.text}")

def main():
    print("Creating MindForU assistants...\n")
    
    results = []
    
    for assistant_info in assistant_files:
        try:
            print(f"Creating {assistant_info['name']}...")
            
            with open(assistant_info['file'], 'r') as f:
                config = json.load(f)
            
            result = create_assistant(config, assistant_info['name'])
            assistant_id = result['id']
            
            results.append({
                'name': assistant_info['name'],
                'key': assistant_info['key'],
                'id': assistant_id
            })
            
            print(f"✅ {assistant_info['name']} created with ID: {assistant_id}\n")
            
        except Exception as error:
            print(f"❌ Error creating {assistant_info['name']}: {str(error)}")
    
    print("All assistants created successfully!\n")
    print("Copy these IDs for your React component:")
    for result in results:
        print(f"{result['name']}: {result['id']}")
    
    print("\nReact Component Configuration:")
    print("const scenarioConfigs = {")
    for result in results:
        print(f"  '{result['key']}': {{ assistantId: '{result['id']}' }},")
    print("};")

if __name__ == "__main__":
    main()
```

### Step 3: Run the Script

1. **Update API Key**: Replace `your-vapi-api-key-here` with your actual Vapi API key
2. **Place JSON Files**: Ensure all 4 JSON files are in the same directory as your script
3. **Run the Script**:
   - For bash: `chmod +x create_assistants.sh && ./create_assistants.sh`
   - For Node.js: `node create_assistants.js`
   - For Python: `python create_assistants.py`

### Step 4: Update Your React Component

After running the script, you'll get 4 Assistant IDs. Update your React component:

```javascript
const scenarioConfigs = {
  'customer-service': {
    name: 'Customer Service Assistant',
    assistantId: 'your-actual-customer-service-id', // Replace with real ID from script
    duration: '3-5 minutes',
    features: ['Natural Language Understanding', 'Context Retention', 'Multi-turn Conversations']
  },
  'sales-qualification': {
    name: 'Sales Lead Qualification',
    assistantId: 'your-actual-sales-qualification-id', // Replace with real ID from script
    duration: '4-6 minutes',
    features: ['Lead Scoring', 'Appointment Scheduling', 'CRM Integration']
  },
  'ecommerce': {
    name: 'E-commerce Assistant',
    assistantId: 'your-actual-ecommerce-id', // Replace with real ID from script
    duration: '3-4 minutes',
    features: ['Order Tracking', 'Return Processing', 'Product Recommendations']
  },
  'appointment-scheduling': {
    name: 'Appointment Scheduling',
    assistantId: 'your-actual-appointment-id', // Replace with real ID from script
    duration: '2-3 minutes',
    features: ['Calendar Integration', 'Availability Checking', 'Confirmation Emails']
  }
};
```

## Alternative: Manual Dashboard Creation

If you prefer to create assistants manually through the dashboard (though this requires manual work), here's how to use the JSON configurations:

### Manual Creation Steps

1. **Go to Vapi Dashboard**: https://dashboard.vapi.ai
2. **Create New Assistant**: Click "Create Assistant" or similar
3. **Copy Configuration**: Open each JSON file and manually copy the values:
   - **Name**: Copy from `name` field
   - **Model**: Copy provider, model, temperature, maxTokens
   - **System Prompt**: Copy the entire `content` from the system message
   - **Voice**: Copy provider, voiceId, stability, similarityBoost
   - **First Message**: Copy from `firstMessage` field
   - **End Call Phrases**: Copy from `endCallPhrases` array
4. **Save Assistant**: Save and note the Assistant ID
5. **Repeat**: Do this for all 4 JSON files

## Verification and Testing

### Test Your Assistants

After creation, test each assistant:

1. **Dashboard Testing**: Use Vapi's built-in test feature
2. **API Testing**: Make test calls using the Assistant IDs
3. **Integration Testing**: Test with your React component

### Troubleshooting

**Common Issues:**
- **401 Unauthorized**: Check your API key
- **400 Bad Request**: Verify JSON syntax in the files
- **Voice Provider Issues**: Ensure 11Labs integration is enabled
- **Model Access**: Verify GPT-4 access in your account

## Benefits of This Approach

✅ **Zero Manual Work**: Scripts automate the entire process
✅ **Consistent Configuration**: All settings from JSON files are preserved
✅ **Reusable**: Assistants can be used across multiple calls
✅ **Dashboard Manageable**: Created assistants appear in your dashboard
✅ **Version Control**: JSON files can be tracked in git
✅ **Scalable**: Easy to create additional assistants

## Next Steps

1. **Choose Your Script**: Pick bash, Node.js, or Python based on your preference
2. **Get API Key**: Retrieve your Vapi API key from the dashboard
3. **Run Script**: Execute the script to create all 4 assistants
4. **Update Component**: Use the returned Assistant IDs in your React component
5. **Test Integration**: Verify everything works with your demo interface

This approach gives you the same result as JSON upload would have, but uses Vapi's actual API-based creation system. Your JSON configurations contain all the professional prompts, voice settings, and MindForU branding - they'll work perfectly once created via the API!

