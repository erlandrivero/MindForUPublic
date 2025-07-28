// Simple script to fetch phone numbers from Vapi
const fetchPhoneNumbers = async () => {
  try {
    console.log('Fetching phone numbers from Vapi...');
    const response = await fetch('http://localhost:3000/api/phone-numbers');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch phone numbers: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.phoneNumbers && data.phoneNumbers.length > 0) {
      console.log('\nPhone Numbers from Vapi:');
      console.log('=======================\n');
      
      data.phoneNumbers.forEach((phone, index) => {
        console.log(`Phone #${index + 1}:`);
        console.log(`  ID: ${phone.id}`);
        console.log(`  Number: ${phone.number}`);
        console.log(`  Name: ${phone.name || 'Not set'}`);
        console.log(`  Status: ${phone.status}`);
        console.log(`  Assistant ID: ${phone.assistantId || 'Not assigned'}`);
        console.log(`  Created: ${new Date(phone.createdAt).toLocaleString()}`);
        console.log(`  Updated: ${new Date(phone.updatedAt).toLocaleString()}`);
        console.log('');
      });
      
      console.log(`Total phone numbers: ${data.phoneNumbers.length}`);
    } else {
      console.log('No phone numbers found in your Vapi account.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your development server is running on port 3000');
    console.log('2. Verify you are authenticated (logged in)');
    console.log('3. Check that your Vapi API key is properly configured');
  }
};

// Execute the function
fetchPhoneNumbers();
