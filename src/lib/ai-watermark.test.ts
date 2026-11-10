import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { analyze, clean, DEFAULT_OPTIONS, RULES, type CleanOptions } from './ai-watermark.ts'

const cp = (...codes: number[]) => String.fromCodePoint(...codes)

function cleaned(text: string, options?: Partial<CleanOptions>) {
  return clean(text, options).text
}

describe('ai watermark cleaner', () => {
  it('removes a zero-width space and reports it', () => {
    const raw = `zero${cp(0x200b)}width`
    const result = clean(raw)
    assert.equal(result.text, 'zerowidth')
    assert.equal(result.removed, 1)
    const report = analyze(raw)
    assert.equal(report.hiddenTotal, 1)
    assert.equal(report.findings[0]?.id, 'zwsp')
    assert.ok(report.reveal.some((seg) => seg.type === 'mark' && seg.abbr === 'ZWSP'))
  })

  it('turns U+202F into a normal space unless special spaces are off', () => {
    const raw = `10${cp(0x202f)}%`
    assert.equal(cleaned(raw), '10 %')
    assert.equal(cleaned(raw, { spaces: false }), raw)
  })

  it('straightens quotes and dashes without rewriting words', () => {
    const raw = `${cp(0x201c)}Ship it${cp(0x201d)}${cp(0x2014)}today${cp(0x2026)}`
    assert.equal(cleaned(raw), '"Ship it"-today...')
    assert.equal(cleaned(raw, { quotes: false, dashes: false, ellipsis: false }), raw)
  })

  it('does not let em dashes become a markdown rule', () => {
    const raw = cp(0x2014, 0x2014, 0x2014)
    assert.equal(cleaned(raw), '---')
  })

  it('keeps emoji joiners and variation selectors inside emoji', () => {
    const family = cp(0x1f468, 0x200d, 0x1f469, 0x200d, 0x1f467)
    const heart = cp(0x2764, 0xfe0f)
    const raw = `hi${cp(0x200b)} ${family} ${heart}`
    assert.equal(cleaned(raw), `hi ${family} ${heart}`)
  })

  it('strips a lone variation selector and can drop emoji when asked', () => {
    assert.equal(cleaned(`x${cp(0xfe0f)}y`), 'xy')
    const thumbs = cp(0x1f44d, 0x1f3fd)
    assert.equal(cleaned(`ok ${thumbs}`, { emoji: true }), 'ok')
  })

  it('strips a leading BOM and normalizes CRLF once', () => {
    const raw = `${cp(0xfeff)}a\r\nb`
    const result = clean(raw, { whitespace: false })
    assert.equal(result.text, 'a\nb')
    assert.equal(result.removed, 2)
  })

  it('replaces lookalikes only inside mostly-Latin words', () => {
    const mixed = `p${cp(0x0430)}ypal`
    const cyrillic = cp(0x043f, 0x0440, 0x0438, 0x0432, 0x0435, 0x0442)
    const raw = `${mixed} ${cyrillic}`
    assert.equal(cleaned(raw), raw)
    assert.equal(cleaned(raw, { homoglyphs: true }), `paypal ${cyrillic}`)
    assert.equal(analyze(raw).mixedWords.count, 1)
    assert.equal(analyze(raw).mixedWords.examples[0], mixed)
  })

  it('strips markdown outside fenced code and keeps snake_case', () => {
    const raw = ['```', '# keep', '```', '# Title', 'See [docs](https://example.com) and snake_case.', '* item'].join(
      '\n',
    )
    const text = cleaned(raw, { whitespace: false })
    assert.match(text, /# keep/)
    assert.doesNotMatch(text, /^# Title/m)
    assert.match(text, /^Title/m)
    assert.match(text, /See docs and snake_case/)
    assert.match(text, /^- item/m)
  })

  it('normalizes the ideographic space and line separators', () => {
    assert.equal(cleaned(`中${cp(0x3000)}文`), '中 文')
    assert.equal(cleaned(`a${cp(0x2028)}b`, { whitespace: false }), 'a\nb')
  })

  it('strips tag characters used to hide text', () => {
    const raw = `visible${cp(0xe0041)}`
    assert.equal(cleaned(raw), 'visible')
    assert.equal(analyze(raw).findings[0]?.id, 'tag')
  })

  it('collapses extra blank lines without touching a clean sentence', () => {
    assert.equal(cleaned('one\n\n\n\ntwo'), 'one\n\ntwo')
    assert.equal(cleaned('Already clean.'), 'Already clean.')
    assert.equal(clean('Already clean.').removed, 0)
    assert.equal(clean('Already clean.').replaced, 0)
  })

  it('covers every rule with a unique id', () => {
    const ids = RULES.map((rule) => rule.id)
    assert.equal(new Set(ids).size, ids.length)
    assert.equal(DEFAULT_OPTIONS.invisibles, true)
    assert.equal(DEFAULT_OPTIONS.homoglyphs, false)
  })
})
