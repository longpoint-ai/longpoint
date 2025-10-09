import { camelCase, pascalCase } from './string.utils';

describe('string.utils', () => {
  it('should camelCase a string', () => {
    expect(camelCase('hello-world')).toEqual('helloWorld');
    expect(camelCase('helloWorld')).toEqual('helloWorld');
    expect(camelCase('hello_world', '_')).toEqual('helloWorld');
    expect(camelCase('hello')).toEqual('hello');
  });

  it('should pascalCase a string', () => {
    expect(pascalCase('hello-world')).toEqual('HelloWorld');
    expect(pascalCase('helloWorld')).toEqual('HelloWorld');
    expect(pascalCase('hello_world', '_')).toEqual('HelloWorld');
    expect(pascalCase('hello')).toEqual('Hello');
  });
});
