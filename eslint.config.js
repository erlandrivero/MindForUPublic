import next from 'eslint-config-next';
import tseslint from '@typescript-eslint/eslint-plugin';

export default [
  ...next(),
  {
    plugins: { '@typescript-eslint': tseslint },
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];
