export function Marquee({ text, speed = 35 }: { text: string; speed?: number }) {
  const items = Array.from({ length: 16 })
  return (
    <div className="overflow-hidden border-y border-hairline py-3.5 select-none bg-bg" aria-hidden>
      <div
        className="flex whitespace-nowrap"
        style={{ animation: `marquee ${speed}s linear infinite`, width: "max-content" }}
      >
        {items.map((_, i) => (
          <span key={i} className="font-mono text-[10px] uppercase tracking-[0.32em] text-mid px-10">
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}
