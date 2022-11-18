import express, { Application } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import cors from 'cors';
import './db';
import { User, Palette } from './types';

const app: Application = express();
const port = process.env.PORT || 3001;

const UserModel = mongoose.model<User>('User');
const PaletteModel = mongoose.model<Palette>('Palette');

// returns the url sans query params, fragment, or trailing slashes
const cleanUrl = (url: string) => url.split('#')[0] // get everything before the hash if it exists
  .split('?')[0] // get everything before the question mark if it exists
  .replace(/\/+$/, ''); // strip of any backslashes

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
  UserModel.findOne({ username }).then((result) => {
    if (result) {
      throw new Error('Username already exists.');
    }

    bcrypt.hash(password, parseInt(process.env.HASH || '10', 10)).then((hash) => {
      // send new user to mongodb
      const newUser = new UserModel({
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
  const newPalette = new PaletteModel({
    name,
    website: cleanUrl(website),
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

app.get('/website_palettes', (req, res) => {
  // provides query params website or user
  if (!req.query.website) {
    res.json({
      status: 'fail',
      data: {
        reason: 'No website provided',
      },
    });
    return;
  }

  // query the database for the website
  PaletteModel.find({
    website: {
      $regex: `^${(new URL(cleanUrl(req.query.website as string))).origin}.*$`,
    },
  }) // TODO: i wish i could use $where here but the free tier doesn't allow that
    .then((docs) => {
      res.json({
        status: 'success',
        data: docs
          .filter((doc) => {
            // return true if doc.website is an anscestor path of
            // or is equal to req.query.website
            const dbPaths = doc.website.split('/');
            const currentWebsitePaths = cleanUrl(req.query.website as string).split('/');

            if (dbPaths.length > currentWebsitePaths.length) {
              return false;
            }

            for (let i = 0; i < dbPaths.length; i++) {
              if (dbPaths[i] !== currentWebsitePaths[i]) {
                return false;
              }
            }

            return true;
          })
          .map((doc) => {
            // add a relevance field
            const relevance = doc.website.split('/').length;
            return {
              name: doc.name, website: doc.website, palette: doc.palette, relevance,
            };
          })
          .sort((doc1, doc2) => doc2.relevance - doc1.relevance),
      });
    })
    .catch((err) => {
      console.log(err.message);
      res.json({
        status: 'error',
        message: 'Unknown database error.',
      });
    });
});

app.listen(port, () => console.log(`⚡ Express is listening at http://localhost:${port}⚡`));
