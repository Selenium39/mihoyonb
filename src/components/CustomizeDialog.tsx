'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Palette, Type, Layout, Smartphone } from 'lucide-react'
import {
  getSizePreset,
  getSizePresetOptions,
  getPosterThemeOptions,
  type PosterSettings,
  type SizePreset,
  type PosterTheme
} from '@/lib/markdown-poster'
import type { Locale } from '@/lib/i18n'

/**
 * 设置对话框文案：默认中文，英文页传 locale="en"。
 * 中文保持原有字面量不变。
 */
const DIALOG_COPY = {
  zh: {
    title: '自定义设置',
    description: '调整背景、字体和布局来创建独特的图片样式',
    backgroundSection: '背景设置',
    presets: '预设背景',
    customGradient: '自定义渐变',
    startColor: '起始颜色',
    endColor: '结束颜色',
    direction: '渐变方向',
    directions: {
      '135deg': '左上到右下',
      '45deg': '左下到右上',
      '0deg': '左到右',
      '90deg': '上到下',
      '180deg': '右到左',
      '270deg': '下到上',
    },
    textSection: '文字设置',
    fontSize: '文字大小',
    layoutSection: '布局设置',
    padding: '卡片边距',
    width: '整体宽度',
    widthLocked: (width: number) => `${width}px（预设锁定）`,
    presetWidthHint: '小红书预设使用 1080px 宽度，切换回「自由宽度」可手动调整',
    canvasSection: '画布与主题',
    canvasSize: '画布尺寸',
    posterTheme: '排版主题',
    presetCanvasNote: (hint: string) => ` · 预设画布 ${hint}，高度为最小高度，内容超出自动撑开`,
    headingSize: '标题字号',
    headingScales: {
      '1': '标准',
      '1.15': '放大 15%',
      '1.3': '超大 30%',
    },
    cancel: '取消',
    apply: '应用设置',
  },
  en: {
    title: 'Customize',
    description: 'Adjust the background, fonts and layout to create your own poster style.',
    backgroundSection: 'Background',
    presets: 'Background presets',
    customGradient: 'Custom gradient',
    startColor: 'Start color',
    endColor: 'End color',
    direction: 'Direction',
    directions: {
      '135deg': 'Top left → bottom right',
      '45deg': 'Bottom left → top right',
      '0deg': 'Left → right',
      '90deg': 'Top → bottom',
      '180deg': 'Right → left',
      '270deg': 'Bottom → top',
    },
    textSection: 'Text',
    fontSize: 'Font size',
    layoutSection: 'Layout',
    padding: 'Card padding',
    width: 'Canvas width',
    widthLocked: (width: number) => `${width}px (locked by preset)`,
    presetWidthHint:
      'The 3:4 preset uses a fixed 1080px width. Switch back to “Custom width” to adjust it manually.',
    canvasSection: 'Canvas & theme',
    canvasSize: 'Canvas size',
    posterTheme: 'Poster theme',
    presetCanvasNote: (hint: string) =>
      ` · Preset canvas ${hint}. This is the minimum height — content expands it as needed.`,
    headingSize: 'Heading size',
    headingScales: {
      '1': 'Standard',
      '1.15': 'Large (+15%)',
      '1.3': 'Extra large (+30%)',
    },
    cancel: 'Cancel',
    apply: 'Apply settings',
  },
} as const

interface CustomizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: PosterSettings
  onSettingsChange: (settings: any) => void
  backgroundPresets: Record<string, string>
  locale?: Locale
}

