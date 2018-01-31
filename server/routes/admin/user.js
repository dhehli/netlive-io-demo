import express from 'express';
const router = express.Router();

const folder = './admin/'

router.get('/', (req, res) => {
  res.render(`${folder}/index`);
})

export default router;
