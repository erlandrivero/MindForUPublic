import { VapiClient } from '@vapi-ai/server-sdk';

const vapi = new VapiClient({
  token: process.env.VAPI_PRIVATE_KEY!,
});

export default vapi;
