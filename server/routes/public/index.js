import express from 'express';
const router = express.Router();
import loginSignup from './loginSignup'

router.use(loginSignup)

export default router;
