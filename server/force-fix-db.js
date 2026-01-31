const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        console.log('Connected to MongoDB. checking indexes...');
        try {
            const collection = mongoose.connection.db.collection('profiles');
            const indexes = await collection.indexes();
            console.log('Existing Indexes:', JSON.stringify(indexes, null, 2));

            // Force drop the role_1 index if it exists
            const roleIndex = indexes.find(i => i.name === 'role_1');
            if (roleIndex) {
                console.log('Found role_1 index. DROPPING NOW...');
                await collection.dropIndex('role_1');
                console.log('Dropped role_1 index.');
            } else {
                console.log('role_1 index NOT found in the list.');
            }

            // Also drop any other suspicious unique indexes on role if they obey a different naming convention
            for (const idx of indexes) {
                if (idx.key.role === 1 && idx.unique === true && idx.name !== '_id_') {
                    console.log(`Found another unique index on role: ${idx.name}. Dropping...`);
                    await collection.dropIndex(idx.name);
                }
            }

        } catch (err) {
            console.error('Error during index cleanup:', err);
        } finally {
            mongoose.disconnect();
            console.log('Disconnected.');
        }
    })
    .catch(err => console.error('Connection error:', err));
