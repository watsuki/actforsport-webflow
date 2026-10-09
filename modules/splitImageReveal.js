// splitImageReveal.js
// gsap + ScrollTrigger chargés via CDN Webflow (globaux)
// Reproduit l'interaction Webflow native "Layout 413 Image..." :
// .split_image-wrapper démarre à 200% de largeur (état initial, déborde de
// sa colonne) et rétrécit à 100% (sa taille normale dans la grille) quand il
// entre dans le viewport. Le texte ne bouge jamais, seule l'image change.
// Joue vers l'avant en arrivant dans la section par le haut. Reste figée à
// 100% si on continue de descendre (ne se réinitialise pas en douce). Ne
// revient à 200% que si on remonte au-dessus de la section — prête à se
// rejouer la prochaine fois qu'on y revient par le haut. Pas de scrub.
// Durée 1.4s + easing "Out Quart" (≈ power3.out en GSAP), comme dans Webflow.

export function init() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)

  document.querySelectorAll('.split_component').forEach((component) => {
    const wrapper = component.querySelector('.split_image-wrapper')
    if (!wrapper) return

    // Appliqué tout de suite : l'image doit déjà être "en grand" dès le
    // premier rendu de la page, pas seulement une fois qu'on a scrollé.
    gsap.set(wrapper, { width: '200%' })

    // ScrollTrigger évalue la position de scroll actuelle dès sa création —
    // si l'image est déjà visible au chargement (ex: page Contact), l'anim
    // se jouerait instantanément sans interaction. On attend donc le premier
    // vrai scroll de l'utilisateur avant de créer le trigger.
    const createTrigger = () => {
      gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 80%',
          // Sans end explicite, GSAP se base sur toute la hauteur du wrapper
          // pour savoir quand il "quitte" la zone — il fallait remonter au-delà
          // de toute l'image avant que le retour à 200% se déclenche. On
          // resserre la zone pour que l'aller-retour se joue près du même point.
          end: 'top 20%',
          toggleActions: 'play none none reverse'
          // markers: true, // décommente pour voir les repères de déclenchement pendant les réglages
        }
      }).to(wrapper, {
        width: '100%',
        duration: 1.4,
        ease: 'power3.out'
      })
    }

    window.addEventListener('scroll', createTrigger, { once: true, passive: true })
  })
}
