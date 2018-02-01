// config/passport.js
import passport from 'passport';
// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
import bcrypt from 'bcrypt-nodejs';
import database from './Database';

// expose this function to our app using module.exports

// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session
passport.serializeUser((user, done) => done(null, user.user_id));

// used to deserialize the user
passport.deserializeUser((id, done) => {
  database.query("SELECT * FROM user WHERE user_id = ? ", [id])
  .then(rows => done(null,rows[0]))
  .catch(err => done(err,null))
});

// =========================================================================
// LOCAL SIGNUP ============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-signup', new LocalStrategy({
  // by default, local strategy uses username and password, we will override with email
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true // allows us to pass back the entire request to the callback
}, (req, email, password, done) => {
  database.query("SELECT * FROM user WHERE email = ?", [email]).then(rows => {
    if (rows.length) {
      return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
    } else {
      // if there is no user with that email
      // create the user
      const newUserMysql = {
        email: email,
        password: bcrypt.hashSync(password, null, null), // use the generateHash function in our user model
        userstateId: 1, // TODO: should this be here or on database default value
        userpermission: 1
      };

      const insertQuery = "INSERT INTO user ( email, password, userstate_id, userpermission_id ) values (?,?,?,?)";

      database.query(insertQuery, [newUserMysql.email, newUserMysql.password, newUserMysql.userstateId, newUserMysql.userpermission]).then(rows => {
        newUserMysql.user_id = rows.insertId;
        return done(null, newUserMysql);
      }).catch(err => done(null, newUserMysql));
    }
  }).catch(err => done(err))
}));

// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-login', new LocalStrategy({
  // by default, local strategy uses username and password, we will override with email
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true // allows us to pass back the entire request to the callback
}, (req, email, password, done) => { // callback with email and password from our form
  database.query("SELECT * FROM user WHERE email = ?", [email]).then(rows => {
    if (!rows.length) {
      return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
    }
    // if the user is found but the password is wrong
    if (!bcrypt.compareSync(password, rows[0].password))
      return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

    // all is well, return successful user
    return done(null, rows[0]);
  }).catch(err => done(err))
}));

export default passport;
