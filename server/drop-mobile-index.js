const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        const db = mongoose.connection.db;
        try {
            // Check current indexes
            const indexes = await db.collection('users').indexes();
            const mobileIndex = indexes.find(idx => idx.key.mobileNumber);

            if (mobileIndex) {
                console.log('Found mobileNumber index:', mobileIndex.name);
                await db.collection('users').dropIndex(mobileIndex.name);
                console.log('Successfully dropped unique index on mobileNumber');
            } else {
                console.log('mobileNumber index not found');
            }

            // Re-create it as non-unique if it was originally just for performance
            await db.collection('users').createIndex({ mobileNumber: 1 }, { unique: false });
            console.log('Re-created mobileNumber index as non-unique');

            process.exit(0);
        } catch (err) {
            console.error('Error:', err.message);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
