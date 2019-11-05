export const fetchFromLocalStorage = key => {
  try {
    return JSON.parse(localStorage.getItem(key)) || {}
  } catch (e) {
    return {}
  }
}
