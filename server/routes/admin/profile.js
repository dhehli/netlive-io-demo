import express from 'express';
import database from '../../helpers/Database';

const router = express.Router();
const folder = './admin/'

router.get('/profile', (req, res) => {
  res.render(`${folder}/profileedit`, {
    user : req.user,
    messages: req.flash('error'),
    messagesSuccess: req.flash('messageSuccess')
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
    req.flash('error', 'No Salutation');
  }

  if(!trimmedFirstname || trimmedFirstname.length === 0){
    hasError = true;
    req.flash('error', 'No Firstname');
  }

  if(!trimmedLastname || trimmedLastname.length === 0){
    hasError = true;
    req.flash('error', 'No Lastname');
  }

  if(!trimmedEmail || trimmedEmail.length === 0){
    hasError = true;
    req.flash('error', 'No email');
  }

  if (hasError) {
    return res.redirect(`${folder}/profileedit`, {
      user : req.user,
      messages: req.flash('error'),
      messagesSuccess: req.flash('messageSuccess')
    });
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
    return res.render(`${folder}/profileedit`, {
      user : req.user,
      messages: req.flash('error'),
      messagesSuccess: req.flash('messageSuccess')
    });
  })
  .catch(err => {
    throw err
  })
})

router.post('/changepassword', (req, res) => {
  const { password, confirmPasword } = req.body;

  let hasError = false;

  const trimmedPassword = trimmedPassword && trimmedPassword.trim()
  const trimmedConfirmPassword = trimmedConfirmPassword && trimmedConfirmPassword.trim()

  if(!trimmedPassword || trimmedPassword.length === 0){
    hasError = true;
    req.flash('messagesPassword', 'No password');
  }

  if(!trimmedConfirmPassword || trimmedConfirmPassword.length === 0){
    hasError = true;
    req.flash('messagesPassword', 'No confirm password');
  }

  if (hasError) {
    return res.redirect(`${folder}/profileedit`, {
      user : req.user,
      messages: req.flash('error'),
      messagesSuccess: req.flash('messageSuccess')
    });
  }
})

export default router;
