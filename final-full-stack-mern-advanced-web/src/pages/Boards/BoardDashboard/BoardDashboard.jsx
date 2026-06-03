import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
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
import { fetchBoardDashboardAPI } from '~/apis'
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
