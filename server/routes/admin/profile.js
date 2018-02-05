import express from 'express';
import database from '../../helpers/Database';
import bcrypt from 'bcrypt-nodejs';

const router = express.Router();
const folder = './admin/'

router.get('/profile', (req, res) => {
  return res.render(`${folder}/profileedit`, {
    user : req.user,
    messages: req.flash('messages'),
    messagesSuccess: req.flash('messagesSuccess'),
    messagesPassword: req.flash('messagesPassword'),
    messagesSuccessPassword: req.flash('messagesSuccessPassword')
  });
})

router.post('/profile', (req, res) => {
  const { salutation, firstname, lastname, email } = req.body;
  let hasError = false;

  const trimmedSalutation = salutation && salutation.trim()
  const trimmedFirstname = firstname && firstname.trim()
  const trimmedLastname = lastname && lastname.trim()
  const trimmedEmail = email && email.trim()

  if(!trimmedSalutation || trimmedSalutation.length === 0){
    hasError = true;
    req.flash('messages', 'No Salutation');
  }

  if(!trimmedFirstname || trimmedFirstname.length === 0){
    hasError = true;
    req.flash('messages', 'No Firstname');
  }

  if(!trimmedLastname || trimmedLastname.length === 0){
    hasError = true;
    req.flash('messages', 'No Lastname');
  }

  if(!trimmedEmail || trimmedEmail.length === 0){
    hasError = true;
    req.flash('messages', 'No email');
  }

  if (hasError) {
    return res.redirect(`./profile`);
  }

  const user = {
    salutation_id: trimmedSalutation,
    firstname: trimmedFirstname,
    lastname: trimmedLastname,
    email: trimmedEmail
  }

  database.query("UPDATE user SET salutation_id = ?, firstname = ?, lastname = ?, email = ? WHERE user_id = ? ", [
    trimmedSalutation,
    trimmedFirstname,
    trimmedLastname,
    trimmedEmail,
    req.user.user_id,
  ])
  .then(rows => {
    req.user = user;
    req.flash('messagesSuccess','User updated')

    return res.redirect(`./profile`);
  })
  .catch(err => {
    throw err
  })
})

router.post('/changepassword', (req, res) => {
  const { password, confirmPassword } = req.body;

  let hasError = false;

  const trimmedPassword = password && password.trim()
  const trimmedConfirmPassword = confirmPassword && confirmPassword.trim()

  if(!trimmedPassword || trimmedPassword.length === 0){
    hasError = true;
    req.flash('messagesPassword', 'No password');
  }

  if(!trimmedConfirmPassword || trimmedConfirmPassword.length === 0){
    hasError = true;
    req.flash('messagesPassword', 'No confirm password');
  }

  if (trimmedPassword !== trimmedConfirmPassword) {
    hasError = true;
    req.flash('messagesPassword', 'Passwords do not match');
  }

  if (hasError) {
    return res.redirect(`./profile`);
  }

  database.query("UPDATE user SET password = ? WHERE user_id = ? ", [
    bcrypt.hashSync(trimmedPassword, null, null),
    req.user.user_id
  ])
  .then(rows => {
    req.flash('messagesSuccessPassword','Password updated')

    return res.redirect(`./profile`);
  })
  .catch(err => {
    throw err
  })
})

export default router;
