const axios = require('axios');

async function testProfileUpdate() {
    try {
        const payload = {
            userId: 'jrrohithk@gmail.com',
            role: 'buyer',
            name: 'Rohith',
            username: 'Rohith123',
            phone: '8870149387',
            email: 'jrrohithk@gmail.com',
            type: 'household',
            preferences: ['Organic', 'Tomato']
        };
        const response = await axios.post('http://localhost:5000/api/profile', payload);
        console.log('SUCCESS');
    } catch (err) {
        if (err.response) {
            console.log('ERROR_DATA:' + JSON.stringify(err.response.data));
        } else {
            console.log('ERROR_MSG:' + err.message);
        }
    }
}

testProfileUpdate();
