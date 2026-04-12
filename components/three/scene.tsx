"use client"

import { useRef, RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera, Text } from "@react-three/drei"
import * as THREE from "three"

const FONT_URL = "/fonts/BarlowCondensed-Black.ttf"
const FG = "#f0f0f0"
const BG = "#0a0a0a"

const R_Y = 0.25

const Z_START = 15
const Z_RANGE = 48

const SEC = {
  hero:       0,
  manifesto: -35,
}

const OCCLUDER_Z = -0.5

const pAt     = (z: number) => (Z_START - z) / Z_RANGE
const ss      = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

function getRX(width: number) {
  if (width < 480) return 0.6
  if (width < 768) return 1.8
  return 3.9
}

function getHeroSize(width: number) {
  if (width < 480) return 1.2
  if (width < 768) return 1.8
  return 3.2
}

function getManifestoSize(width: number) {
  if (width < 480) return 0.95
  if (width < 768) return 1.3
  return 2.2
}

function samplePath(p: number, rX: number): [number, number] {
  const path = [
    { p: 0,                  x: 0,  y: 0   },
    { p: pAt(SEC.hero),      x: rX, y: R_Y },
    { p: pAt(SEC.manifesto), x: rX, y: R_Y },
  ]
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1]
    if (p <= b.p) {
      const t = ss(clamp01((p - a.p) / (b.p - a.p)))
      return [a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)]
    }
  }
  const last = path[path.length - 1]
  return [last.x, last.y]
}

function CameraRig({ progressRef }: { progressRef: RefObject<number> }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null)

  useFrame(({ size }) => {
    if (!camRef.current) return
    const p  = progressRef.current ?? 0
    const rX = getRX(size.width)
    const [x, y] = samplePath(p, rX)
    const z = Z_START - p * Z_RANGE
    camRef.current.position.set(x, y, z)
    camRef.current.lookAt(x, y, z - 1)
  })

  return (
    <PerspectiveCamera
      ref={camRef} makeDefault
      fov={55} near={0.1} far={200}
      position={[0, 0, Z_START]}
    />
  )
}

function World() {
  const { size } = useThree()
  const rX             = getRX(size.width)
  const heroSize       = getHeroSize(size.width)
  const manifestoSize  = getManifestoSize(size.width)

  return <>
    <mesh position={[0, 0, OCCLUDER_Z]}>
      <planeGeometry args={[500, 300]} />
      <meshBasicMaterial color={BG} />
    </mesh>

    <Text
      font={FONT_URL} fontSize={heroSize} color={FG}
      anchorX="center" anchorY="middle"
      position={[0, 0, SEC.hero]} letterSpacing={0.08}
    >MIKEL MRAD</Text>

    <Text
      font={FONT_URL} fontSize={manifestoSize} color={FG}
      anchorX="center" anchorY="middle" textAlign="center"
      position={[rX, R_Y, SEC.manifesto]}
      letterSpacing={-0.02} lineHeight={0.95}
    >{"COMMERCE, INTERFACES,\nAND THE DETAILS IN BETWEEN."}</Text>
  </>
}

export function Scene({ progressRef }: { progressRef: RefObject<number> }) {
  return (
    <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
      <color attach="background" args={[BG]} />
      <CameraRig progressRef={progressRef} />
      <World />
    </Canvas>
  )
}
