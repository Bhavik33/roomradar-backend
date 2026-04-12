const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const clearDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`, collections.map(c => c.name));

    for (const col of collections) {
      await mongoose.connection.db.collection(col.name).deleteMany({});
      console.log(`✅ Cleared: ${col.name}`);
    }

    console.log('\n🎉 All data cleared successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

clearDB();
