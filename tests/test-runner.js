#!/usr/bin/env node

/**
 * Test Runner Script for Smart Waste Management Frontend
 * 
 * This script provides various test running options and utilities
 * for the test suite.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

// Test categories and their descriptions
const testCategories = {
  unit: {
    description: 'Unit tests for components, utils, and API functions',
    pattern: 'tests/(components|utils|api)/**/*.test.js',
  },
  integration: {
    description: 'Integration tests for user flows and interactions',
    pattern: 'tests/integration/**/*.test.js',
  },
  screens: {
    description: 'Screen component tests',
    pattern: 'tests/screens/**/*.test.js',
  },
  contexts: {
    description: 'Context provider tests',
    pattern: 'tests/contexts/**/*.test.js',
  },
  components: {
    description: 'Component unit tests',
    pattern: 'tests/components/**/*.test.js',
  },
  api: {
    description: 'API function tests',
    pattern: 'tests/api/**/*.test.js',
  },
};

// Utility functions
const runCommand = (command, options = {}) => {
  try {
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
};

const getTestFiles = (pattern) => {
  try {
    const result = execSync(`find tests -name "*.test.js" -type f`, { encoding: 'utf8' });
    return result.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    return [];
  }
};

const showHelp = () => {
  log.header('\n🧪 Smart Waste Management Test Runner\n');
  
  console.log('Usage: node test-runner.js [command] [options]\n');
  
  console.log('Commands:');
  console.log('  all              Run all tests');
  console.log('  unit             Run unit tests only');
  console.log('  integration      Run integration tests only');
  console.log('  screens          Run screen tests only');
  console.log('  contexts         Run context tests only');
  console.log('  components       Run component tests only');
  console.log('  api              Run API tests only');
  console.log('  coverage         Run tests with coverage report');
  console.log('  watch            Run tests in watch mode');
  console.log('  ci               Run tests in CI mode');
  console.log('  lint             Run linting checks');
  console.log('  validate         Validate test setup');
  console.log('  stats            Show test statistics');
  console.log('  help             Show this help message\n');
  
  console.log('Options:');
  console.log('  --verbose        Show verbose output');
  console.log('  --silent         Suppress output');
  console.log('  --bail           Stop on first failure');
  console.log('  --updateSnapshot Update snapshots\n');
  
  console.log('Examples:');
  console.log('  node test-runner.js all --coverage');
  console.log('  node test-runner.js unit --watch');
  console.log('  node test-runner.js components --verbose');
};

const validateTestSetup = () => {
  log.header('🔍 Validating Test Setup\n');
  
  const checks = [
    {
      name: 'Jest configuration',
      check: () => fs.existsSync('jest.config.js'),
      fix: 'Create jest.config.js file',
    },
    {
      name: 'Test setup file',
      check: () => fs.existsSync('tests/setup/setupTests.js'),
      fix: 'Create tests/setup/setupTests.js file',
    },
    {
      name: 'Package.json test scripts',
      check: () => {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return pkg.scripts && pkg.scripts.test;
      },
      fix: 'Add test scripts to package.json',
    },
    {
      name: 'Testing dependencies',
      check: () => {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const devDeps = pkg.devDependencies || {};
        return devDeps.jest && devDeps['@testing-library/react-native'];
      },
      fix: 'Install testing dependencies',
    },
    {
      name: 'Test files exist',
      check: () => getTestFiles().length > 0,
      fix: 'Create test files',
    },
  ];
  
  let allPassed = true;
  
  checks.forEach(({ name, check, fix }) => {
    if (check()) {
      log.success(`${name}`);
    } else {
      log.error(`${name} - ${fix}`);
      allPassed = false;
    }
  });
  
  if (allPassed) {
    log.success('\n✨ Test setup is valid!');
  } else {
    log.error('\n❌ Test setup has issues that need to be fixed.');
  }
  
  return allPassed;
};

const showTestStats = () => {
  log.header('📊 Test Statistics\n');
  
  const testFiles = getTestFiles();
  const categories = {};
  
  // Categorize test files
  testFiles.forEach(file => {
    const parts = file.split('/');
    if (parts.length >= 2) {
      const category = parts[1];
      categories[category] = (categories[category] || 0) + 1;
    }
  });
  
  console.log(`Total test files: ${testFiles.length}\n`);
  
  console.log('Test files by category:');
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} files`);
  });
  
  // Show test file details
  console.log('\nTest files:');
  testFiles.forEach(file => {
    console.log(`  ${file}`);
  });
};

const runTests = (category = 'all', options = {}) => {
  log.header(`🧪 Running ${category} tests\n`);
  
  let command = 'npm test';
  
  // Add test pattern if specific category
  if (category !== 'all' && testCategories[category]) {
    command += ` -- --testPathPattern="${testCategories[category].pattern}"`;
  }
  
  // Add options
  if (options.coverage) {
    command += ' --coverage';
  }
  
  if (options.watch) {
    command += ' --watch';
  }
  
  if (options.ci) {
    command += ' --ci --coverage --watchAll=false';
  }
  
  if (options.verbose) {
    command += ' --verbose';
  }
  
  if (options.bail) {
    command += ' --bail';
  }
  
  if (options.updateSnapshot) {
    command += ' --updateSnapshot';
  }
  
  log.info(`Running: ${command}\n`);
  
  const result = runCommand(command);
  
  if (result.success) {
    log.success('\n✨ Tests completed successfully!');
  } else {
    log.error('\n❌ Tests failed!');
    process.exit(1);
  }
};

const runLinting = () => {
  log.header('🔍 Running Linting Checks\n');
  
  // Check if ESLint is available
  const eslintResult = runCommand('npx eslint --version', { silent: true });
  
  if (eslintResult.success) {
    log.info('Running ESLint...');
    const lintResult = runCommand('npx eslint tests/ --ext .js');
    
    if (lintResult.success) {
      log.success('Linting passed!');
    } else {
      log.error('Linting failed!');
      process.exit(1);
    }
  } else {
    log.warning('ESLint not found, skipping linting checks');
  }
};

// Main execution
const main = () => {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  // Parse options
  const options = {
    verbose: args.includes('--verbose'),
    silent: args.includes('--silent'),
    coverage: args.includes('--coverage'),
    watch: args.includes('--watch'),
    ci: args.includes('--ci'),
    bail: args.includes('--bail'),
    updateSnapshot: args.includes('--updateSnapshot'),
  };
  
  switch (command) {
    case 'help':
      showHelp();
      break;
      
    case 'validate':
      validateTestSetup();
      break;
      
    case 'stats':
      showTestStats();
      break;
      
    case 'lint':
      runLinting();
      break;
      
    case 'coverage':
      runTests('all', { ...options, coverage: true });
      break;
      
    case 'watch':
      runTests('all', { ...options, watch: true });
      break;
      
    case 'ci':
      runTests('all', { ...options, ci: true });
      break;
      
    case 'all':
    case 'unit':
    case 'integration':
    case 'screens':
    case 'contexts':
    case 'components':
    case 'api':
      runTests(command, options);
      break;
      
    default:
      log.error(`Unknown command: ${command}`);
      log.info('Run "node test-runner.js help" for usage information');
      process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  validateTestSetup,
  showTestStats,
  runLinting,
};
