import express from 'express';
const router = express.Router();

const folder = './admin'

router.get('/', (req, res) => {
  res.render(`${folder}/index`, {
    user : req.user
  });
})

export default router;
