export const ironOptions = {
  cookieName: "inventory-manager_user-access-cookie",
  password: process.env.IRON_SESSION_PASSWORD,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};