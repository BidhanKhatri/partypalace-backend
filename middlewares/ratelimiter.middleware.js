// token bucket algorithm implementation for rate limiting

const buckets = new Map();

export function rateLimit({ bucketSize, refillRate }) {
  return (req, res, next) => {
    // Unique key: userId (if logged in) OR IP address
    const key = (req.user && req.user._id?.toString()) || req.ip || "unknown";

    const now = Date.now();

    if (!buckets.has(key)) {
      buckets.set(key, {
        tokens: bucketSize,
        lastRefill: now,
      });
    }

    const bucket = buckets.get(key);

    // Refill tokens
    const elapsed = (now - bucket.lastRefill) / 1000;
    const refill = elapsed * refillRate;

    bucket.tokens = Math.min(bucketSize, bucket.tokens + refill);
    bucket.lastRefill = now;

    // If bucket has token → allow
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return next();
    }

    // Too many requests
    return res.status(429).json({
      rateLimited: true,
      message: "Too many requests. Please wait.",
      tokensLeft: bucket.tokens,
    });
  };
}
