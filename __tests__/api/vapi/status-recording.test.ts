import statusHandler from '../../../pages/api/vapi/status';
import recordingHandler from '../../../pages/api/vapi/recording';
import { createMocks } from 'node-mocks-http';

describe('/api/vapi/status', () => {
  it('accepts POST and logs status', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { status: 'test' }
    });
    await statusHandler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain('update received');
  });

  it('rejects non-POST', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await statusHandler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});

describe('/api/vapi/recording', () => {
  it('accepts POST and logs recording event', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { event: 'call-recorded' }
    });
    await recordingHandler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain('event received');
  });

  it('rejects non-POST', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await recordingHandler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});
