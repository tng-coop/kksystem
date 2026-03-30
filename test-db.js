import db from './src/db.js';

console.log('--- Testing SQLite Database ---');

// Insert a fake user
try {
    const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    const result = insert.run('John Doe', `john.doe.${Date.now()}@example.com`);
    console.log(`Successfully added a new user with ID: ${result.lastInsertRowid}`);
} catch (error) {
    console.error('Failed to add user:', error.message);
}

// Retrieve all users
console.log('\n--- All Users in Database ---');
const users = db.prepare('SELECT * FROM users').all();
console.table(users);

console.log('\nTest complete! You can see the kksystem.db file was created in this folder.');
