export const getUserValue = (user, keys) => {
  for (const key of keys) {
    const value = user?.[key];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }

  return "-";
};