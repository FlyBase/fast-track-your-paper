// Standalone preview only. Bootstrap owns dropdown/collapse behavior; retain the
// existing header's CSS and inline search-mode API without legacy shared scripts.
;(() => {
  const form = document.getElementById('j2g_search_form')
  const input = document.getElementById('GeneSearch')
  const selector = document.getElementById('GeneSearchSlct')
  if (!form || !input || !selector)
    throw new Error('Expected the FTYP search header')
  const modeKey = 'ftyp-header-search-mode'
  let mode = 'j2g'
  try {
    const saved = localStorage.getItem(modeKey)
    // Read the old preference once; never rewrite another application's store.
    if (saved === 'sch' || saved === 'j2g') mode = saved
    else {
      const legacy = JSON.parse(localStorage.getItem('simpleStorage') || '{}')
      mode = legacy?.FlyBase_session?.j2g || mode
    }
  } catch (_) {
    /* Storage is optional in private browsing. */
  }

  window.j2gSearchSelector = (requested = mode) => {
    mode = requested === 'sch' ? 'sch' : 'j2g'
    const genejump = mode === 'j2g'
    input.placeholder = genejump ? 'Jump to Gene' : 'Search FlyBase'
    input.name = genejump ? 'context' : 'query'
    selector.value = mode
    form.setAttribute('action', genejump ? '/cgi-bin/uniquery.pl' : '/search/')
    form.querySelectorAll('[name="caller"]').forEach((el) => {
      el.disabled = !genejump
    })
    // The historical template has an empty hidden query field. Avoid duplicate
    // query parameters when the visible field is switched into search mode.
    form
      .querySelectorAll('input[type="hidden"][name="query"]')
      .forEach((el) => {
        el.disabled = true
      })
    try {
      localStorage.setItem(modeKey, mode)
    } catch (_) {
      /* Optional preference. */
    }
  }
  window.j2gOnSubmitActions = () => Boolean(input.value.trim())
  form.addEventListener('submit', (event) => {
    if (!window.j2gOnSubmitActions()) event.preventDefault()
  })
  window.j2gSearchSelector()

  const navbar = selector.closest('nav')
  // Bootstrap 5 uses .show; the frozen FlyBase header stylesheet uses .open/.in.
  // Mirror only completed events, so a cancelled toggle never changes styling.
  navbar.addEventListener('shown.bs.dropdown', (event) => {
    event.target.parentElement.classList.add('open')
  })
  navbar.addEventListener('hidden.bs.dropdown', (event) => {
    event.target.parentElement.classList.remove('open')
  })
  navbar.addEventListener('shown.bs.collapse', (event) =>
    event.target.classList.add('in')
  )
  navbar.addEventListener('hidden.bs.collapse', (event) =>
    event.target.classList.remove('in')
  )
  navbar.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((el) => {
    el.setAttribute('data-bs-display', 'static')
  })
  navbar
    .querySelectorAll('.dropdown-menu a')
    .forEach((el) => el.classList.add('dropdown-item'))
})()
