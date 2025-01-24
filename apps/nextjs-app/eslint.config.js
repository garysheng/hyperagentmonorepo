/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ['next/core-web-vitals'],
  ignorePatterns: [
    'src/widget/**/*',  // Ignore all files in the widget directory
    'public/widget/**/*', // Ignore built widget files
  ],
  rules: {
    // Add any custom rules here
  }
};

module.exports = config; 