"use client"
import { useEffect, useRef } from "react"

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
 *   anything, so it is asked at the two moments shake means something: the
 *   tour's shake step offers a "turn on" button (`requestMotionPermission`),
 *   and the first swap or fling arms a request on the next tap
 *   (`armMotionPermission`).
 * - **Not reduced motion.** It used to be off under Reduce Motion; a shake is
 *   the visitor's own gesture, not decoration, and the reset it triggers
 *   already honours the preference.
 */

/** m/s², gravity excluded. A walk peaks around 5, a deliberate shake 15-30. */
const SPIKE = 14
const SHAKE_SPIKES = 3
const SHAKE_WINDOW_MS = 900
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

export function motionPermission(): Permission {
  if (permission) return permission
  permission = typeof window !== "undefined" && motionApi()?.requestPermission ? "unknown" : "unneeded"
  return permission
}

/** Ask now. Must be called from a tap handler — iOS ignores it otherwise. */
export async function requestMotionPermission(): Promise<boolean> {
  if (motionPermission() !== "unknown") return permission !== "denied"
  try {
    permission = (await motionApi()!.requestPermission!()) === "granted" ? "granted" : "denied"
  } catch {
    permission = "denied"
  }
  return permission === "granted"
}

let permissionArmed = false

/**
 * Ask on the visitor's next tap, if it still needs asking. Called after the
 * first swap or fling — the first moment a reset means something.
 */
export function armMotionPermission() {
  if (permissionArmed || motionPermission() !== "unknown") return
  permissionArmed = true
  // touchend, not pointerdown: iOS only honours the request from a completed
  // user gesture.
  window.addEventListener("touchend", () => { void requestMotionPermission() }, { once: true, passive: true })
}

export function useShake(onShake: () => void, enabled: boolean) {
  // The latest handler without re-subscribing the sensor on every render.
  const handler = useRef(onShake)
  useEffect(() => { handler.current = onShake }, [onShake])

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

      if (force < SPIKE || now - lastSpike < SPIKE_GAP_MS) return
      lastSpike = now
      spikes = [...spikes.filter((t) => now - t < SHAKE_WINDOW_MS), now]
      if (spikes.length < SHAKE_SPIKES || now - lastShake < COOLDOWN_MS) return

      lastShake = now
      spikes = []
      handler.current()
    }

    window.addEventListener("devicemotion", onMotion)
    return () => window.removeEventListener("devicemotion", onMotion)
  }, [enabled])
}
