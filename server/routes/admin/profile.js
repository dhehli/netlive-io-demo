import express from 'express';
const router = express.Router();

const folder = './admin/'

router.get('/profile', (req, res) => {
  res.render(`${folder}/profileedit`, {
    user : req.user
  });
})

export default router;
