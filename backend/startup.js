#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting application initialization...');

// Set environment variables for Prisma
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
process.env.PRISMA_CLI_QUERY_ENGINE_TYPE = 'binary';
process.env.PRISMA_GENERATE_SKIP_AUTOINSTALL = 'true';

try {
  // Check if prisma directory exists
  const prismaDir = path.join(__dirname, 'prisma');
  if (!fs.existsSync(prismaDir)) {
    console.log('Prisma directory not found at:', prismaDir);
    process.exit(1);
  }

  // Check if Prisma client already exists
  const clientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
  const indexJsPath = path.join(clientPath, 'index.js');
  
  if (fs.existsSync(clientPath) && fs.existsSync(indexJsPath)) {
    console.log('Prisma client already exists, skipping generation');
  } else {
    console.log('Generating Prisma client...');
    
    try {
      // Generate Prisma client using direct path (npx not available in Azure)
      const prismaBinary = path.join(__dirname, 'node_modules', '.bin', 'prisma');
      const prismaIndex = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');
      
      console.log('Checking Prisma binary at:', prismaBinary);
      console.log('Checking Prisma index at:', prismaIndex);
      console.log('Binary exists:', fs.existsSync(prismaBinary));
      console.log('Index exists:', fs.existsSync(prismaIndex));
      
      const prismaCmd = fs.existsSync(prismaBinary) ? prismaBinary : 'node ./node_modules/prisma/build/index.js';
      console.log(`Using command: ${prismaCmd} generate`);
      
      execSync(`${prismaCmd} generate`, {
        stdio: 'inherit',
        cwd: __dirname,
        env: {
          ...process.env,
          PRISMA_CLIENT_ENGINE_TYPE: 'binary',
          PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary',
          PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true'
        }
      });
      
      console.log('Prisma client generated successfully');
    } catch (error) {
      console.error('Error generating Prisma client:');
      console.error('  Command that failed:', error.cmd || 'Unknown command');
      console.error('  Exit code:', error.status || 'Unknown');
      console.error('  Error message:', error.message);
      
      if (error.stdout) {
        console.error('  STDOUT:', error.stdout.toString());
      }
      if (error.stderr) {
        console.error('  STDERR:', error.stderr.toString());
      }
      
      // Try alternative approach with npx
      console.log('Trying alternative approach with npx...');
      try {
        execSync('npx prisma generate', {
          stdio: 'inherit',
          cwd: __dirname,
          env: {
            ...process.env,
            PRISMA_CLIENT_ENGINE_TYPE: 'binary',
            PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary',
            PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true'
          }
        });
        console.log('Prisma client generated with npx');
      } catch (npxError) {
        console.error('npx also failed:');
        console.error('  Command that failed:', npxError.cmd || 'npx prisma generate');
        console.error('  Exit code:', npxError.status || 'Unknown');
        console.error('  Error message:', npxError.message);
        
        if (npxError.stdout) {
          console.error('  STDOUT:', npxError.stdout.toString());
        }
        if (npxError.stderr) {
          console.error('  STDERR:', npxError.stderr.toString());
        }
        
        throw new Error(`Prisma generation failed. Original error: ${error.message}. npx error: ${npxError.message}`);
      }
    }
  }
  
  // Final verification
  if (fs.existsSync(clientPath) && fs.existsSync(indexJsPath)) {
    console.log('Prisma client verified at:', clientPath);
  } else {
    console.log('Prisma client not found at expected location');
    throw new Error('Prisma client generation failed');
  }

} catch (error) {
  console.error('Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Start the main server
console.log('Starting main server...');
require('./server.js');
