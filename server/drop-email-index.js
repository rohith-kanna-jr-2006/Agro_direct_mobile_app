const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        const db = mongoose.connection.db;
        try {
            // Drop email unique index
            const indexes = await db.collection('users').indexes();
            const emailIndex = indexes.find(idx => idx.key.email && idx.unique);

            if (emailIndex) {
                console.log('Found unique email index:', emailIndex.name);
                await db.collection('users').dropIndex(emailIndex.name);
                console.log('Successfully dropped unique index on email');
            } else {
                console.log('Unique email index not found');
            }

            // Create a non-unique index on email
            await db.collection('users').createIndex({ email: 1 }, { unique: false });
            console.log('Re-created email index as non-unique');

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
