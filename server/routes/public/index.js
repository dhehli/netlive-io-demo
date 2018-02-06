import express from 'express';
const router = express.Router();
import loginSignup from './loginSignup'
import forgotPassword from './forgotPassword'

router.use(loginSignup)
router.use(forgotPassword)


export default router;
