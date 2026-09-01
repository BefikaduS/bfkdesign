const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('combined'));

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.CONTACT_LIMIT_PER_HOUR || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact submissions. Please try again later.' }
});

function sanitizeString(value) {
  return String(value ?? '').trim().replace(/[<>]/g, '');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'bfkdesign' });
});

app.get('/metrics', (req, res) => {
  const memoryUsageMb = Math.round((process.memoryUsage().rss / 1024 / 1024) * 10) / 10;
  const uptimeSeconds = Math.round(process.uptime());

  res.json({
    ok: true,
    uptimeSeconds,
    memoryUsageMb,
    platform: process.platform,
    nodeVersion: process.version
  });
});

app.post('/api/contact', contactLimiter, (req, res) => {
  const name = sanitizeString(req.body.name);
  const email = sanitizeString(req.body.email);
  const message = sanitizeString(req.body.message);
  const botcheck = sanitizeString(req.body.botcheck || '');

  if (botcheck) {
    return res.status(400).json({ error: 'Bad request' });
  }

  if (!name || !email || !message || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid contact form payload' });
  }

  if (message.length < 10 || message.length > 2000) {
    return res.status(400).json({ error: 'Message length is invalid' });
  }

  return res.status(200).json({
    ok: true,
    message: 'Thanks! Your message has been sent. We will reply within 24 hours.'
  });
});

app.use(express.static(__dirname, {
  index: false,
  redirect: false
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Bfkdesign server listening on http://localhost:${port}`);
});
