// Auto-scrolling strip of project screenshots.
// The list is rendered twice so the -50% translate in @keyframes marquee loops seamlessly.
// Speed comes from --marquee-speed so it can run slower on narrow screens, where less
// of the strip is visible at once.
export function WorkMarquee({ images, alt }: { images: string[]; alt: string }) {
  const loop = [...images, ...images]

  return (
    <div className="overflow-hidden border border-hairline bg-bg group [--marquee-speed:38s] md:[--marquee-speed:26s]">
      <div
        className="flex w-max motion-reduce:animate-none group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused]"
        style={{
          animationName: "marquee",
          animationDuration: "var(--marquee-speed)",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {loop.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="shrink-0 aspect-[16/10] h-[clamp(172px,19vw,270px)] border-r border-hairline"
          >
            <img
              src={src}
              alt={i < images.length ? `${alt} — view ${i + 1}` : ""}
              aria-hidden={i >= images.length}
              className="w-full h-full object-cover object-top"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
