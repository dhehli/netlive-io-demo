import express from 'express';
import database from '../../helpers/Database';

const router = express.Router();
const folder = './admin/'

router.get('/profile', (req, res) => {
  res.render(`${folder}/profileedit`, {
    user : req.user
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
    return res.redirect(`${folder}/profileedit`, {
      user : req.user,
      messages: req.flash('messages')
    });
  }

  database.query("UPDATE user SET salutation_id = ?, firstname = ?, lastname = ?, email = ? WHERE user_id = ? ", [
    trimmedSalutation,
    trimmedFirstname,
    trimmedLastname,
    trimmedEmail,
    req.user.user_id,
  ])
  .then(rows => {
    res.render(`${folder}/profileedit`, {
      user : req.user,
      messageSuccess: req.flash("messageSuccess")
    });
  })
  .catch(err => {
    throw err
  })


})

export default router;
