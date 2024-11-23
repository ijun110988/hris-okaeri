console.log('Script starting...');

// Load environment variables
const dotenv = require('dotenv');
const result = dotenv.config();
console.log('Loaded env:', result);

// Try to connect to MySQL directly
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing connection...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      port: process.env.DB_PORT || 8889,
      database: process.env.DB_NAME || 'hris_okaeri'
    });
    
    console.log('Connected to database');
    
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables:', rows);
    
    await connection.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

console.log('Starting test...');
testConnection();
