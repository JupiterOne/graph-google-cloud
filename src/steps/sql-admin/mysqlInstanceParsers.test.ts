import { mysqlInstanceParser } from './mysqlInstanceParsers';

describe('MySqlInstanceParser', () => {
  describe('parseHasRootPassword()', () => {
    describe('given rootPassword equal to undefined', () => {
      it('should return false', () => {
        const result = mysqlInstanceParser.parseHasRootPassword({});
        expect(result).toBe(false);
      });
    });

    describe('given rootPassword equal to null', () => {
      it('should return false', () => {
        const result = mysqlInstanceParser.parseHasRootPassword({
          rootPassword: null,
        });
        expect(result).toBe(false);
      });
    });

    describe('given a rootPassword', () => {
      it('should return true', () => {
        const result = mysqlInstanceParser.parseHasRootPassword({
          rootPassword: '1234',
        });
        expect(result).toBe(true);
      });
    });
  });
});
