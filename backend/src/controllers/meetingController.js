const { z } = require('zod');
const meetingService = require('../services/meetingService');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  date: z.string().min(1, 'Date is required').max(100),
  time: z.string().min(1, 'Time is required').max(100),
  attendees: z.number().int().nonnegative().optional().default(1),
  join_link: z.string().url('Invalid URL format').optional().or(z.literal(''))
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  date: z.string().min(1).max(100).optional(),
  time: z.string().min(1).max(100).optional(),
  attendees: z.number().int().nonnegative().optional(),
  join_link: z.string().url('Invalid URL format').optional().or(z.literal(''))
});

const filterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

const listMeetings = async (req, res, next) => {
  try {
    const { page, limit } = filterSchema.parse(req.query);
    const result = await meetingService.listMeetings(req.user.id, { page, limit });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.getMeeting(req.params.id, req.user.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });
    res.json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

const createMeeting = async (req, res, next) => {
  try {
    const fields = createSchema.parse(req.body);
    const meeting = await meetingService.createMeeting(req.user.id, fields);
    res.status(201).json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

const updateMeeting = async (req, res, next) => {
  try {
    const fields = updateSchema.parse(req.body);
    const existing = await meetingService.getMeeting(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Meeting not found' });
    const meeting = await meetingService.updateMeeting(req.params.id, req.user.id, fields);
    res.json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

const deleteMeeting = async (req, res, next) => {
  try {
    const existing = await meetingService.getMeeting(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Meeting not found' });
    await meetingService.deleteMeeting(req.params.id, req.user.id);
    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = {
  listMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting
};
