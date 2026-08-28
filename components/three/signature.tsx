"use client"
import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

/**
 * The one WebGL module: a field of arrows that all turn to face the cursor.
 *
 * It tracks the pointer across the whole page, not just inside the card, so the
 * field reacts while you're reading anything else — and each arrow eases toward
 * its target rather than snapping, so moving the mouse drags a wave through the
 * grid. Arrows near the cursor swell slightly; a slow ripple keeps the field
 * alive when the pointer is still.
 *
 * Drawn as raw line segments (3 per arrow) so it matches the site's hairline
 * weight, and it is monochrome like everything else.
 */

const COLS = 30
const ROWS = 12
const COUNT = COLS * ROWS
/** shaft + two barbs */
const SEGS = 3
const VERTS = SEGS * 2

/** Arrow in local space, pointing along +X. */
const SHAPE: [number, number][][] = [
  [[-0.5, 0], [0.42, 0]],
  [[0.42, 0], [0.1, 0.24]],
  [[0.42, 0], [0.1, -0.24]],
]

function Arrows({ paused }: { paused: boolean }) {
  const lines = useRef<THREE.LineSegments>(null)
  const gl = useThree((s) => s.gl)

  /** Cursor in page coordinates, kept off-render. */
  const cursor = useRef({ x: -9999, y: -9999 })

  /**
   * Per-arrow easing state, so the field lags the pointer instead of snapping.
   * A ref, not useMemo — the React Compiler rules forbid mutating a hook's
   * return value, and this is written every frame.
   */
  const anglesRef = useRef<Float32Array | null>(null)
  anglesRef.current ??= new Float32Array(COUNT)

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * VERTS * 3), 3))
    return g
  }, [])

  useEffect(() => {
    // Page-wide, so the field follows the cursor even when it's over other cards.
    const onMove = (e: PointerEvent) => { cursor.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  useFrame((state) => {
    if (paused || !lines.current) return
    const t = state.clock.elapsedTime
    const { width: vw, height: vh } = state.viewport

    const stepX = vw / COLS
    const stepY = vh / ROWS
    const size = Math.min(stepX, stepY) * 0.82

    /*
      Measured every frame, deliberately. Caching it on mount is wrong: the card
      enters under a scatter transform of up to ±1400px, so a rect read then is
      pinned to the entrance position — and a ResizeObserver never corrects it,
      because the card's *size* never changes, only its position. That offset
      made every arrow point the same wrong way.
    */
    const r = gl.domElement.getBoundingClientRect()
    let px: number, py: number
    if (r.width > 0 && cursor.current.x > -9998) {
      px = ((cursor.current.x - r.left) / r.width - 0.5) * vw
      py = -((cursor.current.y - r.top) / r.height - 0.5) * vh
    } else {
      px = Math.cos(t * 0.4) * vw * 0.3
      py = Math.sin(t * 0.4) * vh * 0.3
    }

    const angles = anglesRef.current!
    const attr = lines.current.geometry.attributes.position
    const arr = attr.array as Float32Array
    let o = 0

    for (let iy = 0; iy < ROWS; iy++) {
      const cy = (iy + 0.5) * stepY - vh / 2
      for (let ix = 0; ix < COLS; ix++) {
        const cx = (ix + 0.5) * stepX - vw / 2
        const i = iy * COLS + ix

        const dx = px - cx
        const dy = py - cy
        // A slow ripple so the field still breathes with the pointer at rest.
        const target = Math.atan2(dy, cx === px && cy === py ? 0.0001 : dx)
          + Math.sin(t * 0.7 + cx * 0.35 + cy * 0.3) * 0.1

        // Ease along the shortest arc, or arrows spin the long way past ±π.
        let delta = target - angles[i]
        while (delta > Math.PI) delta -= Math.PI * 2
        while (delta < -Math.PI) delta += Math.PI * 2
        angles[i] += delta * 0.14

        const a = angles[i]
        const dist = Math.hypot(dx, dy)
        const swell = 1 + Math.exp(-(dist * dist) / (vw * 0.09)) * 0.55
        const s = size * swell
        const cos = Math.cos(a) * s
        const sin = Math.sin(a) * s

        for (const seg of SHAPE) {
          for (const [lx, ly] of seg) {
            arr[o]     = cx + lx * cos - ly * sin
            arr[o + 1] = cy + lx * sin + ly * cos
            arr[o + 2] = 0
            o += 3
          }
        }
      }
    }
    attr.needsUpdate = true
  })

  return (
    <lineSegments ref={lines} geometry={geometry}>
      <lineBasicMaterial color="#ffffff" />
    </lineSegments>
  )
}

export function Signature({ paused = false }: { paused?: boolean }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        frameloop={paused ? "never" : "always"}
        orthographic
        camera={{ position: [0, 0, 10], zoom: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        dpr={[1, 1.75]}
      >
        <Arrows paused={paused} />
      </Canvas>

      {/* Vignette so the field dissolves into the card rather than ending flat. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 72% 78% at 50% 50%, transparent 40%, var(--color-card) 100%)",
        }}
      />
    </div>
  )
}
