// One place to control every background photo in the app.
//
// Defaults use Lorem Picsum (https://picsum.photos) -- free, no API key,
// safe to hotlink, and stable forever per seed (same seed = same photo
// every time). Content is essentially random nature/architecture
// photography though, not guaranteed to match the label.
//
// To use a SPECIFIC photo instead (a particular landscape, animal, etc.):
// go to unsplash.com or pexels.com, find the photo, right-click it ->
// "Copy image address", and paste that URL in below instead. Both sites'
// photos are free to hotlink under their respective licenses.
export const BACKGROUNDS = {
  home: 'https://picsum.photos/seed/titerup-home/1600/1200',
  lobby: 'https://picsum.photos/seed/titerup-lobby/1600/1200',
  question: 'https://picsum.photos/seed/titerup-question/1600/1200',
  results: 'https://picsum.photos/seed/titerup-results/1600/1200',
  join: 'https://picsum.photos/seed/titerup-join/1600/1200',
}