// Production FTYP only. Bootstrap owns dropdown/carousel behavior; retain the
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

  window.j2gSearchSelector = (requested) => {
    const remember = requested === 'sch' || requested === 'j2g'
    if (remember) mode = requested
    mode = mode === 'sch' ? 'sch' : 'j2g'
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
      // Startup must not shadow later shared-site choices. Remember only an
      // explicit FTYP selection; never rewrite another application's store.
      if (remember) localStorage.setItem(modeKey, mode)
    } catch (_) {
      /* Optional preference. */
    }
  }
  window.j2gOnSubmitActions = () => Boolean(input.value.trim())
  form.addEventListener('submit', (event) => {
    if (!window.j2gOnSubmitActions()) event.preventDefault()
  })
  window.j2gSearchSelector()

  // The production header has separate desktop and mobile menus. Its existing
  // native hamburger/resize handlers remain in the reviewed navbar fragment.
  for (const navbar of document.querySelectorAll('#header2023, #stack-nav')) {
    navbar.addEventListener('shown.bs.dropdown', (event) => {
      event.target.parentElement.classList.add('open')
    })
    navbar.addEventListener('hidden.bs.dropdown', (event) => {
      event.target.parentElement.classList.remove('open')
    })
    navbar.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((el) => {
      el.setAttribute('data-bs-display', 'static')
    })
    navbar.querySelectorAll('.dropdown-menu a').forEach((el) => {
      el.classList.add('dropdown-item')
    })
  }
})()
