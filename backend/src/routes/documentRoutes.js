const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');

const router = express.Router();

router.use(requireAuth);

router.get('/', listDocuments);
router.post('/', createDocument);
router.get('/:id', getDocument);
router.patch('/:id', updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
