const fs = require('fs');

const envContent = `PORT=5000
MONGODB_URI=mongodb://trello_user:trello123@localhost:27017/trello-clone?authSource=admin
JWT_SECRET=suphin123`;

fs.writeFileSync('.env', envContent);
console.log('.env file has been created successfully!'); 