"use client"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

/**
 * Shake the phone to put the grid back.
 *
 * Detection is three sharp jolts inside SHAKE_WINDOW_MS — one bump of a table
 * or a quick turn of the wrist is a single spike, a deliberate shake is a
 * burst — with a cooldown so one shake doesn't fire twice.
 *
 * Three things gate it on an iPhone, and all three have bitten:
 *
 * - **A secure page.** iOS only delivers motion to https (or localhost). On the
 *   dev server opened from a phone over http://192.168… there are no events
 *   at all — test on a deployed URL. `shakeAvailable()` says so, and the tour
 *   drops its shake step rather than promise something that can't work.
 * - **Permission**, which iOS only lets a page ask for from a tap. Asking on
 *   load would put a system dialog in front of someone who hasn't done
 *   anything, so it is asked at the two moments shake means something: when
 *   the tour ends or is skipped, a popup offers it (ThrowDemo), and the first
 *   swap or fling arms a request on the next tap (`armMotionPermission`).
 *   Before that popup existed, a visitor who skipped the tour and never
 *   rearranged a card was never asked — and got no motion events at all.
 * - **Not reduced motion.** It used to be off under Reduce Motion; a shake is
 *   the visitor's own gesture, not decoration, and the reset it triggers
 *   already honours the preference.
 */

/**
 * m/s², gravity excluded. A walk peaks around 5; a deliberate shake 12-30 — an
 * iPhone reads lower than the Android this was first tuned on, and 14 missed
 * ordinary shakes there.
 */
const SPIKE = 12
const SHAKE_SPIKES = 3
const SHAKE_WINDOW_MS = 1000
const SPIKE_GAP_MS = 80
const COOLDOWN_MS = 1500

type MotionPermission = { requestPermission?: () => Promise<"granted" | "denied"> }

const motionApi = () =>
  (window as unknown as { DeviceMotionEvent?: MotionPermission }).DeviceMotionEvent

/** Motion can reach this page at all: a secure context with the API present. */
export function shakeAvailable() {
  return typeof window !== "undefined" && window.isSecureContext && !!motionApi()
}

/**
 * "unneeded" everywhere but iOS; there it is "unknown" until the visitor
 * answers the prompt. Kept for the page's lifetime — iOS remembers the answer
 * for the session, and asking twice only re-shows a denial.
 */
type Permission = "unneeded" | "unknown" | "granted" | "denied"
let permission: Permission | null = null

/** Told when the permission is answered, so the listener can re-attach. */
const permissionListeners = new Set<() => void>()

export function motionPermission(): Permission {
  if (permission) return permission
  permission = typeof window !== "undefined" && motionApi()?.requestPermission ? "unknown" : "unneeded"
  return permission
}

/** A request is waiting on the next tap (armMotionPermission). */
let permissionArmed = false

/** The request in flight — an armed tap and the popup's ENABLE can land together. */
let asking: Promise<boolean> | null = null

/** Ask now. Must be called from a tap handler — iOS ignores it otherwise. */
export function requestMotionPermission(): Promise<boolean> {
  if (motionPermission() !== "unknown") return Promise.resolve(permission !== "denied")
  asking ??= ask().finally(() => { asking = null })
  return asking
}

async function ask(): Promise<boolean> {
  try {
    permission = (await motionApi()!.requestPermission!()) === "granted" ? "granted" : "denied"
  } catch {
    // Thrown, not answered: iOS refused to *ask*, because this didn't come
    // from a tap it counts. Recording that as a denial would end shake for
    // the visit without the visitor ever seeing a prompt — leave it open.
    permissionArmed = false
    return false
  }
  permissionListeners.forEach((fn) => fn())
  return permission === "granted"
}

/**
 * Ask on the visitor's next tap, if it still needs asking. Called after the
 * first swap or fling — the first moment a reset means something.
 */
export function armMotionPermission() {
  if (permissionArmed || motionPermission() !== "unknown") return
  permissionArmed = true
  // click, not pointerdown or touchend: iOS only honours the request from a
  // completed tap, and the touchend that ends a drag isn't one. Attached after
  // this event, so the gesture that armed it can't spend it.
  setTimeout(() => {
    window.addEventListener("click", () => { void requestMotionPermission() }, { once: true, capture: true })
  }, 0)
}

