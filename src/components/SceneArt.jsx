// Renders a set of decorative illustrations for the current screen.
// Purely visual -- sits behind real content and never intercepts clicks.
// The parent element needs `relative overflow-hidden` for this to sit
// correctly (see Home.jsx / Host.jsx / Join.jsx wrappers).
export default function SceneArt({ items = [] }) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
      {items.map((item, i) => (
        <img key={i} src={item.src} alt="" className={`${item.className} opacity-90`} />
      ))}
    </div>
  )
}