/**
 * Fetches the specified key from localStorage and uses
 * the defaultVal if no key exists or if parsing fails.
 *
 * @param key - The localStorage key to fetch values from.
 * @param defaultVal - The value to use should it not exist or fail to parse.
 * @returns {{}|any}
 */
export const fetchFromLocalStorage = (key, defaultVal = {}) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? defaultVal
  } catch (e) {
    return defaultVal
  }
}

/**
 * Stores the value under the key in localStorage.
 *
 * @param key - The localStorage key to use.
 * @param value - The value to store.
 */
export const storeToLocalStorage = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value))

export const replacer = (key, value) => {
  if (key === 'pubMachine') {
    return undefined
  }

  return value
}
