import express from 'express';
const router = express.Router();

const folder = './member/'

router.get('/', (req, res) => {
  res.render(`${folder}/index`);
})

export default router;
