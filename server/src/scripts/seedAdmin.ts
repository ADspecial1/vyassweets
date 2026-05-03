import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const MONGO_URI = process.env['MONGO_URI'];
const ADMIN_EMAIL = process.env['ADMIN_EMAIL'] ?? 'admin@sweetsapp.com';
const ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'] ?? 'Admin@12345';

if (!MONGO_URI) {
  process.stderr.write('MONGO_URI is required\n');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);

const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
const existing = await User.findOne({ email: ADMIN_EMAIL }).select('+passwordHash');

if (existing) {
  existing.role = 'admin';
  existing.passwordHash = passwordHash;
  await existing.save();
  process.stdout.write(`Admin updated: ${ADMIN_EMAIL}\n`);
} else {
  await User.create({
    name: 'Admin',
    email: ADMIN_EMAIL,
    phone: '0000000000',
    passwordHash,
    role: 'admin',
  });
  process.stdout.write(`Admin created: ${ADMIN_EMAIL}\n`);
}

await mongoose.disconnect();
process.exit(0);
