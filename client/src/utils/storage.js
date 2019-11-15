export const fetchFromLocalStorage = key => {
  try {
    return JSON.parse(localStorage.getItem(key)) || {}
  } catch (e) {
    return {}
  }
}

export const replacer = (key, value) => {
  if (key === 'pubMachine') {
    return undefined
  }

  return value
}
