import { useState } from 'react'
import { Sparkles, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EmailGeneratorPage() {
  const [keyword, setKeyword] = useState('')
  const [schedule, setSchedule] = useState('')
  const [freeText, setFreeText] = useState('')
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [copied, setCopied] = useState(false)

  const generateEmail = () => {
    // Mock email generation
    const mockEmail = `件名: 面接日程のご相談

○○株式会社
人事部 ご担当者様

お世話になっております。
${keyword || '就活太郎'}と申します。

この度は、${schedule || '次回面接'}の機会をいただき、誠にありがとうございます。

${freeText || 'つきましては、以下の日程でご調整いただくことは可能でしょうか。'}

【候補日時】
・第一希望: 11月10日(月) 10:00-18:00
・第二希望: 11月11日(火) 13:00-18:00
・第三希望: 11月12日(水) 終日

お忙しいところ恐縮ですが、ご確認のほどよろしくお願いいたします。

---
${keyword || '就活太郎'}
メール: example@university.ac.jp
電話: 090-XXXX-XXXX`

    setGeneratedEmail(mockEmail)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">メール生成</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>入力情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>キーワード（氏名など）</Label>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="例: 山田太郎"
                />
              </div>

              <div>
                <Label>希望日程</Label>
                <Input
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="例: 11月10日〜12日"
                />
              </div>

              <div>
                <Label>自由記述</Label>
                <Textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  rows={6}
                  placeholder="その他伝えたい内容を入力してください"
                />
              </div>

              <Button onClick={generateEmail} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                メールを生成
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>生成されたメール</CardTitle>
                {generatedEmail && (
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        コピー
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedEmail ? (
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                  {generatedEmail}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>左側の情報を入力して「メールを生成」をクリックしてください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>注意:</strong> 現在はモック機能です。実際のAI生成機能を使用するには、設定ページでAPIキーを設定してください。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

