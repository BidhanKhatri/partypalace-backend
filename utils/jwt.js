import crypto from "node:crypto";

const base64UrlEncode = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const base64UrlDecode = (value) =>
  JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

const parseExpiresIn = (expiresIn) => {
  if (typeof expiresIn === "number") return expiresIn;

  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) throw new Error("Invalid token expiration format");

  const amount = Number(match[1]);
  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  return amount * multipliers[match[2]];
};

const signPayload = (data, secret) =>
  crypto.createHmac("sha256", secret).update(data).digest("base64url");

export const signToken = (payload, secret, options = {}) => {
  if (!secret) throw new Error("JWT_SECRET is required");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: now,
  };

  if (options.expiresIn) {
    body.exp = now + parseExpiresIn(options.expiresIn);
  }

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(body)}`;
  const signature = signPayload(unsignedToken, secret);

  return `${unsignedToken}.${signature}`;
};

export const verifyToken = (token, secret) => {
  if (!secret) throw new Error("JWT_SECRET is required");

  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid token");
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signPayload(unsignedToken, secret);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token signature");
  }

  const payload = base64UrlDecode(encodedPayload);

  if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) {
    throw new Error("Token expired");
  }

  return payload;
};
