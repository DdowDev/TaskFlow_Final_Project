import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import GroupIcon from '@mui/icons-material/Group'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PsychologyIcon from '@mui/icons-material/Psychology'
import RefreshIcon from '@mui/icons-material/Refresh'
import { alpha, useTheme } from '@mui/material/styles'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts'
import { analyzeBoardWithAIAPI, fetchBoardDashboardAPI } from '~/apis'
import { CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'

const statusLabels = {
  [CARD_STATUSES.TODO]: 'Todo',
  [CARD_STATUSES.IN_PROGRESS]: 'In Progress',
  [CARD_STATUSES.IN_REVIEW]: 'In Review',
  [CARD_STATUSES.DONE]: 'Done',
  [CARD_STATUSES.CANCELLED]: 'Cancelled'
}

const priorityLabels = {
  [CARD_PRIORITIES.LOW]: 'Low',
  [CARD_PRIORITIES.MEDIUM]: 'Medium',
  [CARD_PRIORITIES.HIGH]: 'High',
  [CARD_PRIORITIES.URGENT]: 'Urgent'
}

const priorityChipColors = {
  [CARD_PRIORITIES.LOW]: 'default',
  [CARD_PRIORITIES.MEDIUM]: 'primary',
  [CARD_PRIORITIES.HIGH]: 'warning',
  [CARD_PRIORITIES.URGENT]: 'error'
}

const getNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0

const formatDate = (value) => {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No due date'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  })
}

const getAssigneeLabel = (assignees) => {
  if (!Array.isArray(assignees) || !assignees.length) return 'Unassigned'

  const names = assignees
    .map(user => user?.displayName || user?.email)
    .filter(Boolean)

  if (!names.length) return 'Unassigned'
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
}

const getSafeArray = (value) => Array.isArray(value) ? value : []

const formatGeneratedAt = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getHealthColor = (score) => {
  const safeScore = getNumber(score)
  if (safeScore <= 40) return 'error'
  if (safeScore <= 70) return 'warning'
  return 'success'
}

const getModeLabel = (mode) => {
  if (mode === 'mock') return 'Mock mode'
  if (mode === 'fallback') return 'Fallback analysis'
  if (mode === 'real') return 'AI analysis'
  return 'AI analysis'
}

const getRiskColor = (level) => {
  if (level === 'high') return 'error'
  if (level === 'medium') return 'warning'
  if (level === 'low') return 'info'
  return 'default'
}

function StatCard({ icon, label, value, helper, onClick }) {
  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        '&:hover': onClick
          ? {
            borderColor: 'primary.main',
            transform: 'translateY(-1px)'
          }
          : {}
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
        }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>{value}</Typography>
          {helper && <Typography variant="caption" color="text.secondary">{helper}</Typography>}
        </Box>
      </Stack>
    </Paper>
  )
}

function ChartCard({ title, children, isEmpty }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: 360,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>{title}</Typography>
      {isEmpty
        ? <Box sx={{ height: 280, display: 'grid', placeItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">No chart data yet.</Typography>
        </Box>
        : children
      }
    </Paper>
  )
}

function DueCardList({ title, cards, emptyText, onClick }) {
  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease',
        '&:hover': onClick ? { borderColor: 'primary.main' } : {}
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>{title}</Typography>
      {!cards?.length
        ? <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
        : <Stack spacing={1.25}>
          {cards.map(card => {
            const priority = card?.priority
            const priorityLabel = priorityLabels[priority] || priority
            return (
              <Box
                key={card._id}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Stack spacing={0.75}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{card?.title || 'Untitled card'}</Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {priorityLabel &&
                      <Chip
                        size="small"
                        label={priorityLabel}
                        color={priorityChipColors[priority] || 'default'}
                        variant={priority === CARD_PRIORITIES.LOW ? 'outlined' : 'filled'}
                      />
                    }
                    <Chip size="small" variant="outlined" label={formatDate(card?.dueDate)} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {getAssigneeLabel(card?.assignees)}
                  </Typography>
                </Stack>
              </Box>
            )
          })}
        </Stack>
      }
    </Paper>
  )
}

