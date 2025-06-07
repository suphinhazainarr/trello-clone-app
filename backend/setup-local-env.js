const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Local MongoDB Setup Helper');
console.log('==========================');
console.log('Please follow these steps:');
console.log('1. Make sure MongoDB is running locally');
console.log('2. Create a database user in MongoDB');
console.log('3. Enter the credentials below');
console.log('\n');

rl.question('Enter MongoDB username: ', (username) => {
  rl.question('Enter MongoDB password: ', (password) => {
    rl.question('Enter a secret key for JWT (can be any random string): ', (jwtSecret) => {
      const envContent = `PORT=5000
MONGODB_URI=mongodb://${username}:${password}@localhost:27017/trello-clone?authSource=admin
JWT_SECRET=${jwtSecret}`;

      fs.writeFileSync('.env', envContent);
      console.log('\n.env file has been created successfully!');
      console.log('\nNext steps:');
      console.log('1. Install dependencies: npm install');
      console.log('2. Start the server: npm run dev');
      rl.close();
    });
  });
}); 