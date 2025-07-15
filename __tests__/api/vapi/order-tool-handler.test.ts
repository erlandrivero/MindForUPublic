process.env.VAPI_TOOL_SECRET = 'test';
import handler from '../../../pages/api/vapi/order-tool-handler';
import { createMocks } from 'node-mocks-http';

describe('/api/vapi/order-tool-handler', () => {
  it('returns shipped status for order #12345', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tool: { function: { name: 'lookup_order' } },
        parameters: { orderNumber: '12345' }
      },
      headers: { 'x-vapi-secret': process.env.VAPI_TOOL_SECRET || 'test' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain('shipped');
  });

  it('returns not found for unknown order', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tool: { function: { name: 'lookup_order' } },
        parameters: { orderNumber: '99999' }
      },
      headers: { 'x-vapi-secret': process.env.VAPI_TOOL_SECRET || 'test' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain('not found');
  });

  it('returns 401 for missing/invalid secret', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tool: { function: { name: 'lookup_order' } },
        parameters: { orderNumber: '12345' }
      }
      // No secret header
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it('returns 405 for non-POST', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      body: {}
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});
