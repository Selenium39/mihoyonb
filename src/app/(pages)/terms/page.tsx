import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { siteConfig } from '@/config/site'

export default function TermsPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">服务条款</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-muted-foreground text-center mb-6">
              最后更新日期：2024年1月1日
            </p>
            
            <h3 className="text-lg font-semibold mt-6 mb-3">服务说明</h3>
            <p className="mb-4">
              {siteConfig.name}是一个免费的{siteConfig.slogan}，提供图片处理、内容排版等在线工具，
              所有处理均在您的浏览器本地完成，文件不会上传到服务器。
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">使用规则</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>用户应合法使用本服务，不得用于违法用途</li>
              <li>禁止恶意攻击或滥用服务器资源</li>
              <li>尊重知识产权，不得传播盗版内容</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">免责声明</h3>
            <p className="mb-4">
              本网站提供的工具按&ldquo;现状&rdquo;提供，不对处理结果的准确性、完整性作出保证。
              用户使用本网站处理内容所产生的后果由用户自行承担。
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">服务变更</h3>
            <p className="mb-4">
              我们保留随时修改或终止服务的权利，恕不另行通知。
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">联系方式</h3>
            <p className="mb-4">
              如有疑问或建议，请联系：{siteConfig.author.email}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 