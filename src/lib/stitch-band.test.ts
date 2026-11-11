import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  cosineDistance,
  detectChangeBand,
  detectEdgeBand,
  segmentBySignature,
} from './stitch-band.ts'
import { bandSignature, rgbaToProfile } from './stitch-pixels.ts'
import { compareFileNames, formatTimestamp, planStitch } from './stitch-plan.ts'
import { sampleCountForDuration, sampleTimes } from './stitch-video.ts'

function flat(rows: number, value: number, from: number, to: number, alt: number): Float64Array {
  const profile = new Float64Array(rows).fill(value)
  for (let i = from; i < to; i++) profile[i] = alt
  return profile
}

describe('change band', () => {
  it('keeps the rows that differ and leaves the repeated chrome out', () => {
    const rows = 100
    const base = new Float64Array(rows).fill(40)
    const changed = flat(rows, 40, 70, 85, 220)
    const changedAgain = flat(rows, 40, 70, 85, 20)
    const detected = detectChangeBand([base, changed, changedAgain])
    assert.ok(detected)
    assert.ok(detected.band.top > 0.6 && detected.band.top < 0.75)
    assert.ok(detected.band.height > 0.1 && detected.band.height < 0.28)
    assert.ok(detected.confidence > 0.4)
  })

  it('finds the scrolling middle of a chat and not the header or footer', () => {
    const rows = 100
    const frames = [0, 1, 2].map((index) => {
      const profile = new Float64Array(rows).fill(30)
      for (let y = 20; y < 80; y++) profile[y] = 80 + index * 40 + (y % 5)
      return profile
    })
    const detected = detectChangeBand(frames)
    assert.ok(detected)
    assert.ok(detected.band.top > 0.12 && detected.band.top < 0.28)
    assert.ok(detected.band.top + detected.band.height < 0.9)
    assert.ok(detected.band.top + detected.band.height > 0.72)
  })

  it('joins two short lines of changed text into one strip', () => {
    const rows = 180
    const frames = [0, 1, 2].map((shift) => {
      const profile = new Float64Array(rows).fill(200)
      for (let y = 37; y <= 40; y++) profile[y] = 40 + shift * 30 + y
      for (let y = 57; y <= 59; y++) profile[y] = 80 + shift * 25
      return profile
    })
    const detected = detectChangeBand(frames)
    assert.ok(detected)
    assert.ok(detected.band.top > 0.12 && detected.band.top < 0.24)
    const bottom = detected.band.top + detected.band.height
    assert.ok(bottom > 0.32 && bottom < 0.45)
  })

  it('returns null when every row is the same', () => {
    const profile = new Float64Array(40).fill(12)
    assert.equal(detectChangeBand([profile, new Float64Array(profile)]), null)
    assert.equal(detectChangeBand([profile]), null)
  })
})

describe('edge band and line changes', () => {
  it('keeps both lines of a two-line caption', () => {
    const rows = 180
    const profile = new Float64Array(rows).fill(2)
    for (let y = 140; y < 147; y++) profile[y] = 80
    for (let y = 156; y < 163; y++) profile[y] = 70
    const detected = detectEdgeBand([profile, profile, profile])
    assert.ok(detected)
    assert.ok(detected.band.top < 140 / rows)
    assert.ok(detected.band.top + detected.band.height > 163 / rows)
    assert.ok(detected.band.height < 0.3)
  })

  it('finds a stable high-energy strip', () => {
    const rows = 180
    const quiet = new Float64Array(rows).fill(2)
    const loud = new Float64Array(quiet)
    for (let y = 150; y < 168; y++) loud[y] = 80
    const detected = detectEdgeBand([loud, loud, loud])
    assert.ok(detected)
    assert.ok(detected.band.top > 0.75)
    assert.ok(detected.band.height < 0.2)
  })

  it('splits a clip where the glyph pattern changes and ignores a single flicker', () => {
    const axis = (index: number) => {
      const vector = new Float64Array(8)
      vector[index] = 1
      return vector
    }
    const signatures = [
      axis(0),
      axis(0),
      axis(0),
      axis(1),
      axis(1),
      axis(1),
      axis(2),
      axis(2),
    ]
    const contrasts = [1, 3, 2, 1, 4, 2, 1, 5]
    const segments = segmentBySignature(signatures, contrasts)
    assert.equal(segments.length, 3)
    assert.deepEqual(
      segments.map((segment) => segment.pick),
      [1, 4, 7],
    )
    const flickered = [
      axis(0),
      axis(0),
      axis(0),
      axis(7),
      axis(0),
      axis(0),
      axis(1),
      axis(1),
      axis(1),
    ]
    const flickeredSegments = segmentBySignature(flickered, flickered.map(() => 1))
    assert.equal(flickeredSegments.length, 2)
    assert.equal(flickeredSegments[0].start, 0)
    assert.ok(flickeredSegments[0].end >= 4)
    const trailing = [axis(0), axis(0), axis(0), axis(0), axis(7)]
    assert.equal(segmentBySignature(trailing, trailing.map(() => 1)).length, 1)
    const trailingLine = [axis(0), axis(0), axis(0), axis(1), axis(1)]
    assert.equal(segmentBySignature(trailingLine, trailingLine.map(() => 1)).length, 2)
    assert.ok(cosineDistance(axis(0), axis(1)) > 0.9)
    assert.ok(cosineDistance(axis(0), axis(0)) < 0.001)
  })

  it('reads a different signature when the strokes in the band change', () => {
    const width = 32
    const height = 16
    const paint = (shift: number) => {
      const data = new Uint8ClampedArray(width * height * 4)
      for (let y = 10; y < 14; y++) {
        for (let x = 0; x < width; x++) {
          const on = (x + shift) % 4 === 0
          const offset = (y * width + x) * 4
          const value = on ? 250 : 10
          data[offset] = value
          data[offset + 1] = value
          data[offset + 2] = value
          data[offset + 3] = 255
        }
      }
      return rgbaToProfile(data, width, height)
    }
    const first = paint(0)
    const second = paint(2)
    const band = { top: 10 / height, height: 4 / height }
    const a = bandSignature(first.gray, width, height, band)
    const b = bandSignature(second.gray, width, height, band)
    assert.ok(a.contrast > 1)
    assert.ok(cosineDistance(a.vector, b.vector) > 0.15)
  })
})

