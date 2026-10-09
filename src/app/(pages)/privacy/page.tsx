import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { siteConfig } from '@/config/site'

export default function PrivacyPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">隐私政策</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-muted-foreground text-center mb-6">
              最后更新日期：2024年1月1日
            </p>
            
            <h3 className="text-lg font-semibold mt-6 mb-3">信息收集</h3>
            <p className="mb-4">
              我们不会收集您的个人信息。本网站提供图片处理、内容排版等在线工具，所有处理均在您的浏览器本地完成，不存储任何用户数据。
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">数据使用</h3>
            <p className="mb-4">
              我们不会使用、存储或分享您的任何个人数据。所有工具均在浏览器本地运行，无需注册登录。
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">第三方服务</h3>
            <p className="mb-4">
              本网站可能包含指向第三方网站的链接。我们不对这些外部网站的隐私政策负责。
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Cookie</h3>
            <p className="mb-4">
              我们可能使用Cookie来改善用户体验，但不会收集个人身份信息。
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">联系我们</h3>
            <p className="mb-4">
              如果您对本隐私政策有任何疑问，请通过 {siteConfig.author.email} 联系我们。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 