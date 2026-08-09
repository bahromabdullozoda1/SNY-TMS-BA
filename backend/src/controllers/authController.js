const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const store = require('../models/store');

function buildToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: '12h' }
  );
}

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (store.users.some((u) => u.email === email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: store.nextId('users'),
    name,
    email,
    password: hashedPassword,
    role
  };

  store.users.push(user);

  return res.status(201).json({
    token: buildToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = store.users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    token: buildToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

module.exports = {
  register,
  login
};
