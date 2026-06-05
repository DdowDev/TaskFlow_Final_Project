import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PsychologyIcon from '@mui/icons-material/Psychology'
import RefreshIcon from '@mui/icons-material/Refresh'
import { alpha, useTheme } from '@mui/material/styles'
import { CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'

const getSafeArray = (value) => Array.isArray(value) ? value : []

const getNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0

const clampScore = (value) => Math.max(Math.min(getNumber(value), 100), 0)

const priorityChipColors = {
  [CARD_PRIORITIES.LOW]: 'default',
  [CARD_PRIORITIES.MEDIUM]: 'info',
  [CARD_PRIORITIES.HIGH]: 'warning',
  [CARD_PRIORITIES.URGENT]: 'error'
}

const getModeLabel = (mode) => {
  if (mode === 'mock') return 'Mock mode'
  if (mode === 'fallback') return 'Fallback'
  if (mode === 'real') return 'AI analysis'
  return 'AI analysis'
}

const getHealthMeta = (status, score) => {
  const normalizedStatus = String(status || '').toLowerCase()

  if (['critical'].includes(normalizedStatus)) {
    return { color: 'error', label: 'Nguy cấp' }
  }

  if (['warning', 'at_risk', 'at-risk'].includes(normalizedStatus)) {
    return { color: 'warning', label: 'Cần chú ý' }
  }

  if (['healthy', 'good'].includes(normalizedStatus)) {
    return { color: 'success', label: 'Tốt' }
  }

  const safeScore = clampScore(score)
  if (safeScore <= 40) return { color: 'error', label: 'Nguy cấp' }
  if (safeScore <= 70) return { color: 'warning', label: 'Cần chú ý' }
  return { color: 'success', label: 'Tốt' }
}

const getRiskColor = (level) => {
  const normalizedLevel = String(level || '').toLowerCase()

  if (['urgent', 'critical'].includes(normalizedLevel)) return 'error'
  if (normalizedLevel === 'high') return 'warning'
  if (normalizedLevel === 'medium') return 'info'
  return 'default'
}

const getRiskPatch = (risk) => {
  const level = String(risk?.level || '').toLowerCase()

  if (['urgent', 'critical'].includes(level)) return { priorities: [CARD_PRIORITIES.URGENT] }
  if (level === 'high') return { priorities: [CARD_PRIORITIES.HIGH, CARD_PRIORITIES.URGENT] }
  if (level === 'medium') return { priorities: [CARD_PRIORITIES.MEDIUM, CARD_PRIORITIES.HIGH] }
  return { priorities: [CARD_PRIORITIES.LOW, CARD_PRIORITIES.MEDIUM, CARD_PRIORITIES.HIGH, CARD_PRIORITIES.URGENT] }
}

const formatGeneratedAt = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function HealthScore({ summary }) {
  const theme = useTheme()
  const hasScore = Number.isFinite(Number(summary?.healthScore))
  const score = clampScore(summary?.healthScore)
  const healthMeta = getHealthMeta(summary?.healthStatus, score)
  const color = theme.palette[healthMeta.color]?.main || theme.palette.text.secondary

  return (
    <Stack alignItems="center" spacing={0.75} sx={{ minWidth: { xs: 80, sm: 96 } }}>
      <Box
        sx={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: color,
          color,
          bgcolor: alpha(color, 0.08),
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          {hasScore ? score : '-'}
        </Typography>
      </Box>
      <Chip
        size="small"
        label={healthMeta.label}
        color={healthMeta.color}
        variant="outlined"
        sx={{ height: 22, fontWeight: 700 }}
      />
    </Stack>
  )
}

function InsightStrip({ tone = 'default', label, title, reason, actionLabel, onAction }) {
  const theme = useTheme()
  const colorMap = {
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    primary: theme.palette.primary.main,
    default: theme.palette.text.secondary
  }
  const color = colorMap[tone] || colorMap.default

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={1}
      sx={{
        p: 1,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: alpha(color, 0.24),
        bgcolor: alpha(color, 0.07)
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color,
          minWidth: 72,
          fontWeight: 900,
          textTransform: 'uppercase'
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
        <Box component="span" sx={{ fontWeight: 800 }}>{title}</Box>
        {reason && <Box component="span" color="text.secondary"> - {reason}</Box>}
      </Typography>
      {onAction &&
        <Button size="small" color={tone === 'default' ? 'primary' : tone} onClick={onAction}>
          {actionLabel}
        </Button>
      }
    </Stack>
  )
}

function AiTabItem({ chipLabel, chipColor = 'default', title, reason, actionText, actionLabel, onAction }) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
          {chipLabel &&
            <Chip
              size="small"
              label={String(chipLabel).toUpperCase()}
              color={chipColor}
              variant="outlined"
              sx={{ height: 22, fontWeight: 800 }}
            />
          }
          <Typography variant="body2" sx={{ fontWeight: 900 }}>{title}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {reason || 'Chưa có lý do chi tiết.'}
        </Typography>
        {actionText &&
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {actionLabel}: {actionText}
          </Typography>
        }
        {onAction &&
          <Box>
            <Button size="small" variant="text" onClick={onAction}>
              Lọc trong Kanban
            </Button>
          </Box>
        }
      </Stack>
    </Box>
  )
}

function TabContent({ items, emptyText, renderItem }) {
  const visibleItems = items.slice(0, 3)
  const hiddenCount = Math.max(items.length - visibleItems.length, 0)

  if (!items.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyText}
      </Typography>
    )
  }

  return (
    <Stack spacing={1}>
      {visibleItems.map((item, index) => (
        <Box key={`ai-tab-item-${index}`}>
          {renderItem(item)}
        </Box>
      ))}
      {hiddenCount > 0 &&
        <Typography variant="caption" color="text.secondary">
          Còn {hiddenCount} mục khác...
        </Typography>
      }
    </Stack>
  )
}

