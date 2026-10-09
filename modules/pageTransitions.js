// pageTransitions.js
// gsap + CustomEase + barba.js chargés via CDN Webflow (globaux)
// Lenis est optionnel et transmis depuis main.js (pas créé ici) ; ScrollTrigger est détecté automatiquement s'il est présent
// Boilerplate Osmo : transitions de page gérées par barba.js
// Transition : Page Name Wipe (Osmo Supply)

export function init({ onEnter, lenis } = {}) {
  if (typeof gsap === 'undefined' || typeof CustomEase === 'undefined' || typeof barba === 'undefined') return

  gsap.registerPlugin(CustomEase)

  history.scrollRestoration = 'manual'

  let nextPage = document
  let onceFunctionsInitialized = false

  // Lenis is created once in main.js and passed in here — creating a second
  // instance locally would run two conflicting rAF loops fighting over scroll.
  const hasLenis = !!lenis
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined'

  const rmMQ = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion = rmMQ.matches
  rmMQ.addEventListener?.('change', e => (reducedMotion = e.matches))
  rmMQ.addListener?.(e => (reducedMotion = e.matches))

  const has = (s) => !!nextPage.querySelector(s)

  const staggerDefault = 0.05
  const durationDefault = 0.6

  CustomEase.create('osmo', '0.625, 0.05, 0, 1')
  gsap.defaults({ ease: 'osmo', duration: durationDefault })

  // -----------------------------------------
  // FUNCTION REGISTRY
  // -----------------------------------------

  function initOnceFunctions() {
    if (onceFunctionsInitialized) return
    onceFunctionsInitialized = true

    // Runs once on first load
    // if (has('[data-something]')) initSomething()
  }

  function initBeforeEnterFunctions(next) {
    nextPage = next || document

    // Runs before the enter animation
    // if (has('[data-something]')) initSomething()
  }

  function initAfterEnterFunctions(next) {
    nextPage = next || document

    // Runs after enter animation completes — re-run the other modules on
    // the freshly swapped-in page content.
    onEnter?.(next)

    if (hasLenis) {
      lenis.resize()
    }

    if (hasScrollTrigger) {
      ScrollTrigger.refresh()

      // Images in the new page are often still loading when the modules
      // above measure the layout (hero reveals, pin distances, etc.), so
      // those measurements can be wrong until they finish. main.js's
      // window 'load' listener covers this for the very first page, but
      // barba-swapped pages never fire a native 'load' event — refresh
      // again once this page's own images are actually loaded.
      const pendingImages = Array.from(next.querySelectorAll('img')).filter((img) => !img.complete)
      if (pendingImages.length) {
        Promise.all(pendingImages.map((img) => new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true })
          img.addEventListener('error', resolve, { once: true })
        }))).then(() => ScrollTrigger.refresh())
      }
    }
  }

  // -----------------------------------------
  // PAGE TRANSITIONS
  // -----------------------------------------

  function runPageOnceAnimation(next) {
    const tl = gsap.timeline()

    tl.call(() => {
      resetPage(next)
    }, null, 0)

    return tl
  }

  function runPageLeaveAnimation(current, next) {
    const transitionWrap = document.querySelector('[data-transition-wrap]')
    const transitionPanel = transitionWrap.querySelector('[data-transition-panel]')
    const transitionLabel = transitionWrap.querySelector('[data-transition-label]')

    // Set the panel's color to match the incoming page before it becomes
    // visible, so it never flashes the previous page's color.
    applyThemeFrom(next)

    const tl = gsap.timeline({
      onComplete: () => { current.remove() }
    })

    if (reducedMotion) {
      // Immediate swap behavior if user prefers reduced motion
      return tl.set(current, { autoAlpha: 0 })
    }

    tl.set(transitionPanel, {
      autoAlpha: 1
    }, 0)

    tl.set(next, {
      autoAlpha: 0
    }, 0)

    tl.fromTo(transitionPanel, {
      yPercent: 0
    }, {
      yPercent: -100,
      duration: 0.8,
    }, 0)

    tl.fromTo(transitionLabel, {
      autoAlpha: 0
    }, {
      autoAlpha: 1
    }, '<+=0.2')

    tl.fromTo(current, {
      y: '0vh'
    }, {
      y: '-15vh',
      duration: 0.8,
    }, 0)

    return tl
  }

  function runPageEnterAnimation(next) {
    const transitionWrap = document.querySelector('[data-transition-wrap]')
    const transitionPanel = transitionWrap.querySelector('[data-transition-panel]')
    const transitionLabel = transitionWrap.querySelector('[data-transition-label]')

    const tl = gsap.timeline()

    if (reducedMotion) {
      // Immediate swap behavior if user prefers reduced motion
      tl.set(next, { autoAlpha: 1 })
      tl.add('pageReady')
      tl.call(resetPage, [next], 'pageReady')
      return new Promise(resolve => tl.call(resolve, null, 'pageReady'))
    }

    tl.add('startEnter', 1.25)

    tl.set(next, {
      autoAlpha: 1,
    }, 'startEnter')

    tl.fromTo(transitionPanel, {
      yPercent: -100,
    }, {
      yPercent: -200,
      duration: 1,
      overwrite: 'auto',
      immediateRender: false
    }, 'startEnter')

    tl.set(transitionPanel, {
      autoAlpha: 0
    }, '>')

    tl.fromTo(transitionLabel, {
      autoAlpha: 1
    }, {
      autoAlpha: 0,
      duration: 0.4,
      overwrite: 'auto',
      immediateRender: false
    }, 'startEnter+=0.1')

    tl.from(next, {
      y: '15vh',
      duration: 1,
    }, 'startEnter')

    tl.add('pageReady')
    tl.call(resetPage, [next], 'pageReady')

    return new Promise(resolve => {
      tl.call(resolve, null, 'pageReady')
    })
  }

  // -----------------------------------------
  // BARBA HOOKS + INIT
  // -----------------------------------------

  barba.hooks.beforeEnter(data => {
    // Position new container on top
    gsap.set(data.next.container, {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
    })

    if (lenis && typeof lenis.stop === 'function') {
      lenis.stop()
    }

    initBeforeEnterFunctions(data.next.container)
    applyThemeFrom(data.next.container)
  })

  barba.hooks.afterLeave(() => {
    if (hasScrollTrigger) {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  })

  barba.hooks.enter(data => {
    initBarbaNavUpdate(data)
  })

  barba.hooks.afterEnter(data => {
    // Run page functions
    initAfterEnterFunctions(data.next.container)

    // Settle
    if (hasLenis) {
      lenis.resize()
      lenis.start()
    }

    if (hasScrollTrigger) {
      ScrollTrigger.refresh()
    }
  })

  barba.init({
    debug: true, // Mettre à 'false' en prod
    timeout: 7000,
    preventRunning: true,
    transitions: [
      {
        name: 'default',
        sync: true,

        // First load
        async once(data) {
          initOnceFunctions()

          return runPageOnceAnimation(data.next.container)
        },

        // Current page leaves
        async leave(data) {
          return runPageLeaveAnimation(data.current.container, data.next.container)
        },

        // New page enters
        async enter(data) {
          return runPageEnterAnimation(data.next.container)
        }
      }
    ],
  })

  // -----------------------------------------
  // GENERIC + HELPERS
  // -----------------------------------------

  // Nav color only needs inverting for light/dark pages (for contrast).
  // Other page themes (blue, pink, ...) keep the default nav look.
  const navConfig = {
    light: 'dark',
    dark: 'light'
  }

  function applyThemeFrom(container) {
    const pageTheme = container?.dataset?.pageTheme || 'light'

    document.body.dataset.pageTheme = pageTheme

    // Sets data-theme-transition on the panel — the custom CSS in Webflow's
    // head targets [data-theme-transition="blue"/"pink"] (and its
    // [data-transition-label] svg descendant) off this same element.
    const transitionWrap = document.querySelector('[data-transition-wrap]')
    const transitionPanel = transitionWrap?.querySelector('[data-transition-panel]')
    if (transitionPanel) {
      transitionPanel.dataset.themeTransition = pageTheme
    }

    const nav = document.querySelector('[data-theme-nav]')
    if (nav) {
      nav.dataset.themeNav = navConfig[pageTheme] || navConfig.light
    }
  }

  function resetPage(container) {
    // window.scrollTo(0,0) directly would desync Lenis's own internal scroll
    // state from the native position — when lenis.start() resumes right
    // after, it can "correct" the scroll to wherever it still thinks it
    // should be, causing a second, silent scroll jump after ScrollTriggers
    // have already measured the page (what was making hero animations jump
    // right after a page transition). Going through Lenis keeps both in sync.
    if (hasLenis) {
      lenis.scrollTo(0, { immediate: true, force: true })
    } else {
      window.scrollTo(0, 0)
    }

    gsap.set(container, { clearProps: 'position,top,left,right' })

    if (hasLenis) {
      lenis.resize()
      lenis.start()
    }
  }

  function debounceOnWidthChange(fn, ms) {
    let last = innerWidth
    let timer
    return function (...args) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (innerWidth !== last) {
          last = innerWidth
          fn.apply(this, args)
        }
      }, ms)
    }
  }

  function initBarbaNavUpdate(data) {
    const tpl = document.createElement('template')
    tpl.innerHTML = data.next.html.trim()
    const nextNodes = tpl.content.querySelectorAll('[data-barba-update]')
    const currentNodes = document.querySelectorAll('nav [data-barba-update]')

    currentNodes.forEach((curr, index) => {
      const next = nextNodes[index]
      if (!next) return

      // Aria-current sync
      const newStatus = next.getAttribute('aria-current')
      if (newStatus !== null) {
        curr.setAttribute('aria-current', newStatus)
      } else {
        curr.removeAttribute('aria-current')
      }

      // Class list sync
      const newClassList = next.getAttribute('class') || ''
      curr.setAttribute('class', newClassList)
    })
  }

  // -----------------------------------------
  // YOUR FUNCTIONS GO BELOW HERE
  // -----------------------------------------
}
