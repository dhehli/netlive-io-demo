import config from 'config'
import express from 'express';
import passport from 'passport';
import flash from 'connect-flash';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';

import database from './helpers/Database';
import publicRoutes from './routes/public/index.js'

const app = express();
const port = process.env.PORT || 8080;
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine', 'ejs'); // set up ejs for templating
app.use(express.static('public')); // Folder for public files

// required for passport
app.use(session(config.get("session")))
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// middleware
// route middleware to make sure a user is logged in
function isMember(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();
  // if they aren't redirect them to the home page
  res.redirect('/');
}

app.use(publicRoutes);

/*
app.get('/products', (req,res) => {
  database.query( 'SELECT * FROM produkte' )
  .then( rows => {
    return res.send(rows);
  })
  .catch(err => console.log(err));
});

app.get('/products/:id', (req,res) => {
  const id = req.params.id;

  database.query( `
    SELECT *
    FROM
    produkte
    where produkt_id = ${id}`
  )
  .then( rows => {
    return res.send(rows);
  })
  .catch(err => console.log(err));;
})

app.post('/products', (req,res) => {
  const { produktname, preis, onlinestatus_id } = req.body;

  database.query( `
    INSERT INTO
    produkte
    VALUES(
      NULL,
      "${produktname}",
      ${preis},
      ${onlinestatus_id}
    )`
  )
  .then( rows => {
    return res.send(rows);
  })
  .catch(err => console.log(err));
})

app.put('/products/:id', (req,res) => {
  const id = req.params.id;
  const { produktname, preis, onlinestatus_id } = req.body;

  database.query( `
    UPDATE produkte
    SET
    produktname='${produktname}',
    preis=${preis},
    onlinestatus_id='${onlinestatus_id}'
    WHERE produkt_id=${id}`
  )
  .then( rows => {
    return res.send(rows);
  })
  .catch(err => console.log(err));
})*/


// launch ======================================================================
app.listen(port);
console.log(`The magic happens on port ${port}`);
