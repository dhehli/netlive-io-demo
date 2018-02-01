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
const port = process.env.PORT || 8080;
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

app.use(publicRoutes);
/*app.use('/member', memberRoutes);
app.use('/admin', adminRoutes);*/

// launch ======================================================================
app.listen(port);
console.log(`The magic happens on port ${port}`);
