
// This file exists to satisfy Render's direct execution of 'node server.js'
// It switches context to the backend directory and runs the actual server.

import { platform } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

console.log('--- ROOT SERVER PROXY STARTING ---');
console.log(`Current directory: ${process.cwd()}`);

// Change directory to 'backend' so that relative paths in api.js work correctly
try {
    process.chdir('backend');
    console.log(`Switched directory to: ${process.cwd()}`);
} catch (err) {
    console.error('Failed to switch to backend directory:', err);
    process.exit(1);
}

// Import the actual backend server
console.log('Importing backend/server.js...');
import('./backend/server.js')
    .then(() => console.log('Backend server imported successfully.'))
    .catch(err => {
        console.error('Failed to import backend server:', err);
        process.exit(1);
    });
