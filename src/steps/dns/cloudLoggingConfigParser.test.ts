import { cloudLoggingConfigParser } from './cloudLoggingConfigParser';

describe('CloudLoggingConfigParser', () => {
  describe('parseEnableLoggingStatus()', () => {
    describe('given undefined as argument', () => {
      it('should return off', () => {
        const result = cloudLoggingConfigParser.parseEnableLoggingStatus();
        expect(result).toEqual('off');
      });
    });

    describe('given null as argument', () => {
      it('should return off', () => {
        const result = cloudLoggingConfigParser.parseEnableLoggingStatus();
        expect(result).toEqual('off');
      });
    });

    describe('given enableLogging equal to undefined', () => {
      it('should return off', () => {
        const result = cloudLoggingConfigParser.parseEnableLoggingStatus({});
        expect(result).toEqual('off');
      });
    });

    describe('given enableLogging equal to null', () => {
      it('should return off', () => {
        const result = cloudLoggingConfigParser.parseEnableLoggingStatus({
          enableLogging: null,
        });
        expect(result).toEqual('off');
      });
    });

    describe('given enableLogging equal to false', () => {
      it('should return off', () => {
        const result = cloudLoggingConfigParser.parseEnableLoggingStatus({
          enableLogging: false,
        });
        expect(result).toEqual('off');
      });
    });

    describe('given enableLogging equal to true', () => {
      it('should return on', () => {
        const result = cloudLoggingConfigParser.parseEnableLoggingStatus({
          enableLogging: true,
        });
        expect(result).toEqual('on');
      });
    });
  });
});
