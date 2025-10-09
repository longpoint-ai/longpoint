/**
 * Convert a string to camel case
 * @param str - The string to convert
 * @param delimiter - The delimiter to use to split the string. Defaults to '-'
 * @returns The camel case string
 * @example
 * camelCase('hello-world') // 'helloWorld'
 * camelCase('helloWorld') // 'helloWorld'
 * camelCase('hello_world', '_') // 'helloWorld'
 * camelCase('hello') // 'hello'
 */
export function camelCase(str: string, delimiter = '-') {
  const stringParts = str.split(delimiter);
  return (
    stringParts[0] +
    stringParts
      .slice(1)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  );
}

/**
 * Convert a string to pascal case
 * @param str - The string to convert
 * @param delimiter - The delimiter to use to split the string. Defaults to '-'
 * @returns The pascal case string
 * @example
 * pascalCase('hello-world') // 'HelloWorld'
 * pascalCase('helloWorld') // 'HelloWorld'
 * pascalCase('hello_world', '_') // 'HelloWorld'
 * pascalCase('hello') // 'Hello'
 */
export function pascalCase(str: string, delimiter = '-') {
  return (
    camelCase(str, delimiter).charAt(0).toUpperCase() +
    camelCase(str, delimiter).slice(1)
  );
}
