import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const { Schema, Types } = mongoose;

// TODO: make fields required
const UserSchema = new Schema({
  username: String,
  hash: String,
  palettes: [Types.ObjectId],
});

const WebsiteSchema = new Schema({
  domain: String,
  palettes: [Types.ObjectId],
});

const PaletteSchema = new Schema({
  user: Types.ObjectId,
  website: Types.ObjectId,
  name: String,
  palette: [{
    color: String,
    components: [{
      selector: String,
      attribute: String,
    }],
  }],
});

mongoose.model('User', UserSchema);
mongoose.model('Website', WebsiteSchema);
mongoose.model('Palettes', PaletteSchema);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/pallete_hacker', (err) => {
  console.log(err || '✅ Connected to MongoDB Atlas!');
});
