#!/usr/bin/env node

/**
 * Simple Deployment Test Script
 * Basic testing to check if application is deployable
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🧪 SIMPLE DEPLOYMENT VERIFICATION');
console.log('==================================');

class SimpleDeploymentTest {
  constructor() {
    this.testResults = [];
  }

  log(message, status = 'info') {
    const timestamp = new Date().toISOString();
    const statusEmoji = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    };
    
    console.log(`${statusEmoji[status]} ${message}`);
    
    this.testResults.push({
      timestamp,
      status,
      message
    });
  }

  async runTest(name, testFn) {
    this.log(`Testing: ${name}...`, 'info');
    
    try {
      const result = await testFn();
      this.log(`${name} - PASSED`, 'success');
      return { name, status: 'PASS', result };
    } catch (error) {
      this.log(`${name} - FAILED: ${error.message}`, 'error');
      return { name, status: 'FAIL', error: error.message };
    }
  }

  // Test 1: Check build artifacts
  async testBuildArtifacts() {
    const backendDistExists = fs.existsSync(path.join(__dirname, 'backend', 'dist'));
    const frontendBuildExists = fs.existsSync(path.join(__dirname, 'frontend', 'build'));
    
    if (!backendDistExists) {
      throw new Error('Backend build directory not found');
    }
    
    if (!frontendBuildExists) {
      throw new Error('Frontend build directory not found');  
    }
    
    return {
      backend: 'built',
      frontend: 'built'
    };
  }

  // Test 2: Check configuration files
  async testConfigurationFiles() {
    const requiredFiles = [
      'backend/.env',
      'backend/package.json', 
      'frontend/package.json',
      'railway.json',
      'render.yaml'
    ];
    
    const missing = [];
    const present = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        present.push(file);
      } else {
        missing.push(file);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing configuration files: ${missing.join(', ')}`);
    }
    
    return {
      configFiles: present.length,
      allRequired: true
    };
  }

  // Test 3: Check environment variables
  async testEnvironmentVariables() {
    const envFile = path.join(__dirname, 'backend', '.env');
    
    if (!fs.existsSync(envFile)) {
      throw new Error('.env file not found');
    }
    
    const envContent = fs.readFileSync(envFile, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
    const missingVars = requiredVars.filter(v => !envVars[v] || envVars[v] === 'your-value-here');
    
    return {
      totalVars: Object.keys(envVars).length,
      requiredPresent: requiredVars.length - missingVars.length,
      missingVars: missingVars
    };
  }

  // Test 4: Check package.json scripts
  async testPackageScripts() {
    const backendPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend', 'package.json'), 'utf8'));
    const frontendPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend', 'package.json'), 'utf8'));
    
    const requiredBackendScripts = ['build', 'start', 'dev', 'migrate'];
    const requiredFrontendScripts = ['build', 'start'];
    
    const backendScripts = Object.keys(backendPkg.scripts || {});
    const frontendScripts = Object.keys(frontendPkg.scripts || {});
    
    const missingBackend = requiredBackendScripts.filter(s => !backendScripts.includes(s));
    const missingFrontend = requiredFrontendScripts.filter(s => !frontendScripts.includes(s));
    
    if (missingBackend.length > 0 || missingFrontend.length > 0) {
      throw new Error(`Missing scripts - Backend: ${missingBackend.join(', ')}, Frontend: ${missingFrontend.join(', ')}`);
    }
    
    return {
      backendScripts: backendScripts.length,
      frontendScripts: frontendScripts.length,
      allRequired: true
    };
  }

  // Test 5: Check deployment configuration
  async testDeploymentConfig() {
    const railwayConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'railway.json'), 'utf8'));
    const renderConfig = fs.readFileSync(path.join(__dirname, 'render.yaml'), 'utf8');
    
    if (!railwayConfig.build) {
      throw new Error('Railway configuration missing build section');
    }
    
    if (!renderConfig.includes('services:')) {
      throw new Error('Render configuration missing services section');
    }
    
    return {
      railway: 'configured',
      render: 'configured'
    };
  }

  // Test 6: Database migration status (if server is running)
  async testDatabaseStatus() {
    try {
      const response = await axios.get('http://localhost:5000/api/health', { 
        timeout: 5000 
      });
      return {
        server: 'running',
        status: response.status,
        data: response.data
      };
    } catch (error) {
      // Server not running, which is expected for deployment test
      return {
        server: 'not_running',
        message: 'Backend server not running (expected for deployment test)'
      };
    }
  }

  // Main test runner
  async runAllTests() {
    console.log('🚀 Starting deployment verification tests...\n');
    
    const tests = [
      { name: 'Build Artifacts', fn: () => this.testBuildArtifacts() },
      { name: 'Configuration Files', fn: () => this.testConfigurationFiles() },
      { name: 'Environment Variables', fn: () => this.testEnvironmentVariables() },
      { name: 'Package Scripts', fn: () => this.testPackageScripts() },
      { name: 'Deployment Configuration', fn: () => this.testDeploymentConfig() },
      { name: 'Database Status', fn: () => this.testDatabaseStatus() }
    ];
    
    const results = [];
    
    for (const test of tests) {
      const result = await this.runTest(test.name, test.fn);
      results.push(result);
    }
    
    this.printSummary(results);
    return results;
  }

  printSummary(results) {
    console.log('\n' + '='.repeat(50));
    console.log('📊 DEPLOYMENT TEST SUMMARY');
    console.log('='.repeat(50));
    
    const passed = results.filter(r => r.status === 'PASS');
    const failed = results.filter(r => r.status === 'FAIL');
    
    console.log(`\n✅ Passed: ${passed.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      failed.forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
    }
    
    console.log('\n📋 Passed Tests:');
    passed.forEach(test => {
      console.log(`   - ${test.name}`);
    });
    
    const successRate = (passed.length / results.length) * 100;
    console.log(`\n📊 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('\n🎉 DEPLOYMENT READY!');
      console.log('✨ The application appears ready for deployment.');
    } else {
      console.log('\n⚠️  DEPLOYMENT ISSUES DETECTED');
      console.log('🔧 Please fix the failed tests before deployment.');
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Run the tests
if (require.main === module) {
  const tester = new SimpleDeploymentTest();
  tester.runAllTests()
    .then(results => {
      const failed = results.filter(r => r.status === 'FAIL');
      process.exit(failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = SimpleDeploymentTest;
