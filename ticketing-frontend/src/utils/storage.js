const TOKEN_KEY = 'ticketing_token';
const USER_KEY  = 'ticketing_user';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser:  () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};