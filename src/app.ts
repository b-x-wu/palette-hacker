import express, { Application } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import './db';
// import path from 'path';
// import { fileURLToPath } from 'url';
// const __filename: string = fileURLToPath(import.meta.url);
// const __dirname: string = path.dirname(__filename);

const app: Application = express();
const port = process.env.PORT || 3001;

const User = mongoose.model('User');

app.use(express.urlencoded({ extended: false }));

// logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (req.query) {
    console.log(`Query: ${JSON.stringify(req.query, null, 2)}`);
  }
  if (req.body) {
    console.log(`Body: ${JSON.stringify(req.body, null, 2)}`);
  }

  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/register', (req, res) => {
  if (!Object.getOwnPropertyNames(req.body).includes('username')) {
    res.json({
      status: 'fail',
      data: {
        reason: 'No username provided.',
      },
    });
  } else if (!Object.getOwnPropertyNames(req.body).includes('password')) {
    res.json({
      status: 'fail',
      data: {
        reason: 'No password provided.',
      },
    });
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

app.listen(port, () => console.log(`⚡ Express is listening at http://localhost:${port}⚡`));
