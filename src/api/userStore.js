const USER_STORAGE_KEY = "user";

export function getStoredUser() {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}
