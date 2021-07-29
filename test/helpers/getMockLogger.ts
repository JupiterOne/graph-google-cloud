import Logger from 'bunyan';

export function getMockLogger() {
  const mockLogger = {
    info: jest.fn(),
    fatal: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } as unknown as Logger;

  mockLogger.child = () => mockLogger;

  return mockLogger;
}
