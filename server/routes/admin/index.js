import express from 'express';
const router = express.Router();
import user from './user'
import profile from './profile'

router.use(user)
router.use(profile)

export default router;
