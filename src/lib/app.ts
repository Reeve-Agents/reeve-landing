/** The Reeve app (owner studio and owner app). Every visit there starts at its sign-in page. */
const APP_URL = (import.meta.env.VITE_APP_URL as string | undefined) ?? "https://reeve-web-delta.vercel.app";

export const SIGN_IN_URL = `${APP_URL}/?view=masuk`;
/** Opens the sign-in page with "create an account" already open. */
export const START_URL = `${APP_URL}/?view=masuk&new=1`;
