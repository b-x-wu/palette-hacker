import mongoose from 'mongoose';

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
