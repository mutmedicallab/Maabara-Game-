// Wraps a page in a full-bleed background photo. Content (your existing
// white lab-panel cards) sits on top and stays perfectly readable since
// the cards are opaque -- only the empty space around them shows the photo.
export default function PageBackground({ image, children }) {
  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="fixed inset-0 -z-10 bg-paper/78" />
      {children}
    </div>
  )
}