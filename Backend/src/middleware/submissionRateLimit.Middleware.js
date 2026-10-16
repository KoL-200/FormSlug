const { perFormRateLimit, perIpRateLimit } = require('../lib/rateLimiter');
const { writeAuditLog } = require('../utils/auditLog');

const submissionRateLimit = async (req, res, next) => {
  // in test environment, skip rate limiting entirely
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const ipKey = req.ip;
  const slug = req.params.slug;

  try {
    const [ipResult, formResult] = await Promise.all([
      perIpRateLimit.limit(ipKey),
      perFormRateLimit.limit(slug),
    ]);

    if (!ipResult.success || !formResult.success) {
      await writeAuditLog({
        userId: null,
        action: 'rate_limit.triggered',
        metadata: { slug, ipAddress: req.ip, limitType: !ipResult.success ? 'ip' : 'form' },
        ipAddress: req.ip,
      });
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
  } catch (err) {
    // Redis unavailable — log but allow the request through
    // Rate limiting is a best-effort defense, not a hard dependency
    console.error('Rate limiter error — allowing request through:', err.message);
  }

  next();
};

module.exports = submissionRateLimit;