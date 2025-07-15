process.env.VAPI_TOOL_SECRET = 'test';
import handler from '../../../pages/api/vapi/tool-handler';
import { createMocks } from 'node-mocks-http';

// Mock the getAppointmentsForUser dependency
jest.mock('../../../models/Appointment', () => ({
  getAppointmentsForUser: jest.fn((phoneNumber, date) => {
    if (phoneNumber === '555-5555' && date === '2025-07-12') return [];
    if (phoneNumber === '999-9999' && date === '2025-07-12') return [{ id: 1, date, phoneNumber }];
    return [];
  })
}));

// Ensure the secret is always set for tests
beforeAll(() => {
  process.env.VAPI_TOOL_SECRET = 'test';
});

describe('/api/vapi/tool-handler', () => {
  it('returns no appointments for empty data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tool: { function: { name: 'lookup_appointment' } },
        parameters: { phoneNumber: '555-5555', date: '2025-07-12' }
      },
      headers: { 'x-vapi-secret': 'test' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain('no appointments');
  });

  it('returns 401 for missing/invalid secret', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tool: { function: { name: 'lookup_appointment' } },
        parameters: { phoneNumber: '555-5555', date: '2025-07-12' }
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

  // Optionally, add a test for a real appointment found if getAppointmentsForUser can be mocked
  // it('returns appointments if found', async () => {
  //   // Mock getAppointmentsForUser to return a fake appointment
  // });
});