export function CustomizeDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  backgroundPresets,
  locale = 'zh',
}: CustomizeDialogProps) {
  const copy = DIALOG_COPY[locale]
  const sizePresetList = getSizePresetOptions(locale)
  const posterThemeList = getPosterThemeOptions(locale)
  const [tempSettings, setTempSettings] = useState(settings)

  useEffect(() => {
    setTempSettings(settings)
  }, [settings])

  const handleApply = () => {
    onSettingsChange(tempSettings)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTempSettings(settings)
    onOpenChange(false)
  }

  // 切换画布尺寸预设：小红书预设锁定宽度为 1080px
  const handleSizePresetChange = (value: string) => {
    const preset = getSizePreset(value as SizePreset)
    setTempSettings({
      ...tempSettings,
      sizePreset: preset.value,
      width: preset.width ?? tempSettings.width
    })
  }

  // 切换排版主题：若背景仍是上一主题的推荐背景则跟随切换，不影响用户自定义背景
  const handleThemeChange = (value: string) => {
    const prev = posterThemeList.find((t) => t.value === (tempSettings.theme ?? 'classic'))
    const next = posterThemeList.find((t) => t.value === value)
    const patch: PosterSettings = { ...tempSettings, theme: value as PosterTheme }
    if (
      prev &&
      next &&
      tempSettings.background === prev.defaultBackground &&
      prev.defaultBackground !== next.defaultBackground
    ) {
      patch.background = next.defaultBackground
    }
    setTempSettings(patch)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 背景设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <h3 className="font-semibold">{copy.backgroundSection}</h3>
            </div>

            {/* 预设背景 */}
            <div>
              <Label>{copy.presets}</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {Object.entries(backgroundPresets).map(([key, value]) => (
                  <button
                    key={key}
                    className={`h-16 rounded-md border-2 transition-all ${
                      tempSettings.background === key
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ background: value }}
                    onClick={() =>
                      setTempSettings({ ...tempSettings, background: key })
                    }
                  />
                ))}
              </div>
            </div>

            {/* 自定义渐变 */}
            <div className="space-y-3">
              <Label>{copy.customGradient}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{copy.startColor}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={tempSettings.customGradient.startColor}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          background: 'custom',
                          customGradient: {
                            ...tempSettings.customGradient,
                            startColor: e.target.value
                          }
                        })
                      }
                      className="w-full h-10 rounded border cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground">
                      {tempSettings.customGradient.startColor}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">{copy.endColor}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={tempSettings.customGradient.endColor}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          background: 'custom',
                          customGradient: {
                            ...tempSettings.customGradient,
                            endColor: e.target.value
                          }
                        })
                      }
                      className="w-full h-10 rounded border cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground">
                      {tempSettings.customGradient.endColor}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs">{copy.direction}</Label>
                <Select
                  value={tempSettings.customGradient.direction}
                  onValueChange={(value) =>
                    setTempSettings({
                      ...tempSettings,
                      background: 'custom',
                      customGradient: {
                        ...tempSettings.customGradient,
                        direction: value
                      }
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="135deg">{copy.directions['135deg']}</SelectItem>
                    <SelectItem value="45deg">{copy.directions['45deg']}</SelectItem>
                    <SelectItem value="0deg">{copy.directions['0deg']}</SelectItem>
                    <SelectItem value="90deg">{copy.directions['90deg']}</SelectItem>
                    <SelectItem value="180deg">{copy.directions['180deg']}</SelectItem>
                    <SelectItem value="270deg">{copy.directions['270deg']}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 文字设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <h3 className="font-semibold">{copy.textSection}</h3>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{copy.fontSize}</Label>
                <span className="text-sm text-muted-foreground">
                  {tempSettings.fontSize}px
                </span>
              </div>
              <Slider
                value={[tempSettings.fontSize]}
                onValueChange={([value]) =>
                  setTempSettings({ ...tempSettings, fontSize: value })
                }
                min={12}
                max={20}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>

          {/* 布局设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <h3 className="font-semibold">{copy.layoutSection}</h3>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{copy.width}</Label>
                <span className="text-sm text-muted-foreground">
                  {getSizePreset(tempSettings.sizePreset).width !== undefined
                    ? copy.widthLocked(
                        getSizePreset(tempSettings.sizePreset).width ?? tempSettings.width
                      )
                    : `${tempSettings.width}px`}
                </span>
              </div>
              <Slider
                value={[
                  getSizePreset(tempSettings.sizePreset).width ?? tempSettings.width
                ]}
                onValueChange={([value]) =>
                  setTempSettings({ ...tempSettings, width: value })
                }
                min={480}
                max={800}
                step={20}
                disabled={getSizePreset(tempSettings.sizePreset).width !== undefined}
                className="w-full"
              />
              {getSizePreset(tempSettings.sizePreset).width !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {copy.presetWidthHint}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{copy.padding}</Label>
                <span className="text-sm text-muted-foreground">
                  {tempSettings.padding}px
                </span>
              </div>
              <Slider
                value={[tempSettings.padding]}
                onValueChange={([value]) =>
                  setTempSettings({ ...tempSettings, padding: value })
                }
                min={20}
                max={60}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* 画布与主题设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <h3 className="font-semibold">{copy.canvasSection}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{copy.canvasSize}</Label>
                <Select
                  value={tempSettings.sizePreset ?? 'custom'}
                  onValueChange={handleSizePresetChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizePresetList.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label} · {o.hint}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{copy.posterTheme}</Label>
                <Select
                  value={tempSettings.theme ?? 'classic'}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {posterThemeList.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {posterThemeList.find((t) => t.value === (tempSettings.theme ?? 'classic'))?.desc}
              {(tempSettings.sizePreset ?? 'custom') !== 'custom' &&
                copy.presetCanvasNote(
                  (sizePresetList.find((o) => o.value === tempSettings.sizePreset) ??
                    sizePresetList[0]).hint
                )}
            </p>
            {/* 小红书主题的轻量定制：标题字号放大 */}
            {(tempSettings.theme ?? 'classic') !== 'classic' && (
              <div>
                <Label>{copy.headingSize}</Label>
                <Select
                  value={String(tempSettings.titleScale ?? 1)}
                  onValueChange={(value) =>
                    setTempSettings({ ...tempSettings, titleScale: Number(value) })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{copy.headingScales['1']}</SelectItem>
                    <SelectItem value="1.15">{copy.headingScales['1.15']}</SelectItem>
                    <SelectItem value="1.3">{copy.headingScales['1.3']}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {copy.cancel}
          </Button>
          <Button onClick={handleApply}>
            {copy.apply}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