function DetailTabs({ activeTab, onChangeTab, tabs }) {
  const activeItem = tabs.find(item => item.value === activeTab) || tabs[0]

  return (
    <Box>
      <Tabs
        value={activeItem.value}
        onChange={(_, nextValue) => onChangeTab(nextValue)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          minHeight: 42,
          '& .MuiTabs-flexContainer': {
            gap: 0.5,
            p: 0.5,
            borderRadius: 1.5,
            bgcolor: 'action.hover',
            width: 'fit-content'
          },
          '& .MuiTabs-indicator': { display: 'none' },
          '& .MuiTab-root': {
            minHeight: 34,
            px: 1.5,
            borderRadius: 1.25,
            textTransform: 'none',
            fontWeight: 800,
            color: 'text.secondary'
          },
          '& .Mui-selected': {
            color: 'text.primary',
            bgcolor: 'background.paper',
            boxShadow: 1
          }
        }}
      >
        {tabs.map(item => (
          <Tab
            key={item.value}
            value={item.value}
            label={`${item.label} (${item.items.length})`}
          />
        ))}
      </Tabs>

      <Box sx={{ pt: 1.5 }}>
        <TabContent
          items={activeItem.items}
          emptyText={activeItem.emptyText}
          renderItem={activeItem.renderItem}
        />
      </Box>
    </Box>
  )
}

function LoadingHero() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
      <Skeleton variant="circular" width={76} height={76} />
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Skeleton variant="text" width="44%" />
        <Skeleton variant="text" width="76%" />
        <Skeleton variant="rounded" height={42} />
      </Stack>
    </Stack>
  )
}

