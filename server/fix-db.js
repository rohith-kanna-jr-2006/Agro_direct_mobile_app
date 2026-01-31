const mongoose = require('mongoose');
const Profile = require('./models/Profile'); // Adjust path as needed

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        console.log('Connected to MongoDB to fix indexes...');
        try {
            // List indexes to confirm
            const indexes = await mongoose.connection.db.collection('profiles').indexes();
            console.log('Current Indexes:', indexes);

            // Drop the problematic index
            if (indexes.find(idx => idx.name === 'role_1')) {
                console.log('Found bad index "role_1". Dropping it...');
                await mongoose.connection.db.collection('profiles').dropIndex('role_1');
                console.log('Index dropped successfully.');
            } else {
                console.log('Index "role_1" not found. It might have been dropped already.');
            }

        } catch (err) {
            console.error('Error managing indexes:', err.message);
        } finally {
            mongoose.disconnect();
            console.log('Disconnected.');
        }
    })
    .catch(err => console.error('Connection error:', err));
