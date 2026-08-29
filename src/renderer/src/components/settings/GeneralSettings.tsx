import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useSettingsStore, CloseBehavior, OAuthProxyMode } from '@/stores/settingsStore'
import { Bell, Minimize2, Power, Globe, RefreshCw, Activity } from 'lucide-react'

export function GeneralSettings() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [updatingModels, setUpdatingModels] = useState(false)
  const {
    autoStart,
    setAutoStart,
    autoStartProxy,
    setAutoStartProxy,
    autoUpdateModels,
    setAutoUpdateModels,
    autoUpdateModelsIntervalHours,
    setAutoUpdateModelsIntervalHours,
    maxConcurrentPerAccount,
    setMaxConcurrentPerAccount,
    minimizeToTray,
    setMinimizeToTray,
    closeBehavior,
    setCloseBehavior,
    enableNotifications,
    setEnableNotifications,
    oauthProxyMode,
    setOauthProxyMode,
  } = useSettingsStore()

  const handleUpdateModelsNow = async () => {
    if (updatingModels) return
    setUpdatingModels(true)
    try {
      const result = await window.electronAPI.providers.autoUpdateModels()
      if (!result.success) {
        toast({
          title: t('settings.autoUpdateModelsFailed'),
          description: result.error || 'Unknown error',
          variant: 'destructive',
        })
        return
      }

      const totalAdded = result.results.reduce((sum, r) => sum + r.addedModels.length, 0)
      if (totalAdded > 0) {
        toast({
          title: t('settings.autoUpdateModelsSuccess'),
          description: t('settings.autoUpdateModelsAdded', { count: totalAdded }),
        })
      } else {
        toast({
          title: t('settings.autoUpdateModelsSuccess'),
          description: t('settings.autoUpdateModelsUpToDate'),
        })
      }
    } catch (error) {
      toast({
        title: t('settings.autoUpdateModelsFailed'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      })
    } finally {
      setUpdatingModels(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5" />
            {t('settings.autoStart')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-start">{t('settings.autoStart')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.autoStartHelp')}</p>
            </div>
            <Switch
              id="auto-start"
              checked={autoStart}
              onCheckedChange={setAutoStart}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-start-proxy">{t('settings.autoStartProxy')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.autoStartProxyHelp')}</p>
            </div>
            <Switch
              id="auto-start-proxy"
              checked={autoStartProxy}
              onCheckedChange={setAutoStartProxy}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {t('settings.autoUpdateModels')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-update-models">{t('settings.autoUpdateModels')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.autoUpdateModelsHelp')}</p>
            </div>
            <Switch
              id="auto-update-models"
              checked={autoUpdateModels}
              onCheckedChange={setAutoUpdateModels}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.autoUpdateModelsInterval')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.autoUpdateModelsIntervalHelp')}
              </p>
            </div>
            <Select
              value={String(autoUpdateModelsIntervalHours)}
              onValueChange={(value) => setAutoUpdateModelsIntervalHours(Number(value))}
              disabled={!autoUpdateModels}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('settings.autoUpdateModelsInterval')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('settings.intervalHour1')}</SelectItem>
                <SelectItem value="6">{t('settings.intervalHour6')}</SelectItem>
                <SelectItem value="12">{t('settings.intervalHour12')}</SelectItem>
                <SelectItem value="24">{t('settings.intervalHour24')}</SelectItem>
                <SelectItem value="72">{t('settings.intervalHour72')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.autoUpdateModelsNow')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.autoUpdateModelsNowHelp')}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={updatingModels}
              onClick={handleUpdateModelsNow}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${updatingModels ? 'animate-spin' : ''}`} />
              {updatingModels
                ? t('settings.autoUpdateModelsUpdating')
                : t('settings.autoUpdateModelsNow')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('settings.maxConcurrentPerAccount')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.maxConcurrentPerAccount')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.maxConcurrentPerAccountHelp')}
              </p>
            </div>
            <Select
              value={String(maxConcurrentPerAccount)}
              onValueChange={(value) => setMaxConcurrentPerAccount(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('settings.maxConcurrentPerAccount')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('settings.concurrent1')}</SelectItem>
                <SelectItem value="2">{t('settings.concurrent2')}</SelectItem>
                <SelectItem value="3">{t('settings.concurrent3')}</SelectItem>
                <SelectItem value="5">{t('settings.concurrent5')}</SelectItem>
                <SelectItem value="10">{t('settings.concurrent10')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Minimize2 className="h-5 w-5" />
            {t('settings.closeBehavior')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="minimize-tray">{t('settings.minimizeToTray')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.minimizeToTrayHelp')}</p>
            </div>
            <Switch
              id="minimize-tray"
              checked={minimizeToTray}
              onCheckedChange={setMinimizeToTray}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.closeBehavior')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.minimizeToTrayHelp')}</p>
            </div>
            <Select
              value={closeBehavior}
              onValueChange={(value) => setCloseBehavior(value as CloseBehavior)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('settings.closeBehavior')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimize">{t('settings.closeBehaviorMinimize')}</SelectItem>
                <SelectItem value="close">{t('settings.closeBehaviorClose')}</SelectItem>
                <SelectItem value="ask">{t('settings.closeBehaviorAsk')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('settings.notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">{t('settings.enableNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.enableNotificationsHelp')}</p>
            </div>
            <Switch
              id="notifications"
              checked={enableNotifications}
              onCheckedChange={setEnableNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('settings.networkProxy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.oauthProxyMode')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.oauthProxyModeHelp')}</p>
            </div>
            <Select
              value={oauthProxyMode}
              onValueChange={(value) => setOauthProxyMode(value as OAuthProxyMode)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('settings.oauthProxyMode')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">{t('settings.oauthProxySystem')}</SelectItem>
                <SelectItem value="none">{t('settings.oauthProxyNone')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
