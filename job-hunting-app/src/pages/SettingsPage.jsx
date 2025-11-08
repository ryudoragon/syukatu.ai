import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogOut, Save } from 'lucide-react'

export default function SettingsPage() {
  const { currentUser, updateUser, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [email, setEmail] = useState(currentUser?.email || '')
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (email !== currentUser?.email) {
      updateUser({ email })
    }
    if (password) {
      updateUser({ password })
    }
    localStorage.setItem('apiKey', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    if (confirm('ログアウトしますか?')) {
      logout()
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">設定</h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>アカウント設定</CardTitle>
              <CardDescription>メールアドレスとパスワードの変更</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ユーザー名</Label>
                <Input value={currentUser?.username || ''} disabled />
              </div>

              <div>
                <Label>メールアドレス</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>新しいパスワード</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="変更する場合のみ入力"
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>テーマ設定</CardTitle>
              <CardDescription>表示テーマの切り替え</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label>テーマ</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">ライトモード</SelectItem>
                    <SelectItem value="dark">ダークモード</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle>API設定</CardTitle>
              <CardDescription>AI機能を使用するためのAPIキー（オプション）</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label>APIキー</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="未入力でもアプリは使用できます"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  メール生成などのAI機能を使用する場合に設定してください
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {saved ? '保存しました' : '保存'}
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

