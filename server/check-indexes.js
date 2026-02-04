const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        const db = mongoose.connection.db;
        const indexes = await db.collection('users').indexes();
        const mobileIndex = indexes.find(idx => idx.key.mobileNumber);
        if (mobileIndex) {
            console.log('MOBILE_INDEX_FOUND');
            console.log('UNIQUE:' + (mobileIndex.unique ? 'YES' : 'NO'));
        } else {
            console.log('MOBILE_INDEX_NOT_FOUND');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
