import "dotenv/config";

const defaultOrigins = [
  "http://localhost:5173",
  "https://partypalace.vercel.app",
];

const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

export const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const localOriginPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

export const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  return (
    process.env.NODE_ENV !== "production" && localOriginPattern.test(origin)
  );
};

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

export const socketCorsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Socket CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
