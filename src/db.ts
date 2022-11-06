import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const { Schema, Types } = mongoose;

const User = new Schema({
  username: String,
  hash: String,
  salt: String,
  palettes: [Types.ObjectId],
});

const Website = new Schema({
  domain: String,
  palettes: [Types.ObjectId],
});

const Palette = new Schema({
  user: Types.ObjectId,
  website: Types.ObjectId,
  name: String,
  swaps: [{
    selector: String,
    property: String,
    color: String,
  }],
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/pallete_hacker', (err) => {
  console.log(err || 'Connected to MongoDB Atlas!');
});
