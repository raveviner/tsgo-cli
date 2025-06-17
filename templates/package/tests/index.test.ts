import { helloWorld } from '../src/index.js';

describe('Index', () => {
  describe('helloWorld', () => {
    it('should return "Hello, world!"', () => {
      const result = helloWorld();
      expect(result).toBe('Hello, world!');
    });
  });
});
