/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import './db';
import { Palette, User } from './types';

const app: Application = express();
const port = process.env.PORT || 3001;

const PaletteModel = mongoose.model<Palette>('Palette');
const UserModel = mongoose.model<User>('User');

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

app.post('/add_palette', (req, res) => {
  if (!Object.hasOwn(req.body, 'palette')) {
    res.status(400);
    res.json({
      status: 'fail',
      message: 'Request body missing palette',
    });
    return;
  }

  // get website attributes
  const {
    name, website, palette, userId,
  } = req.body;

  // create and save palette document
  const newPalette = new PaletteModel({
    name,
    website: cleanUrl(website),
    palette,
  });

  newPalette.save()
    .then((doc) => {
      console.log(`New palette ${doc.name} created and saved.`);
      return doc;
    })
    .then((paletteDoc) => {
      if (!userId) {
        console.log('No userId');
        return {};
      }
      const options = {
        upsert: true, new: true, setDefaultsOnInsert: true,
      };
      const update = {
        $setOnInsert: { id: userId },
        $push: { palettes: paletteDoc.id },
      };

      return UserModel.findOneAndUpdate({ userId }, update, options)
        .then((doc) => {
          if (!doc) {
            console.log('Error saving to user');
            return;
          }
          console.log(`Palette saved for ${doc?.userId}.`);
        });
    })
    .then(() => {
      res.json({
        status: 'success',
        data: null,
      });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500);
      res.json({
        status: 'error',
        message: 'Unknown database error.',
      });
    });
});

app.get('/get_website_palettes/own', (req, res) => {
  // provides query params website or user
  if (!req.query.website) {
    res.status(400);
    res.json({
      status: 'fail',
      data: {
        reason: 'No website provided',
      },
    });
    return;
  }

  if (!req.query.userId) {
    res.status(400);
    res.json({
      status: 'fail',
      data: {
        reason: 'No userId provided',
      },
    });
    return;
  }

  UserModel.findOne({
    userId: req.query.userId,
  })
    .populate<{ palettes: Palette[] }>('palettes')
    .then((userDoc) => {
      res.json({
        status: 'success',
        data: {
          palettes: userDoc?.palettes.filter((palette) => {
            const dbPaths = palette.website.split('/');
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
                objectId: doc._id,
                name: doc.name,
                website: doc.website,
                colors: doc.palette.map((swatch) => swatch.color),
                relevance,
              };
            })
            .sort((doc1, doc2) => doc2.relevance - doc1.relevance),
        },
      });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500);
      res.json({
        status: 'error',
        message: 'Unknown database error.',
      });
    });
});

app.get('/get_website_palettes', (req, res) => {
  // provides query params website or user
  if (!req.query.website) {
    res.status(400);
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
  })
    .then((docs) => {
      res.json({
        status: 'success',
        data: {
          palettes: docs
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
                objectId: doc.id,
                name: doc.name,
                website: doc.website,
                colors: doc.palette.map((swatch) => swatch.color),
                relevance,
              };
            })
            .sort((doc1, doc2) => doc2.relevance - doc1.relevance),
        },
      });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500);
      res.json({
        status: 'error',
        message: 'Unknown database error.',
      });
    });
});

app.get('/get_palette', async (req, res) => {
  if (!req.query.objectId) {
    res.status(400);
    res.json({
      status: 'fail',
      data: {
        reason: 'No object id provided',
      },
    });
    return;
  }

  if (req.query.objectId.length !== 24) {
    res.status(400);
    res.json({
      status: 'fail',
      data: {
        reason: 'Improperly formatted objectId. Must be a string of 24 hex characters.',
      },
    });
    return;
  }

  try {
    const doc = await PaletteModel.findById(req.query.objectId);
    if (!doc) {
      res.status(400);
      res.json({
        status: 'fail',
        data: {
          reason: 'No palette with that id exists.',
        },
      });
      return;
    }

    res.json({
      status: 'success',
      data: {
        palette: {
          name: doc.name,
          swatches: doc.palette,
        },
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500);
    res.json({
      status: 'error',
      message: 'Unknown database error.',
    });
  }
});

app.listen(port, () => console.log(`⚡ Express is listening at http://localhost:${port}⚡`));
