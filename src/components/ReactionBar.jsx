const EMOJIS = ['👍', '😂', '😮', '🎉', '🔥', '😢']

export default function ReactionBar({ onSend }) {
  return (
    <div className="flex justify-center gap-2 flex-wrap">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSend(emoji)}
          className="text-2xl w-12 h-12 flex items-center justify-center lab-panel hover:bg-violet/10 active:scale-90 transition-transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}