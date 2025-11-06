const express = require('express');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const db = require('../models');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' }
});

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: (process.env.NODE_ENV || '').startsWith('prod'),
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: '/',
};

function signToken(user) {
  const payload = { sub: user.id, role: user.role, email: user.email, name: user.name };
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

router.post('/register', authLimiter, async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const { name, email, password } = value;
  const existing = await db.User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.User.create({ name, email, passwordHash, role: 'user' });
  const token = signToken(user);
  res.cookie('token', token, cookieOptions);
  return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

router.post('/login', loginLimiter, async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const { email, password } = value;
  const user = await db.User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  await user.update({ lastLoginAt: new Date() });
  const token = signToken(user);
  res.cookie('token', token, cookieOptions);
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

router.post('/logout', auth(false), (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 });
  return res.json({ message: 'Logged out' });
});

router.get('/me', auth(true), async (req, res) => {
  const user = await db.User.findByPk(req.user.id, { attributes: ['id', 'name', 'email', 'role', 'lastLoginAt'] });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
});

module.exports = router;