function EmptyHero({ loading, onAnalyze }) {
  return (
    <Box
      sx={{
        py: 2,
        px: 1,
        borderRadius: 2,
        textAlign: 'center',
        bgcolor: 'action.hover'
      }}
    >
      <Stack spacing={1.25} alignItems="center">
        <AutoAwesomeIcon color="primary" />
        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
          AI sẵn sàng phân tích board này
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bấm phân tích để xem rủi ro, card cần ưu tiên và gợi ý hành động tiếp theo.
        </Typography>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress color="inherit" size={16} /> : <AutoAwesomeIcon />}
          disabled={loading}
          onClick={onAnalyze}
        >
          {loading ? 'Đang phân tích...' : 'AI phân tích board'}
        </Button>
      </Stack>
    </Box>
  )
}

function ActionBar({ loading, onAnalyze, onDrillDown }) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Button size="small" variant="outlined" onClick={() => onDrillDown({ overdue: true, dueSoon: false })}>
        Xem quá hạn
      </Button>
      <Button size="small" variant="outlined" onClick={() => onDrillDown({ dueSoon: true, overdue: false })}>
        Xem sắp đến hạn
      </Button>
      <Button size="small" variant="outlined" onClick={() => onDrillDown({ priorities: [CARD_PRIORITIES.HIGH, CARD_PRIORITIES.URGENT] })}>
        Xem ưu tiên cao
      </Button>
      <Button size="small" variant="outlined" onClick={() => onDrillDown({ statuses: [CARD_STATUSES.DONE] })}>
        Xem đã hoàn thành
      </Button>
      <Button
        size="small"
        variant="contained"
        startIcon={loading ? <CircularProgress color="inherit" size={14} /> : <AutoAwesomeIcon />}
        disabled={loading}
        onClick={onAnalyze}
      >
        {loading ? 'Đang phân tích...' : 'Phân tích lại'}
      </Button>
    </Stack>
  )
}

