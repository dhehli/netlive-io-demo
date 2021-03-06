import config from 'config';
import express from 'express';
import passport from 'passport';
import passportConf from '../../helpers/passport'

const router = express.Router();
const mailgun = require('mailgun-js')(config.get('mailgun'));

const folder = './public'

function redirectUserPermission(userPermissionId, res){
  if(userPermissionId === 1){ // TODO: this numbers are hard to understand move to enum
    return res.redirect('/member');
  }else if (userPermissionId === 2 || userPermissionId === 3) {
    return res.redirect('/admin');
  }else {
    throw "no recocgnized user permission"
  }
}

router.get('/', (req, res) => {
  res.render(`${folder}/index`);
});

router.get('/login', (req, res) => {
  // render the page and pass in any flash data if it exists
  res.render(`${folder}/login`, {message: req.flash('loginMessage')});
});

// process the login form
router.post('/login', passport.authenticate('local-login', {
  failureRedirect : '/login', // redirect back to the signup page if there is an error,
  failureFlash : true // allow flash messages
}), (req, res) => {
  const { userpermission_id } = req.user;
  redirectUserPermission(userpermission_id, res);
});

router.get('/signup', (req, res) => {
  // render the page and pass in any flash data if it exists
  res.render(`${folder}/signup`, {message: req.flash('signupMessage')});
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
  failureRedirect: '/signup', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}), (req, res) => {
  const { userpermission_id } = req.user;
  redirectUserPermission(userpermission_id, res);
});

router.get('/forgotpassword', (req, res) => {
  // render the page and pass in any flash data if it exists
  res.render(`${folder}/forgotpassword`, {
    message: req.flash('forgotPasswordMessage'),
    messageSuccess: req.flash('forgotPasswordSuccess'),
  });
});

export default router;