function WorkloadCard({ workload }) {
  const maxCards = Math.max(...(workload || []).map(member => getNumber(member.totalCards)), 1)

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>Member Workload</Typography>
      {!workload?.length
        ? <Typography variant="body2" color="text.secondary">No assigned cards yet.</Typography>
        : <Stack spacing={1.5}>
          {workload.map(member => {
            const totalCards = getNumber(member.totalCards)
            const memberName = member.displayName || member.email || 'Unknown member'
            return (
              <Stack key={member.memberId || memberName} spacing={0.75}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                    <Avatar src={member.avatar || undefined} sx={{ width: 28, height: 28 }}>
                      {memberName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" noWrap>{memberName}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{totalCards}</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(totalCards / maxCards) * 100}
                  sx={{ height: 7, borderRadius: 999 }}
                />
              </Stack>
            )
          })}
        </Stack>
      }
    </Paper>
  )
}

function AiListBlock({ title, items, emptyText, renderItem }) {
  const visibleItems = items.slice(0, 3)
  const hiddenCount = Math.max(items.length - visibleItems.length, 0)

  if (!items.length) {
    return <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
  }

  return (
    <Stack spacing={1}>
      {visibleItems.map((item, index) => (
        <Box
          key={`${title}-${index}`}
          sx={{
            py: 1,
            borderBottom: index === visibleItems.length - 1 ? 'none' : '1px solid',
            borderColor: 'divider'
          }}
        >
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

function AiMetricCard({ label, value, chipLabel, chipColor = 'default', children }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{label}</Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>{value}</Typography>
            {chipLabel && <Chip size="small" label={chipLabel} color={chipColor} />}
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}

function AiSummaryBlock({ summary, risksCount, priorityCount, actionsCount }) {
  const hasHealthScore = Number.isFinite(Number(summary?.healthScore))
  const healthScore = Math.max(Math.min(getNumber(summary?.healthScore), 100), 0)
  const healthColor = getHealthColor(healthScore)

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Tổng quan</Typography>
            {summary?.healthStatus &&
              <Chip size="small" label={summary.healthStatus} color={healthColor} />
            }
          </Stack>

          <Box>
            <Typography variant="body1" sx={{ fontWeight: 800 }}>
              {summary?.title || 'Board analysis'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {summary?.description || 'No summary available.'}
            </Typography>
          </Box>

          <Grid container spacing={1.25}>
            <Grid item xs={12} sm={6} md={3}>
              <AiMetricCard
                label="Sức khỏe board"
                value={hasHealthScore ? `${healthScore}/100` : '-'}
                chipLabel={hasHealthScore ? summary?.healthStatus : null}
                chipColor={healthColor}
              >
                {hasHealthScore &&
                  <LinearProgress
                    variant="determinate"
                    value={healthScore}
                    color={healthColor}
                    sx={{ height: 7, borderRadius: 999 }}
                  />
                }
              </AiMetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AiMetricCard label="Rủi ro" value={risksCount} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AiMetricCard label="Card cần ưu tiên" value={priorityCount} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AiMetricCard label="Hành động đề xuất" value={actionsCount} />
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  )
}

function AiCompactItem({ chipLabel, chipColor = 'default', title, reason, actionLabel, actionText }) {
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
        {chipLabel && <Chip size="small" label={chipLabel} color={chipColor} />}
        <Typography variant="body2" sx={{ fontWeight: 800 }}>{title}</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {reason || 'Chưa có lý do chi tiết.'}
      </Typography>
      {actionText &&
        <Typography variant="caption" color="text.secondary">
          {actionLabel}: {actionText}
        </Typography>
      }
    </Stack>
  )
}

function AiDetailTabs({ activeTab, onChangeTab, risks, priorityRecommendations, workloadInsights, nextActions }) {
  const tabItems = [
    {
      value: 'risks',
      label: 'Rủi ro',
      items: risks,
      emptyText: 'Chưa phát hiện rủi ro nghiêm trọng.',
      renderItem: (item) => (
        <AiCompactItem
          chipLabel={item?.level || 'info'}
          chipColor={getRiskColor(item?.level)}
          title={item?.title || 'Rủi ro'}
          reason={item?.reason}
          actionLabel="Gợi ý"
          actionText={item?.suggestedAction}
        />
      )
    },
    {
      value: 'priority',
      label: 'Ưu tiên',
      items: priorityRecommendations,
      emptyText: 'Chưa có card cần ưu tiên đặc biệt.',
      renderItem: (item) => (
        <AiCompactItem
          chipLabel={item?.priority}
          chipColor={priorityChipColors[item?.priority] || 'default'}
          title={item?.title || 'Untitled card'}
          reason={item?.reason}
          actionLabel="Bước tiếp theo"
          actionText={item?.suggestedNextStep}
        />
      )
    },
    {
      value: 'workload',
      label: 'Workload',
      items: workloadInsights,
      emptyText: 'Workload hiện chưa có dấu hiệu mất cân bằng rõ ràng.',
      renderItem: (item) => (
        <AiCompactItem
          chipLabel={item?.riskLevel || 'low'}
          chipColor={getRiskColor(item?.riskLevel)}
          title={item?.displayName || 'Unknown member'}
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
        <AiCompactItem
          chipLabel={item?.priority}
          chipColor={getRiskColor(item?.priority)}
          title={item?.label || 'Hành động tiếp theo'}
          reason={item?.reason}
        />
      )
    }
  ]
  const activeItem = tabItems.find(item => item.value === activeTab) || tabItems[0]

  return (
    <Box>
      <Tabs
        value={activeItem.value}
        onChange={(_, nextValue) => onChangeTab(nextValue)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          minHeight: 38,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 38,
            textTransform: 'none',
            fontWeight: 800
          }
        }}
      >
        {tabItems.map(item => (
          <Tab
            key={item.value}
            value={item.value}
            label={`${item.label} (${item.items.length})`}
          />
        ))}
      </Tabs>

      <Box sx={{ pt: 1.5 }}>
        <AiListBlock
          title={activeItem.label}
          items={activeItem.items}
          emptyText={activeItem.emptyText}
          renderItem={activeItem.renderItem}
        />
      </Box>
    </Box>
  )
}

function AiAssistantSection({ analysis, isLoading, error, onAnalyze, isExpanded, activeTab, onToggleExpanded, onChangeTab }) {
  const hasAnalysis = Boolean(analysis)
  const risks = getSafeArray(analysis?.risks)
  const priorityRecommendations = getSafeArray(analysis?.priorityRecommendations)
  const workloadInsights = getSafeArray(analysis?.workloadInsights)
  const nextActions = getSafeArray(analysis?.nextActions)
  const warnings = getSafeArray(analysis?.warnings)

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      <CardContent>
        <Stack spacing={1.75}>
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={1.5}>
            <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                flexShrink: 0
              }}>
                <PsychologyIcon />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>AI Assistant</Typography>
                  {hasAnalysis &&
                    <Chip size="small" variant="outlined" label={getModeLabel(analysis.mode)} />
                  }
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Phân tích rủi ro, ưu tiên và workload của board.
                </Typography>
                {hasAnalysis &&
                  <Typography variant="caption" color="text.secondary">
                    Phân tích lúc: {formatGeneratedAt(analysis.generatedAt)}
                  </Typography>
                }
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant={hasAnalysis ? 'outlined' : 'contained'}
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : hasAnalysis ? <RefreshIcon /> : <AutoAwesomeIcon />}
                disabled={isLoading}
                onClick={onAnalyze}
              >
                {isLoading ? 'Đang phân tích...' : hasAnalysis ? 'Phân tích lại' : 'AI phân tích board'}
              </Button>

              {hasAnalysis &&
                <Button
                  variant="text"
                  startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  disabled={isLoading}
                  onClick={onToggleExpanded}
                >
                  {isExpanded ? 'Thu gọn' : 'Mở rộng'}
                </Button>
              }
            </Stack>
          </Stack>

          {error &&
            <Alert severity="error">{error}</Alert>
          }

          {isLoading &&
            <Grid container spacing={1.25}>
              <Grid item xs={12} md={6}><Skeleton variant="rounded" height={72} /></Grid>
              <Grid item xs={12} md={6}><Skeleton variant="rounded" height={72} /></Grid>
              <Grid item xs={12}><Skeleton variant="rounded" height={96} /></Grid>
            </Grid>
          }

          {hasAnalysis && !isLoading &&
            <Stack spacing={1.5}>
              <AiSummaryBlock
                summary={analysis.summary || {}}
                risksCount={risks.length}
                priorityCount={priorityRecommendations.length}
                actionsCount={nextActions.length}
              />

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Stack spacing={1.5}>
                  <AiDetailTabs
                    activeTab={activeTab}
                    onChangeTab={onChangeTab}
                    risks={risks}
                    priorityRecommendations={priorityRecommendations}
                    workloadInsights={workloadInsights}
                    nextActions={nextActions}
                  />

                  {warnings.length > 0 &&
                    <Stack spacing={1}>
                      {warnings.map((warning, index) => (
                        <Alert key={`ai-warning-${index}`} severity="warning">
                          {warning}
                        </Alert>
                      ))}
                    </Stack>
                  }
                </Stack>
              </Collapse>
            </Stack>
          }
        </Stack>
      </CardContent>
    </Card>
  )
}
function DashboardSkeleton() {
  return (
    <Grid container spacing={2}>
      {[1, 2, 3, 4, 5, 6].map(item => (
        <Grid key={item} item xs={12} sm={6} md={4} lg={2}>
          <Skeleton variant="rounded" height={112} />
        </Grid>
      ))}
      <Grid item xs={12} md={6}><Skeleton variant="rounded" height={360} /></Grid>
      <Grid item xs={12} md={6}><Skeleton variant="rounded" height={360} /></Grid>
      <Grid item xs={12} md={6}><Skeleton variant="rounded" height={260} /></Grid>
      <Grid item xs={12} md={6}><Skeleton variant="rounded" height={260} /></Grid>
    </Grid>
  )
}

