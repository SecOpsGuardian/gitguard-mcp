module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\.spec\.ts$',
  transform: { '^.+\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', moduleResolution: 'node', target: 'ES2022', esModuleInterop: true, strict: true, skipLibCheck: true } }] },
};
