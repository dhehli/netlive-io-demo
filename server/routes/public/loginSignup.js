import express from 'express';
import passport from 'passport';
import passportConf from '../../helpers/passport'
const router = express.Router();

const folder = './public/'

router.get('/', (req, res) => {
  res.render(`${folder}/index`);
});

router.get('/login', (req, res) => {
  // render the page and pass in any flash data if it exists
  res.render(`${folder}/login`, {message: req.flash('loginMessage')});
});

// process the login form
router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

router.get('/signup', (req, res) => {
  // render the page and pass in any flash data if it exists
  res.render(`${folder}/signup`, {message: req.flash('signupMessage')});
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile', // redirect to the secure profile section
  failureRedirect: '/signup', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

export default router;