/**
 * What the sensor has reported, for the `?debug=shake` readout (ShakeDebug in
 * stage.tsx) — so a phone that won't shake can say why: no events at all
 * (insecure page / no permission), events but weak forces (threshold), or
 * spikes that never add up to a shake.
 */
export const shakeStats = { events: 0, lastForce: 0, maxForce: 0, spikes: 0, shakes: 0 }

export function useShake(onShake: () => void, enabled: boolean) {
  // The latest handler without re-subscribing the sensor on every render.
  const handler = useRef(onShake)
  useEffect(() => { handler.current = onShake }, [onShake])

  /*
    Re-attach once permission is answered. Some iOS versions only deliver
    motion to listeners added *after* the user allows it — one attached before
    the prompt stays silent for the life of the page.
  */
  const [answered, setAnswered] = useState(0)
  useEffect(() => {
    const bump = () => setAnswered((n) => n + 1)
    permissionListeners.add(bump)
    return () => { permissionListeners.delete(bump) }
  }, [])

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("DeviceMotionEvent" in window)) return

    let spikes: number[] = []
    let lastSpike = 0
    let lastShake = 0
    let prev: { x: number; y: number; z: number } | null = null

    const onMotion = (e: DeviceMotionEvent) => {
      const now = performance.now()
      let force: number

      // Prefer acceleration without gravity; some Android browsers only report
      // the version with it, where the change between readings is the signal.
      const a = e.acceleration
      if (a && a.x !== null && a.y !== null && a.z !== null) {
        force = Math.hypot(a.x, a.y, a.z)
      } else {
        const g = e.accelerationIncludingGravity
        if (!g || g.x === null || g.y === null || g.z === null) return
        const cur = { x: g.x, y: g.y, z: g.z }
        force = prev ? Math.hypot(cur.x - prev.x, cur.y - prev.y, cur.z - prev.z) : 0
        prev = cur
      }

      shakeStats.events++
      shakeStats.lastForce = force
      shakeStats.maxForce = Math.max(shakeStats.maxForce, force)

      if (force < SPIKE || now - lastSpike < SPIKE_GAP_MS) return
      lastSpike = now
      shakeStats.spikes++
      spikes = [...spikes.filter((t) => now - t < SHAKE_WINDOW_MS), now]
      if (spikes.length < SHAKE_SPIKES || now - lastShake < COOLDOWN_MS) return

      lastShake = now
      spikes = []
      shakeStats.shakes++
      handler.current()
    }

    window.addEventListener("devicemotion", onMotion)
    return () => window.removeEventListener("devicemotion", onMotion)
  }, [enabled, answered])
}

/**
 * `?debug=shake`: a small live readout of the motion pipeline, for diagnosing a
 * phone that won't shake. Not linked anywhere; renders nothing without the flag.
 * Its button asks for permission directly, so it can be tested in isolation.
 */
export function ShakeDebug({ enabled }: { enabled: boolean }) {
  const [, tick] = useState(0)
  // Through useSyncExternalStore, not a useState initializer: the server can't
  // see the URL, and reading it in the first client render made the markup
  // disagree with the server's — a hydration error.
  const on = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(location.search).get("debug") === "shake",
    () => false,
  )
  useEffect(() => {
    if (!on) return
    const id = setInterval(() => tick((n) => n + 1), 200)
    return () => clearInterval(id)
  }, [on])
  if (!on) return null

  const rows: [string, string][] = [
    ["secure page", String(window.isSecureContext)],
    ["motion api", String(!!motionApi())],
    ["permission", motionPermission()],
    ["listening", String(enabled)],
    ["events", String(shakeStats.events)],
    ["force now", shakeStats.lastForce.toFixed(1)],
    ["force max", `${shakeStats.maxForce.toFixed(1)} (need ${SPIKE})`],
    ["spikes", String(shakeStats.spikes)],
    ["shakes", String(shakeStats.shakes)],
  ]
  return (
    <div className="fixed top-2 start-2 z-[9995] bg-bg/90 border border-fg/40 p-2 font-mono text-[10px] text-fg leading-relaxed">
      {rows.map(([k, v]) => <div key={k}>{k}: <b>{v}</b></div>)}
      {motionPermission() === "unknown" && (
        <button
          type="button"
          onClick={() => { void requestMotionPermission() }}
          className="mt-1 border border-fg px-2 py-1"
        >
          ask permission
        </button>
      )}
    </div>
  )
}
