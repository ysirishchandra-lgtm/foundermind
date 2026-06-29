const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  listMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting
} = require('../controllers/meetingController');

const router = express.Router();

router.use(requireAuth);

router.get('/', listMeetings);
router.post('/', createMeeting);
router.get('/:id', getMeeting);
router.patch('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);

module.exports = router;
