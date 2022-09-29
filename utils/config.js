// ttlInSeconds represents the buffer that is subtracted to account for server processing
const ttlInSeconds = 60;
// Give user additional 60 seconds, which will be later subtracted by the server
// User has 3 hours (60s * 60min * 3hr) of being logged in before they have to re-login
const dayInSeconds = (60 * 60 * 3) + ttlInSeconds;
export const ironOptions = {
  cookieName: "inventory-manager_user-access-cookie",
  password: process.env.IRON_SESSION_PASSWORD,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    maxAge: dayInSeconds,
    secure: process.env.NODE_ENV === "production"
  },
};