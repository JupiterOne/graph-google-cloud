import Logger from 'bunyan';

export function getMockLogger<
  T extends {
    child: (options: Object, simple?: boolean | undefined) => T;
  } = Logger,
>() {
  const mockLogger = {
    info: jest.fn(),
    fatal: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } as unknown as T;

  mockLogger.child = () => mockLogger;

  return mockLogger;
}
