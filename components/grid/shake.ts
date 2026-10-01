"use client"
import { useEffect, useRef } from "react"

/**
 * Shake the phone to put the grid back.
 *
 * Detection is three sharp jolts inside SHAKE_WINDOW_MS — one bump of a table
 * or a quick turn of the wrist is a single spike, a deliberate shake is a
 * burst — with a cooldown so one shake doesn't fire twice.
 *
 * iOS hides motion events behind a permission prompt that may only be raised
 * from a tap. Asking on page load would put a system dialog in front of a
 * visitor who hasn't done anything yet, so the stage arms `armMotionPermission`
 * once a card has been rearranged — the first moment a reset means something —
 * and the prompt appears on the tap after that.
 */

/** m/s², gravity excluded. A walk peaks around 5, a deliberate shake 15-30. */
const SPIKE = 14
const SHAKE_SPIKES = 3
const SHAKE_WINDOW_MS = 900
const SPIKE_GAP_MS = 80
const COOLDOWN_MS = 1500

type MotionPermission = { requestPermission?: () => Promise<"granted" | "denied"> }

let permissionArmed = false

/**
 * On iOS, ask for motion access on the visitor's next tap. A no-op everywhere
 * else (Android and desktop browsers need no permission), and only ever once.
 */
export function armMotionPermission() {
  if (permissionArmed || typeof window === "undefined") return
  const DME = (window as unknown as { DeviceMotionEvent?: MotionPermission }).DeviceMotionEvent
  if (!DME?.requestPermission) return
  permissionArmed = true
  const ask = () => { DME.requestPermission?.().catch(() => { /* dismissed */ }) }
  // touchend, not pointerdown: iOS only honours the request from a completed
  // user gesture.
  window.addEventListener("touchend", ask, { once: true, passive: true })
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