function AiAssistantPanel({
  analysis,
  loading,
  error,
  expanded,
  activeTab,
  onAnalyze,
  onToggleExpanded,
  onChangeTab,
  onDrillDown
}) {
  const hasAnalysis = Boolean(analysis)
  const summary = analysis?.summary || {}
  const risks = getSafeArray(analysis?.risks)
  const priorityRecommendations = getSafeArray(analysis?.priorityRecommendations)
  const workloadInsights = getSafeArray(analysis?.workloadInsights)
  const nextActions = getSafeArray(analysis?.nextActions)
  const warnings = getSafeArray(analysis?.warnings)
  const topRisk = risks[0]
  const topCard = priorityRecommendations[0]

  const tabs = [
    {
      value: 'risks',
      label: 'Rủi ro',
      items: risks,
      emptyText: 'Chưa phát hiện rủi ro nghiêm trọng.',
      renderItem: (item) => (
        <AiTabItem
          chipLabel={item?.level || 'info'}
          chipColor={getRiskColor(item?.level)}
          title={item?.title || 'Rủi ro'}
          reason={item?.reason}
          actionLabel="Gợi ý"
          actionText={item?.suggestedAction}
          onAction={() => onDrillDown(getRiskPatch(item))}
        />
      )
    },
    {
      value: 'priority',
      label: 'Ưu tiên',
      items: priorityRecommendations,
      emptyText: 'Chưa có card cần ưu tiên đặc biệt.',
      renderItem: (item) => (
        <AiTabItem
          chipLabel={item?.priority}
          chipColor={priorityChipColors[item?.priority] || 'default'}
          title={item?.title || 'Card chưa có tiêu đề'}
          reason={item?.reason}
          actionLabel="Bước tiếp theo"
          actionText={item?.suggestedNextStep}
          onAction={item?.priority ? () => onDrillDown({ priorities: [item.priority] }) : null}
        />
      )
    },
    {
      value: 'workload',
      label: 'Workload',
      items: workloadInsights,
      emptyText: 'Workload hiện chưa có dấu hiệu mất cân bằng rõ ràng.',
      renderItem: (item) => (
        <AiTabItem
          chipLabel={item?.riskLevel || 'low'}
          chipColor={getRiskColor(item?.riskLevel)}
          title={item?.displayName || 'Thành viên'}
          reason={item?.reason}
          actionLabel="Gợi ý"
          actionText={item?.suggestedAction}
        />
      )
    },
    {
      value: 'actions',
      label: 'Hành động',
      items: nextActions,
      emptyText: 'Chưa có gợi ý hành động bổ sung.',
      renderItem: (item) => (
        <AiTabItem
          chipLabel={item?.priority}
          chipColor={priorityChipColors[item?.priority] || 'default'}
          title={item?.label || 'Hành động tiếp theo'}
          reason={item?.reason}
        />
      )
    }
  ]

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2.25 }, '&:last-child': { pb: { xs: 1.75, sm: 2.25 } } }}>
        <Stack spacing={1.75}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={1.5}>
            <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  flexShrink: 0
                }}
              >
                <PsychologyIcon />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>AI Assistant</Typography>
                  {hasAnalysis &&
                    <Chip size="small" variant="outlined" label={getModeLabel(analysis.mode)} sx={{ height: 22, fontWeight: 700 }} />
                  }
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Phân tích rủi ro, ưu tiên và workload của board
                </Typography>
                {hasAnalysis && formatGeneratedAt(analysis.generatedAt) &&
                  <Typography variant="caption" color="text.secondary">
                    Phân tích lúc: {formatGeneratedAt(analysis.generatedAt)}
                  </Typography>
                }
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {!hasAnalysis &&
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress color="inherit" size={16} /> : <AutoAwesomeIcon />}
                  disabled={loading}
                  onClick={onAnalyze}
                >
                  {loading ? 'Đang phân tích...' : 'AI phân tích board'}
                </Button>
              }

              {hasAnalysis &&
                <Button
                  variant="outlined"
                  startIcon={loading ? <CircularProgress color="inherit" size={16} /> : <RefreshIcon />}
                  disabled={loading}
                  onClick={onAnalyze}
                >
                  {loading ? 'Đang phân tích...' : 'Phân tích lại'}
                </Button>
              }

              {hasAnalysis &&
                <Button
                  variant="text"
                  startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  disabled={loading}
                  onClick={onToggleExpanded}
                >
                  {expanded ? 'Thu gọn' : 'Mở rộng'}
                </Button>
              }
            </Stack>
          </Stack>

          {error &&
            <Alert severity="error">{error}</Alert>
          }

          {loading && !hasAnalysis && <LoadingHero />}

          {!loading && !hasAnalysis && <EmptyHero loading={loading} onAnalyze={onAnalyze} />}

          {hasAnalysis &&
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
                <HealthScore summary={summary} />

                <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      {summary?.title || 'Phân tích board'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {summary?.description || 'Chưa có tổng quan từ AI.'}
                    </Typography>
                  </Box>

                  {topRisk &&
                    <InsightStrip
                      tone={getRiskColor(topRisk.level)}
                      label="Rủi ro chính"
                      title={topRisk.title || 'Rủi ro cần chú ý'}
                      reason={topRisk.reason}
                      actionLabel="Lọc"
                      onAction={() => onDrillDown(getRiskPatch(topRisk))}
                    />
                  }

                  {topCard &&
                    <InsightStrip
                      tone="primary"
                      label="Card ưu tiên"
                      title={topCard.title || 'Card cần ưu tiên'}
                      reason={topCard.reason}
                      actionLabel="Lọc"
                      onAction={topCard.priority ? () => onDrillDown({ priorities: [topCard.priority] }) : null}
                    />
                  }

                  <ActionBar loading={loading} onAnalyze={onAnalyze} onDrillDown={onDrillDown} />
                </Stack>
              </Stack>

              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Stack spacing={1.5} sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                  {warnings.length > 0 &&
                    <Alert severity="warning">
                      {warnings.join(' - ')}
                    </Alert>
                  }

                  <DetailTabs
                    activeTab={activeTab}
                    onChangeTab={onChangeTab}
                    tabs={tabs}
                  />
                </Stack>
              </Collapse>
            </Stack>
          }
        </Stack>
      </CardContent>
    </Card>
  )
}

export default AiAssistantPanel
