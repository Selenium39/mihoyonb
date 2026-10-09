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
  sizePresetOptions,
  posterThemeOptions,
  type PosterSettings,
  type SizePreset,
  type PosterTheme
} from '@/lib/markdown-poster'

interface CustomizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: PosterSettings
  onSettingsChange: (settings: any) => void
  backgroundPresets: Record<string, string>
}

export function CustomizeDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  backgroundPresets
}: CustomizeDialogProps) {
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
    const prev = posterThemeOptions.find((t) => t.value === (tempSettings.theme ?? 'classic'))
    const next = posterThemeOptions.find((t) => t.value === value)
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
          <DialogTitle>自定义设置</DialogTitle>
          <DialogDescription>
            调整背景、字体和布局来创建独特的图片样式
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 背景设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <h3 className="font-semibold">背景设置</h3>
            </div>

            {/* 预设背景 */}
            <div>
              <Label>预设背景</Label>
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
              <Label>自定义渐变</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">起始颜色</Label>
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
                  <Label className="text-xs">结束颜色</Label>
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
                <Label className="text-xs">渐变方向</Label>
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
                    <SelectItem value="135deg">左上到右下</SelectItem>
                    <SelectItem value="45deg">左下到右上</SelectItem>
                    <SelectItem value="0deg">左到右</SelectItem>
                    <SelectItem value="90deg">上到下</SelectItem>
                    <SelectItem value="180deg">右到左</SelectItem>
                    <SelectItem value="270deg">下到上</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 文字设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <h3 className="font-semibold">文字设置</h3>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>文字大小</Label>
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
              <h3 className="font-semibold">布局设置</h3>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>整体宽度</Label>
                <span className="text-sm text-muted-foreground">
                  {getSizePreset(tempSettings.sizePreset).width !== undefined
                    ? `${getSizePreset(tempSettings.sizePreset).width}px（预设锁定）`
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
                  小红书预设使用 1080px 宽度，切换回「自由宽度」可手动调整
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>卡片边距</Label>
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
              <h3 className="font-semibold">画布与主题</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>画布尺寸</Label>
                <Select
                  value={tempSettings.sizePreset ?? 'custom'}
                  onValueChange={handleSizePresetChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizePresetOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label} · {o.hint}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>排版主题</Label>
                <Select
                  value={tempSettings.theme ?? 'classic'}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {posterThemeOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {posterThemeOptions.find((t) => t.value === (tempSettings.theme ?? 'classic'))?.desc}
              {(tempSettings.sizePreset ?? 'custom') !== 'custom' &&
                ` · 预设画布 ${getSizePreset(tempSettings.sizePreset).hint}，高度为最小高度，内容超出自动撑开`}
            </p>
            {/* 小红书主题的轻量定制：标题字号放大 */}
            {(tempSettings.theme ?? 'classic') !== 'classic' && (
              <div>
                <Label>标题字号</Label>
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
                    <SelectItem value="1">标准</SelectItem>
                    <SelectItem value="1.15">放大 15%</SelectItem>
                    <SelectItem value="1.3">超大 30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleApply}>
            应用设置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
