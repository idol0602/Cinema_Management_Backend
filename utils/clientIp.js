const IPV6_LOCALHOST = "::1";
const IPV6_MAPPED_PREFIX = "::ffff:";

export const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0]?.trim()
      : "";

  const rawIp =
    forwardedIp ||
    req.ip ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "";

  if (!rawIp) {
    return "127.0.0.1";
  }

  if (rawIp === IPV6_LOCALHOST) {
    return "127.0.0.1";
  }

  if (rawIp.startsWith(IPV6_MAPPED_PREFIX)) {
    return rawIp.slice(IPV6_MAPPED_PREFIX.length);
  }

  return rawIp;
};
