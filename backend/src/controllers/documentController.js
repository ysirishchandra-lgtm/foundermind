const { z } = require('zod');
const documentService = require('../services/documentService');

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.string().min(1, 'Type is required').max(50),
  size: z.string().min(1, 'Size is required').max(50),
  content: z.string().optional()
});

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.string().min(1).max(50).optional(),
  size: z.string().min(1).max(50).optional(),
  content: z.string().optional()
});

const filterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

const listDocuments = async (req, res, next) => {
  try {
    const { page, limit } = filterSchema.parse(req.query);
    const result = await documentService.listDocuments(req.user.id, { page, limit });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getDocument = async (req, res, next) => {
  try {
    const doc = await documentService.getDocument(req.params.id, req.user.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const createDocument = async (req, res, next) => {
  try {
    const fields = createSchema.parse(req.body);
    const doc = await documentService.createDocument(req.user.id, fields);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const updateDocument = async (req, res, next) => {
  try {
    const fields = updateSchema.parse(req.body);
    const existing = await documentService.getDocument(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Document not found' });
    const doc = await documentService.updateDocument(req.params.id, req.user.id, fields);
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const deleteDocument = async (req, res, next) => {
  try {
    const existing = await documentService.getDocument(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Document not found' });
    await documentService.deleteDocument(req.params.id, req.user.id);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument
};
