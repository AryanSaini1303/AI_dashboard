import 'dotenv/config';
import mongoose from 'mongoose';

console.log("URI:", process.env.MONGO_URI);

try {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4
  });

  console.log("✅ CONNECTED");
} catch (err) {
  console.error("ERROR NAME:", err.name);
  console.error("ERROR MESSAGE:", err.message);
  console.dir(err, { depth: null });
}

process.exit();