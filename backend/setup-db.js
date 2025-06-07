const fs = require('fs');
const path = require('path');

// Create .env file with proper MongoDB credentials
const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/trello-clone
JWT_SECRET=trello_secret_key_123`;

// Write to .env file
fs.writeFileSync(path.join(__dirname, '.env'), envContent);
console.log('Environment variables have been set up successfully!');
console.log('\nNext steps:');
console.log('1. Make sure MongoDB is running');
console.log('2. Start the server with: npm run dev'); 