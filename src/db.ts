import mongoose, { Types } from 'mongoose';
import * as dotenv from 'dotenv';
import { User, Palette } from './types';

dotenv.config();

const { Schema } = mongoose;

const UserSchema = new Schema<User>({
  username: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  palettes: [Types.ObjectId],
});

const PaletteSchema = new Schema<Palette>({
  user: Types.ObjectId,
  website: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  palette: [{
    color: {
      red: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
      green: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
      blue: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
    },
    components: [{
      selector: {
        type: String,
        required: true,
      },
      attribute: {
        type: String,
        required: true,
      },
    }],
  }],
});

mongoose.model('User', UserSchema);
mongoose.model('Palette', PaletteSchema);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/pallete_hacker', (err) => {
  console.log(err || '✅ Connected to MongoDB Atlas!');
});
