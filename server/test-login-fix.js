const axios = require('axios');

async function testLoginUpdate() {
    try {
        console.log('Attempting login as buyer for jrrohithk@gmail.com...');
        const response = await axios.post('http://localhost:5000/api/users/login', {
            email: 'jrrohithk@gmail.com',
            password: 'password123', // I assume this is the password based on previous context or common patterns
            role: 'buyer'
        });
        console.log('Response Status:', response.status);
        console.log('Response Role:', response.data.user.role);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testLoginUpdate();
