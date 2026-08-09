const store = require('../models/store');

function getSettings(req, res) {
  res.json(store.settings);
}

function updateSettings(req, res) {
  const allowed = ['companyName','dotNumber','mcNumber','address','city','state','zip','phone','email',
    'defaultDriverPayType','defaultDriverPayPercent','currency','timezone','dateFormat'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  Object.assign(store.settings, payload);
  return res.json(store.settings);
}

module.exports = { getSettings, updateSettings };