function BoardDashboard({ boardId, isActive, onDrillDown = () => {} }) {
  const theme = useTheme()
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiExpanded, setAiExpanded] = useState(false)
  const [activeAiTab, setActiveAiTab] = useState('risks')

  useEffect(() => {
    if (!boardId || !isActive) return

    let isCancelled = false

    const fetchDashboard = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchBoardDashboardAPI(boardId)
        if (!isCancelled) setDashboard(data)
      } catch (err) {
        if (!isCancelled) setError(err?.message || 'Could not load board dashboard.')
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchDashboard()

    return () => {
      isCancelled = true
    }
  }, [boardId, isActive])

  useEffect(() => {
    setAiAnalysis(null)
    setAiError(null)
    setIsAiLoading(false)
    setAiExpanded(false)
    setActiveAiTab('risks')
  }, [boardId])

  const handleAnalyzeBoardWithAI = async () => {
    if (!boardId || isAiLoading) return

    setIsAiLoading(true)
    setAiError(null)

    try {
      const result = await analyzeBoardWithAIAPI(boardId)
      setAiAnalysis(result)
      setAiExpanded(false)
      setActiveAiTab('risks')
    } catch (err) {
      setAiError(err?.response?.data?.message || err?.message || 'Could not analyze board with AI.')
    } finally {
      setIsAiLoading(false)
    }
  }

  const statusColors = useMemo(() => ({
    [CARD_STATUSES.TODO]: theme.palette.grey[500],
    [CARD_STATUSES.IN_PROGRESS]: theme.palette.primary.main,
    [CARD_STATUSES.IN_REVIEW]: theme.palette.warning.main,
    [CARD_STATUSES.DONE]: theme.palette.success.main,
    [CARD_STATUSES.CANCELLED]: theme.palette.error.main
  }), [theme])

  const priorityColors = useMemo(() => ({
    [CARD_PRIORITIES.LOW]: theme.palette.grey[500],
    [CARD_PRIORITIES.MEDIUM]: theme.palette.primary.main,
    [CARD_PRIORITIES.HIGH]: theme.palette.warning.main,
    [CARD_PRIORITIES.URGENT]: theme.palette.error.main
  }), [theme])

  const statusChartData = useMemo(() => {
    return (dashboard?.cardsByStatus || []).map(item => ({
      ...item,
      label: statusLabels[item.status] || item.status,
      count: getNumber(item.count)
    }))
  }, [dashboard])

  const priorityChartData = useMemo(() => {
    return (dashboard?.cardsByPriority || []).map(item => ({
      ...item,
      label: priorityLabels[item.priority] || item.priority,
      count: getNumber(item.count)
    }))
  }, [dashboard])

  const visibleStatusChartData = useMemo(() => {
    return statusChartData.filter(item => item.count > 0)
  }, [statusChartData])

  const hasStatusChartData = visibleStatusChartData.length > 0
  const hasPriorityChartData = priorityChartData.some(item => item.count > 0)
  const totalCards = getNumber(dashboard?.totalCards)

  return (
    <Box sx={{
      height: (theme) => theme.trello.boardContentHeight,
      overflowY: 'auto',
      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#34495e' : '#f4f6f8',
      p: { xs: 1.5, md: 2 }
    }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Board Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Track task status, due dates, checklist progress, and member workload for this board.
          </Typography>
        </Box>

        {isLoading && <DashboardSkeleton />}

        {!isLoading && error &&
          <Alert severity="error">{error}</Alert>
        }

        {!isLoading && !error && dashboard &&
          <>
            {totalCards === 0 &&
              <Alert severity="info">This board does not have active cards yet.</Alert>
            }

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard icon={<AssignmentTurnedInIcon />} label="Total Cards" value={totalCards} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard icon={<FactCheckIcon />} label="Completed" value={getNumber(dashboard.completedCards)} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard
                  icon={<EventBusyIcon />}
                  label="Overdue"
                  value={getNumber(dashboard.overdueCardsCount)}
                  onClick={() => onDrillDown({ overdue: true, dueSoon: false })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard
                  icon={<EventAvailableIcon />}
                  label="Due Soon"
                  value={getNumber(dashboard.dueSoonCardsCount)}
                  helper="Next 3 days"
                  onClick={() => onDrillDown({ dueSoon: true, overdue: false })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard icon={<CalendarMonthIcon />} label="No Due Date" value={getNumber(dashboard.cardsWithoutDueDate)} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard icon={<GroupIcon />} label="Checklist Avg" value={`${getNumber(dashboard.averageChecklistProgress)}%`} />
              </Grid>

              <Grid item xs={12}>
                <AiAssistantSection
                  analysis={aiAnalysis}
                  isLoading={isAiLoading}
                  error={aiError}
                  onAnalyze={handleAnalyzeBoardWithAI}
                  isExpanded={aiExpanded}
                  activeTab={activeAiTab}
                  onToggleExpanded={() => setAiExpanded(prev => !prev)}
                  onChangeTab={setActiveAiTab}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <ChartCard title="Cards by Status" isEmpty={!hasStatusChartData}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={visibleStatusChartData}
                        dataKey="count"
                        nameKey="label"
                        innerRadius={58}
                        outerRadius={90}
                        paddingAngle={3}
                        isAnimationActive
                        animationDuration={900}
                      >
                        {visibleStatusChartData.map(item => (
                          <Cell key={item.status} fill={statusColors[item.status] || theme.palette.grey[500]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <ChartCard title="Cards by Priority" isEmpty={!hasPriorityChartData}>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={priorityChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.12)} />
                      <XAxis dataKey="label" stroke={theme.palette.text.secondary} />
                      <YAxis allowDecimals={false} stroke={theme.palette.text.secondary} />
                      <RechartsTooltip />
                      <Bar
                        dataKey="count"
                        radius={[8, 8, 0, 0]}
                        fill={theme.palette.primary.main}
                        isAnimationActive
                        animationDuration={900}
                      >
                        {priorityChartData.map(item => (
                          <Cell key={item.priority} fill={priorityColors[item.priority] || theme.palette.primary.main} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <DueCardList
                  title="Overdue Cards"
                  cards={dashboard.overdueCards || []}
                  emptyText="No overdue cards."
                  onClick={() => onDrillDown({ overdue: true, dueSoon: false })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DueCardList
                  title="Due Soon"
                  cards={dashboard.dueSoonCards || []}
                  emptyText="No cards due in the next 3 days."
                  onClick={() => onDrillDown({ dueSoon: true, overdue: false })}
                />
              </Grid>

              <Grid item xs={12}>
                <WorkloadCard workload={dashboard.memberWorkload || []} />
              </Grid>
            </Grid>
          </>
        }
      </Stack>
    </Box>
  )
}

export default BoardDashboard
