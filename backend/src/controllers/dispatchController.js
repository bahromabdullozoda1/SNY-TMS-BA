const store = require('../models/store');

function getBoard(req, res) {
  const { weekStart } = req.query;
  res.json({
    weekStart: weekStart || new Date().toISOString().slice(0, 10),
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    drivers: store.drivers,
    loads: store.loads
  });
}

module.exports = { getBoard };
