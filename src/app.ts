import express, { Application } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import cors from 'cors';
import './db';

const app: Application = express();
const port = process.env.PORT || 3001;

const User = mongoose.model('User');
const Palette = mongoose.model('Palette');

// TODO: figure out what the max size should actually be
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (req.query) {
    console.log(`Query: ${JSON.stringify(req.query, null, 2)}`);
  }
  if (req.body) {
    console.log(`Body: ${JSON.stringify(req.body, null, 2).substring(0, 1000)}`);
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/register', (req, res) => {
  if (!Object.hasOwn(req.body, 'username')) {
    res.json({
      status: 'fail',
      data: {
        reason: 'No username provided.',
      },
    });
    return;
  }
  if (!Object.hasOwn(req.body, 'password')) {
    res.json({
      status: 'fail',
      data: {
        reason: 'No password provided.',
      },
    });
    return;
  }
  const { username, password } = req.body;

  // check for repeat username
  User.findOne({ username }).then((result) => {
    if (result) {
      throw new Error('Username already exists.');
    }

    bcrypt.hash(password, parseInt(process.env.HASH || '10', 10)).then((hash) => {
      // send new user to mongodb
      const newUser = new User({
        username,
        hash,
        palettes: [],
      });

      return newUser.save();
    }).then(() => {
      console.log(`New user ${username} created and saved.`);
      res.json({
        status: 'success',
        data: {
          username,
        },
      });
    }).catch((err) => {
      // unknown error from hash or mongodb saving
      console.log(err.message);
      res.json({
        status: 'error',
        message: 'Unknown registration error.',
      });
    });
  }, (err) => {
    // unknown mongodb error
    console.log(err.message);
    res.json({
      status: 'error',
      message: 'Unknown registration error.',
    });
  }).catch((err) => {
    // username already exists
    console.log(err.message);
    res.json({
      status: 'fail',
      data: {
        username,
        reason: 'Username already exists.',
      },
    });
  });
});

app.post('/add_palette', (req, res) => {
  if (!Object.hasOwn(req.body, 'palette')) {
    res.json({
      status: 'fail',
      message: 'Request body missing palette',
    });
    return;
  }

  // get website attributes
  const { name, website, palette } = req.body;

  // create and save palette document
  const newPalette = new Palette({
    name,
    website,
    palette,
  });

  newPalette.save().then(() => {
    console.log(`New palette ${name} created and saved.`);
    res.json({
      status: 'success',
      data: null,
    });
  }, (err) => {
    console.log(err.message);
    res.json({
      status: 'error',
      message: 'Unknown database error.',
    });
  });
});

app.listen(port, () => console.log(`⚡ Express is listening at http://localhost:${port}⚡`));
