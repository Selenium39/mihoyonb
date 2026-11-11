/** 页面内的示例：自己画的聊天截图和一段烧了字幕的短片，不使用任何外部素材。 */

function canvasFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('png'))
      else resolve(new File([blob], name, { type: 'image/png' }))
    }, 'image/png')
  })
}

function paintChat(lines: readonly string[], name: string): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = 390
  canvas.height = 700
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('canvas'))

  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, 390, 700)
  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, 390, 88)
  ctx.fillStyle = '#f8fafc'
  ctx.font = '600 22px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText('Alex', 20, 54)
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(0, 620, 390, 80)
  ctx.fillStyle = '#64748b'
  ctx.font = '16px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText('Message', 20, 666)

  ctx.font = '18px ui-sans-serif, system-ui, sans-serif'
  lines.forEach((line, index) => {
    const y = 120 + index * 78
    ctx.fillStyle = index % 2 === 0 ? '#dbeafe' : '#ffffff'
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 2
    ctx.fillRect(20, y, 340, 58)
    ctx.strokeRect(20, y, 340, 58)
    ctx.fillStyle = '#0f172a'
    ctx.fillText(line, 36, y + 36)
  })

  return canvasFile(canvas, name)
}

export function makeExampleScreenshots(): Promise<File[]> {
  const pages = [
    ['Hey, are you free tonight?', 'Maybe. What did you have in mind?'],
    ['There is a late screening downtown.', 'I can do 8 if we skip dinner.'],
    ['Great. I will get the tickets.', 'See you at the door.'],
  ]
  return Promise.all(pages.map((lines, index) => paintChat(lines, `chat-${index + 1}.png`)))
}

function paintClip(ctx: CanvasRenderingContext2D, line: string) {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, 640, 360)
  ctx.fillStyle = '#334155'
  ctx.fillRect(48, 48, 544, 220)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '20px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText('Scene', 72, 160)
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 292, 640, 68)
  ctx.fillStyle = '#f8fafc'
  ctx.font = '28px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(line, 36, 336)
}

export async function makeExampleClip(): Promise<File> {
  if (typeof MediaRecorder === 'undefined') throw new Error('recorder')
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
    ? 'video/webm;codecs=vp8'
    : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : ''
  if (!mime) throw new Error('recorder')

  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 360
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  paintClip(ctx, 'We have to go back.')

  const stream = canvas.captureStream(10)
  const recorder = new MediaRecorder(stream, { mimeType: mime })
  const chunks: Blob[] = []
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  }
  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }))
  })

  const lines = ['We have to go back.', 'Not tonight.', 'Then when?']
  // 不带 timeslice 一次写完，浏览器才能在文件头里放上时长，后面的寻址才有落点。
  recorder.start()
  for (const line of lines) {
    const until = performance.now() + 800
    while (performance.now() < until) {
      paintClip(ctx, line)
      await new Promise((resolve) => setTimeout(resolve, 60))
    }
  }
  recorder.stop()
  stream.getTracks().forEach((track) => track.stop())
  const blob = await stopped
  return new File([blob], 'example-dialogue.webm', { type: 'video/webm' })
}
