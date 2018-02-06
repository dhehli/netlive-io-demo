import config from 'config'
import express from 'express';
import passport from 'passport';
import flash from 'connect-flash';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';

import database from './helpers/Database';
import publicRoutes from './routes/public/index'
import memberRoutes from './routes/member/index'
import adminRoutes from './routes/admin/index'

const app = express();
const port = process.env.PORT || 3000;
app.use(morgan('dev'));
app.use(cookieParser()); // read cookies (needed for auth
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

// middleware
// route middleware to make sure a user has admin right
function isAdmin(req, res, next) {
  // if user is authenticated in the session, carry on
  // TODO: numbers hard to understand move to enum
  if (req.isAuthenticated() && (req.user.userpermission_id === 2 || req.user.userpermission_id === 3))
    return next();
  // if they aren't redirect them to the home page
  res.redirect('/');
}

function isSuperAdmin(req, res, next){
  // if user is authenticated in the session, carry on
  // TODO: numbers hard to understand move to enum
  if (req.isAuthenticated() && req.user.userpermission_id === 3)
    return next();
  // if they aren't redirect them to the home page
  res.redirect('/');
}


app.use(publicRoutes);
app.use('/member', isMember, memberRoutes);
app.use('/admin',  isAdmin, adminRoutes);

app.get('*', (req, res) => {
  console.log("not found");
  res.render(`./shared/404.ejs`);
});

// launch ======================================================================
app.listen(port);
console.log(`The magic happens on port ${port}`);
