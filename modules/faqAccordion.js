// faqAccordion.js
// gsap chargé via CDN Webflow (global)

export function init() {
  const setIcons = (accordion, isOpen) => {
    const plus  = accordion.querySelector('.faq_plus')
    const moins = accordion.querySelector('.faq_moins')
    if (plus) plus.style.display = isOpen ? 'none' : ''
    if (moins) moins.style.display = isOpen ? '' : 'none'
  }

  document.querySelectorAll('.faq_accordion').forEach((accordion) => {
    const question = accordion.querySelector('.faq_question')
    const answer   = accordion.querySelector('.faq_answer')
    if (!question || !answer) return

    gsap.set(answer, { height: 0, overflow: 'hidden' })

    const toggle = () => {
      const isOpen = accordion.classList.contains('is-open')

      document.querySelectorAll('.faq_accordion').forEach((a) => {
        if (a === accordion) return
        a.classList.remove('is-open')
        const ans = a.querySelector('.faq_answer')
        if (ans) gsap.to(ans, { height: 0, duration: 0.4, ease: 'power2.inOut' })
        setIcons(a, false)
      })

      if (isOpen) {
        accordion.classList.remove('is-open')
        gsap.to(answer, { height: 0, duration: 0.4, ease: 'power2.inOut' })
        setIcons(accordion, false)
      } else {
        accordion.classList.add('is-open')
        gsap.to(answer, { height: 'auto', duration: 0.4, ease: 'power2.inOut' })
        setIcons(accordion, true)
      }
    }

    question.addEventListener('click', toggle)
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggle()
      }
    })
  })
}
