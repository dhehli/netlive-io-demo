import config from 'config';
import express from 'express';
import passport from 'passport';
import crypto from 'crypto'
import database from '../../helpers/Database'
import passportConf from '../../helpers/passport'
const router = express.Router();
const mailgun = require('mailgun-js')(config.get('mailgun'));

const folder = './public/'

function redirectUserPermission(userPermissionId, res){
  if(userPermissionId === 1){
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

router.post('/forgotpassword', (req, res) => {
  const { email } = req.body;
  let hasError = false;

  const trimmedEmail = email && email.trim()

  if(!trimmedEmail || trimmedEmail.length === 0){
    hasError = true;
    req.flash('forgotPasswordMessage', 'No email');
  }

  if (hasError) {
    return res.redirect(`./forgotpassword`);
  }

  const hash = crypto.randomBytes(20).toString('hex');

  database.query("SELECT * FROM v_user WHERE email = ?", [email])
  .then(rows => {
    if (!rows.length){
      req.flash('forgotPasswordMessage', 'User not found');
      return res.redirect('./forgotpassword')
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
            <a href="http://localhost:8080/resetpassword/${hash}">Reset password</a>
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
    return res.redirect(`./forgotpassword`);
  })
  .catch(err => {
    throw err;
  })
});

router.get('/resetpassword/:hash', (req, res) => {
  const hash = req.params.hash;
  let showForm = false;

  database.query(`
    SELECT TIMESTAMPDIFF(MINUTE, created, now()) as minuteDiff, forgotpassword_id, created, isActivated
    FROM v_user_forgotpassword
    WHERE
    hash = ?`, [hash])
  .then(rows => {
    if (!rows.length){
      req.flash('resetPasswordMessage', 'Invalid Link');
      return
      
    }else {
      const { minuteDiff, isActivated } = rows[0];

      if(isActivated){
        req.flash('resetPasswordMessage', 'Link already used');
        return
      }

      if(minuteDiff > 60){
        req.flash('resetPasswordMessage', 'Link expired');
        return
      }
      showForm = true;
      return rows[0]
    }
  })
  .then(row => {
    if(row){
      req.flash('resetPasswordSuccess', 'Password successfully reseted');
    }
  })
  .catch(err => {
    throw err
  })

  res.render(`${folder}/resetpassword`, {
    showForm: showForm,
    message: req.flash('resetPasswordMessage'),
    messageSuccess: req.flash('resetPasswordSuccess'),
  });
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
    return res.redirect(`./resetpassword`);
  }
 /*
  database.query("SELECT user SET password = ? WHERE user_id = ? ", [
    bcrypt.hashSync(trimmedPassword, null, null),
    req.user.user_id
  ])
  .then(rows => {
    req.flash('messagesSuccessPassword','Password updated')

    return res.redirect(`./profile`);
  })
  .catch(err => {
    throw err
  })*/
})


router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

export default router;
