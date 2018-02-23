import config from 'config';
import express from 'express';
import passport from 'passport';
import crypto from 'crypto'
import bcrypt from 'bcrypt-nodejs';
import database from '../../helpers/Database'
import passportConf from '../../helpers/passport'

const router = express.Router();
const mailgun = require('mailgun-js')(config.get('mailgun'));

const folder = './public'


router.post('/forgotpassword', (req, res) => {
  const { email } = req.body;
  let hasError = false;

  const trimmedEmail = email && email.trim()

  if(!trimmedEmail || trimmedEmail.length === 0){
    hasError = true;
    req.flash('forgotPasswordMessage', 'No email');
  }

  if (hasError) {
    return res.redirect(`/forgotpassword`);
  }

  const hash = crypto.randomBytes(20).toString('hex');

  database.query("SELECT * FROM v_user WHERE email = ?", [email])
  .then(rows => {
    if (!rows.length){
      req.flash('forgotPasswordMessage', 'User not found');
      return res.redirect('/forgotpassword')
    }
    return rows[0];
  })
  .then(row => {
    return row && database.query("INSERT INTO user_forgotpassword (email, hash) VALUES(?,?)", [
      email,
      hash
    ])
  })
  .then(insertedRow => {
    if(insertedRow){
      const data = {
        from: `${config.get('defaultMail')}`,
        to: `${email}`,
        subject: 'Forgot password link ',
        html: `
          <p>
            You used the forgot password function on netlive-io.<br>
            Pleae use the following link to reset your password
          <p>
          <p>
            <a href="${config.get('domain')}/resetpassword/${hash}">Reset password</a>
          </p>
        `
      }
      return mailgun.messages().send(data)
    }
  })
  .then(success => {
    if(success){
      req.flash('forgotPasswordSuccess', 'Mail sent. Please check your E-Mail.');
    }
    return res.redirect(`/forgotpassword`);
  })
  .catch(err => console.error(err))
});

function isResetPasswordHashValid(hash, req){
  return database.query(`
    SELECT TIMESTAMPDIFF(MINUTE, created, now()) as minuteDiff, forgotpassword_id, created, isActivated, email
    FROM v_user_forgotpassword
    WHERE
    hash = ?`, [hash])
  .then(rows => {
    if (!rows.length){
      req.flash('resetPasswordMessage', 'Invalid Link');
      return false;

    }else {
      const { minuteDiff, isActivated } = rows[0];

      if(isActivated){
        req.flash('resetPasswordMessage', 'Link already used');
        return false
      }

      if(minuteDiff > 60){
        req.flash('resetPasswordMessage', 'Link expired');
        return false;
      }

      return rows[0]
    }
  })
  .catch(err => {
    throw err
  })
}

router.get('/resetpassword/:hash', (req, res) => {
  const hash = req.params.hash;
  let showForm = false;

  isResetPasswordHashValid(hash, req)
  .then(result => {
    if(result){
      showForm = true;
    }
    return res.render(`${folder}/resetpassword`, {
      hash: hash,
      showForm: showForm,
      message: req.flash('resetPasswordMessage'),
      messageSuccess: req.flash('resetPasswordSuccess'),
    });
  })
  .catch(err => console.error(err))
})

router.post('/resetpassword/:hash', (req, res) => {
  const hash = req.params.hash;

  const { password, confirmPassword } = req.body;
  let hasError = false;

  const trimmedPassword = password && password.trim()
  const trimmedConfirmPassword = confirmPassword && confirmPassword.trim()

  if(!trimmedPassword || trimmedPassword.length === 0){
    hasError = true;
    req.flash('resetPasswordMessage', 'No password');
  }

  if(!trimmedConfirmPassword || trimmedConfirmPassword.length === 0){
    hasError = true;
    req.flash('resetPasswordMessage', 'No confirm password');
  }

  if (trimmedPassword !== trimmedConfirmPassword) {
    hasError = true;
    req.flash('resetPasswordMessage', 'Passwords do not match');
  }

  if (hasError) {
    return res.redirect(`/resetpassword/${hash}`);
  }

  let email = "";

  isResetPasswordHashValid(hash, req)
  .then(result => {
    if(result){
      email = result.email;
      return database.query("UPDATE user SET password = ? WHERE email = ?", [
        bcrypt.hashSync(trimmedPassword, null, null),
        result.email
      ])
    }
  })
  .then(updated => {
    if(updated){
      return database.query("UPDATE user_forgotpassword SET isActivated = ? WHERE email = ?", [
        1,
        email
      ])
      req.flash('resetPasswordSuccess', 'Password successfully updated')
    }
  })
  .then(() => {
    return res.redirect(`/resetpasswordfinish`);
  })
  .catch(err => console.error(err))
})

router.get('/resetpasswordfinish', (req, res) => {
  res.render(`${folder}/forgotpasswordFinish`);
})

export default router;