describe('stitch plan', () => {
  it('keeps the first frame whole and crops the next to the band', () => {
    const plan = planStitch({
      frames: [
        { width: 100, height: 200, caption: false },
        { width: 100, height: 200, caption: true },
      ],
      mode: 'band',
      band: { top: 0.5, height: 0.25 },
      targetWidth: 100,
      scale: 1,
    })
    assert.equal(plan.capped, false)
    assert.equal(plan.rows[0].cropY, 0)
    assert.equal(plan.rows[0].cropHeight, 200)
    assert.equal(plan.rows[0].destHeight, 200)
    assert.equal(plan.rows[1].cropY, 100)
    assert.equal(plan.rows[1].cropHeight, 50)
    assert.equal(plan.rows[1].destHeight, 50)
    assert.ok(plan.rows[1].captionHeight >= 18)
    assert.equal(plan.height, 200 + 50 + plan.rows[1].captionHeight)
  })

  it('shrinks a result that would overflow the canvas budget', () => {
    const plan = planStitch({
      frames: [
        { width: 1000, height: 8000, caption: false },
        { width: 1000, height: 8000, caption: false },
      ],
      mode: 'full',
      band: { top: 0, height: 1 },
      targetWidth: 1000,
      scale: 2,
      maxEdge: 4096,
      maxPixels: 4_000_000,
    })
    assert.equal(plan.capped, true)
    assert.ok(plan.width <= 4096)
    assert.ok(plan.height <= 4096)
    assert.ok(plan.width * plan.height <= 4_000_000)
  })

  it('keeps shrinking until the canvas limit holds, and gives up when it cannot', () => {
    const frames = Array.from({ length: 40 }, () => ({ width: 1000, height: 10, caption: true }))
    const fitted = planStitch({
      frames,
      mode: 'full',
      band: { top: 0, height: 1 },
      targetWidth: 1000,
      scale: 1,
      maxEdge: 500,
      maxPixels: 200_000,
    })
    assert.equal(fitted.capped, true)
    assert.ok(fitted.width > 0)
    assert.ok(fitted.width <= 500)
    assert.ok(fitted.height <= 500)
    assert.ok(fitted.width * fitted.height <= 200_000)

    const impossible = planStitch({
      frames: Array.from({ length: 1000 }, () => ({ width: 10, height: 10, caption: false })),
      mode: 'full',
      band: { top: 0, height: 1 },
      targetWidth: 10,
      scale: 1,
      maxEdge: 100,
      maxPixels: 10_000,
    })
    assert.equal(impossible.capped, true)
    assert.equal(impossible.width, 0)
    assert.equal(impossible.rows.length, 0)
  })
})

describe('timestamps, names, and sample times', () => {
  it('formats a source time and sorts filenames numerically', () => {
    assert.equal(formatTimestamp(62.5), '1:02.50')
    assert.equal(formatTimestamp(1.2), '0:01.20')
    assert.equal(formatTimestamp(59.999), '1:00.00')
    assert.ok(compareFileNames('shot-2.png', 'shot-10.png') < 0)
  })

  it('caps sample points and keeps them inside the clip', () => {
    assert.equal(sampleCountForDuration(0), 0)
    assert.equal(sampleCountForDuration(10), 40)
    assert.equal(sampleCountForDuration(1000), 320)
    const times = sampleTimes(2, 4)
    assert.deepEqual(
      times.map((time) => Number(time.toFixed(2))),
      [0.25, 0.75, 1.25, 1.75],
    )
    const short = sampleTimes(0.12, 4)
    assert.equal(new Set(short.map((time) => time.toFixed(4))).size, short.length)
  })

  it('averages a row of pixels and measures the horizontal edge', () => {
    const data = new Uint8ClampedArray(2 * 4)
    data.set([255, 255, 255, 255, 0, 0, 0, 255])
    const profile = rgbaToProfile(data, 2, 1)
    assert.ok(Math.abs(profile.mean[0] - 127.5) < 1)
    assert.equal(profile.edge[0], 255)
  })
})
