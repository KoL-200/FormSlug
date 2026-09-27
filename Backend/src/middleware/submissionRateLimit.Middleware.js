const { perFormRateLimit, perIpRateLimit } = require('../lib/rateLimiter');
const { writeAuditLog } = require('../utils/auditLog');

const submissionRateLimit = async (req, res, next) => {
  const ipKey = req.ip;
  const slug = req.params.slug;

  const [ipResult, formResult] = await Promise.all([
    perIpRateLimit.limit(ipKey),
    perFormRateLimit.limit(slug),
  ]);

  if (!ipResult.success || !formResult.success) {
    await writeAuditLog({
      userId: null,
      action: 'rate_limit.triggered',
      metadata: {
        slug,
        ipAddress: req.ip,
        limitType: !ipResult.success ? 'ip' : 'form',
      },
      ipAddress: req.ip,
    });
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  next();
};

module.exports = submissionRateLimit;