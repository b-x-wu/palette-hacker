import mongoose, { Types } from 'mongoose';
import * as dotenv from 'dotenv';
import { User, Palette } from './types';

dotenv.config();

const { Schema } = mongoose;

// TODO: make fields required
const UserSchema = new Schema<User>({
  username: String,
  hash: String,
  palettes: [Types.ObjectId],
});

const PaletteSchema = new Schema<Palette>({
  user: Types.ObjectId,
  website: String,
  name: String,
  palette: [{
    color: {
      red: {
        type: Number,
        min: 0,
        max: 255,
      },
      green: {
        type: Number,
        min: 0,
        max: 255,
      },
      blue: {
        type: Number,
        min: 0,
        max: 255,
      },
    },
    components: [{
      selector: String,
      attribute: String,
    }],
  }],
});

mongoose.model('User', UserSchema);
mongoose.model('Palette', PaletteSchema);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/pallete_hacker', (err) => {
  console.log(err || '✅ Connected to MongoDB Atlas!');
});
