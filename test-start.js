#!/usr/bin/env node

require('dotenv/config');
const path = require('path');

console.log('Starting test...');
console.log('Current directory:', process.cwd());
console.log('Environment:', {
  CELO_NETWORK: process.env.CELO_NETWORK,
  CELO_RPC_URL: process.env.CELO_RPC_URL,
  AGENT_ADDRESS: process.env.AGENT_ADDRESS ? 'SET' : 'NOT SET',
  AGENT_PRIVATE_KEY: process.env.AGENT_PRIVATE_KEY ? 'SET' : 'NOT SET',
});

setTimeout(async () => {
  try {
    console.log('Loading dist/index.js...');
    require('./dist/index.js');
    console.log('Module loaded');
  } catch (error) {
    console.error('Error:', error);
  }
}, 100);

// Auto-exit after 5 seconds
setTimeout(() => {
  console.log('Timeout - exiting');
  process.exit(0);
}, 5000);
