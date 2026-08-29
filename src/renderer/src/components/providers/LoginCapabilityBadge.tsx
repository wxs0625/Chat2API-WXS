import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LoginSupportStatus } from '@/types/electron'

interface LoginCapabilityBadgeProps {
  status?: LoginSupportStatus
  variant?: 'text' | 'badge'
  showLabel?: boolean
  className?: string
}

export function LoginCapabilityBadge({
  status,
  variant = 'text',
  showLabel = true,
  className,
}: LoginCapabilityBadgeProps) {
  const { t } = useTranslation()

  if (!status) return null

  const label =
    status === 'supported'
      ? t('providers.loginSupported')
      : status === 'unsupported'
        ? t('providers.loginUnsupported')
        : t('providers.loginUnknown')

  const textClassName =
    status === 'supported'
      ? 'text-green-600 dark:text-green-400'
      : status === 'unsupported'
        ? 'text-red-600 dark:text-red-400'
        : 'text-amber-600 dark:text-amber-400'

  const badgeClassName =
    status === 'supported'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : status === 'unsupported'
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'

  if (variant === 'badge') {
    return (
      <Badge variant="outline" className={cn('text-xs font-medium', badgeClassName, className)}>
        {label}
      </Badge>
    )
  }

  return (
    <span className={cn('flex items-center gap-1 text-xs text-muted-foreground', className)}>
      {showLabel && <span className="font-medium">{t('providers.loginCapability')}:</span>}
      <span className={cn('font-medium', textClassName)}>{label}</span>
    </span>
  )
}
