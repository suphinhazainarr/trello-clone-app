const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('MongoDB Atlas Setup Helper');
console.log('==========================');
console.log('Please follow these steps:');
console.log('1. Go to MongoDB Atlas (https://cloud.mongodb.com)');
console.log('2. Create a free account if you haven\'t already');
console.log('3. Create a new cluster (M0 is fine for development)');
console.log('4. Create a database user with password');
console.log('5. Get your connection string from the "Connect" button');
console.log('\n');

rl.question('Enter your MongoDB Atlas connection string: ', (mongoUri) => {
  rl.question('Enter a secret key for JWT (can be any random string): ', (jwtSecret) => {
    const envContent = `PORT=5000
MONGODB_URI=${mongoUri}
JWT_SECRET=${jwtSecret}`;

    fs.writeFileSync('.env', envContent);
    console.log('\n.env file has been created successfully!');
    console.log('\nNext steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Start the server: npm run dev');
    rl.close();
  });
}); 