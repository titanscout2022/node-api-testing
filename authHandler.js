const { OAuth2Client } = require('google-auth-library');
const dbHandler = require('./dbHandler.js');

const CLIENT_ID = '291863698243-obu2fpbfpr7ul9db9lm7rmc1e4r3oeag.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
module.exports.checkAuth = async (req, res, next) => {
  const extUsers = ['Jon Abend', 'Robyn Abend', 'Dev Singh', 'Jacob Levine', 'Arthur Lu', 'Ian Fowler'];
  if (req.query.CLIENT_ID) {
    const isAuthorized = await dbHandler.checkKey(req.db, req.query.CLIENT_ID, req.query.CLIENT_SECRET);
    if (isAuthorized) {
      res.locals.id = 0;
      res.locals.name = 'API User';
    } else {
      res.status(401);
      res.json({
        success: false,
        reason: 'User could not be authenticated',
      });
    }
  } else {
    const ticket = await client.verifyIdToken({
      idToken: String(req.header('token')),
      audience: [CLIENT_ID, '291863698243-eg5i4fh001n7sl28b0bqgp4h2vae9gn2.apps.googleusercontent.com', '291863698243-ofnqubd0fh5dqfhjo368c39uto1fmudt.apps.googleusercontent.com', '291863698243-obu2fpbfpr7ul9db9lm7rmc1e4r3oeag.apps.googleusercontent.com', '291863698243-ovppseib28p6usahf60igsp7ia3ovq6l.apps.googleusercontent.com', '291863698243-0dsmvs8uetpd9odms7aqn63iknroi4op.apps.googleusercontent.com'],
      // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      // [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    }).catch((err) => { console.error(err); res.status(401); });
    try {
      const payload = ticket.getPayload();
      if (payload.hd === 'imsa.edu' || extUsers.indexOf(payload.name) > -1 || extUsers.indexOf(payload.sub) > -1) {
        res.locals.id = payload.sub;
        res.locals.name = payload.name;
        console.log(`Logged in ${res.locals.name} with ID ${res.locals.id}`);
      } else {
        res.status(401);
        res.json({
          success: false,
          reason: 'User is not part of imsa.edu domain',
        });
        throw new Error('User is not part of imsa.edu domain');
      }
    } catch (e) {
      console.error(`Could not get payload from ticket for reason: ${e}`);
      res.status(401);
      res.json({
        success: false,
        reason: 'User could not be authenticated',
      });
    }
  }
  next();
};

module.exports.noAPIKey = async (req, res, next) => {
  if (req.query.CLIENT_ID || req.query.CLIENT_SECRET) {
    res.status(401);
    res.json({ success: false, reason: 'This route does not allow authentication via API key' });
  }

  next();
};

// after this point, the token has now been verified as valid and 'res.locals.id'
// can be treated as a unique identifier for a google user.
