// Bold color-block backgrounds per screen, Kahoot-style -- the page canvas
// itself carries saturated color instead of a neutral background; white
// lab-panel cards sit on top and stay readable regardless.
export const PAGE_GRADIENTS = {
  lobby: 'bg-gradient-to-br from-violet to-violet-dim',
  question: 'bg-gradient-to-br from-violet to-safranin',
  results: 'bg-gradient-to-br from-culture to-amber',
  join: 'bg-gradient-to-br from-amber to-safranin',
}

export const ILLUSTRATIONS = {
  home: [
    { src: '/images/rocket-boy-8.png', className: 'absolute -top-10 -right-14 w-48 sm:w-72 md:w-96' },
    { src: '/images/bunny-4.png', className: 'absolute -bottom-10 -left-14 w-40 sm:w-60 md:w-80' },
  ],
  join: [
    { src: '/images/alien-1-28.png', className: 'absolute -top-8 -left-8 w-36 sm:w-52 md:w-64' },
  ],
  lobby: [
    { src: '/images/meditation-74.png', className: 'absolute top-4 right-2 w-32 sm:w-48 md:w-60' },
  ],
  question: [
    { src: '/images/superman-42.png', className: 'absolute -bottom-4 -right-8 w-36 sm:w-52 md:w-64' },
  ],
  results: [
    { src: '/images/team-success-5-73.png', className: 'absolute -top-4 left-1/2 -translate-x-1/2 w-56 sm:w-80 md:w-96' },
  ],
}