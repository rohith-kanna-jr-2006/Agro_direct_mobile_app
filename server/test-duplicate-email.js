const axios = require('axios');

async function testDuplicateEmail() {
    try {
        // First user
        const payload1 = {
            userId: 'user1@test.com',
            role: 'buyer',
            name: 'User One',
            username: 'userone',
            phone: '1234567890',
            email: 'shared@test.com',
            type: 'household'
        };
        await axios.post('http://localhost:5000/api/profile', payload1);
        console.log('User 1 created with shared@test.com');

        // Second user with different username but SAME email
        const payload2 = {
            userId: 'user2@test.com',
            role: 'buyer',
            name: 'User Two',
            username: 'usertwo',
            phone: '0987654321',
            email: 'shared@test.com',
            type: 'household'
        };
        const response = await axios.post('http://localhost:5000/api/profile', payload2);
        console.log('User 2 SUCCESS');
    } catch (err) {
        if (err.response) {
            console.log('ERROR_DATA:' + JSON.stringify(err.response.data));
        } else {
            console.log('ERROR_MSG:' + err.message);
        }
    }
}

testDuplicateEmail();
