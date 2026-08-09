const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

function listDocuments(req, res) {
  const { linkedType, linkedId, type } = req.query;
  let items = [...store.documents];
  if (linkedType) items = items.filter((d) => d.linkedType === linkedType);
  if (linkedId) items = items.filter((d) => d.linkedId === Number(linkedId));
  if (type) items = items.filter((d) => d.type === type);
  res.json(items);
}

function createDocument(req, res) {
  const allowed = ['name','type','linkedType','linkedId','notes','size','mimeType'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  if (payload.linkedId) payload.linkedId = Number(payload.linkedId);

  const item = { id: store.nextId('documents'), ...payload, uploadedAt: new Date().toISOString() };
  store.documents.push(item);
  notifyClients({ type: 'document.created', payload: item });
  return res.status(201).json(item);
}

function deleteDocument(req, res) {
  const id = Number(req.params.id);
  const idx = store.documents.findIndex((d) => d.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Document not found' });
  const [deleted] = store.documents.splice(idx, 1);
  notifyClients({ type: 'document.deleted', payload: { id: deleted.id } });
  return res.status(204).send();
}

module.exports = { listDocuments, createDocument, deleteDocument };
