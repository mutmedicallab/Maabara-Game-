// One place to control which illustrations show on which screen, and where.
// className controls both position and size -- not limited to corners,
// put these anywhere (top/bottom/left/right/center, any width).
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