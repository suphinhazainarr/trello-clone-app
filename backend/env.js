const fs = require('fs');

// Create .env file with MongoDB credentials
const envContent = `PORT=5000
MONGODB_URI=mongodb://trello_user:trello123@localhost:27017/trello-clone?authSource=admin
JWT_SECRET=trello_secret_key_123`;

fs.writeFileSync('.env', envContent);
console.log('Environment variables have been set up successfully!'); 