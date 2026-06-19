import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts'
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

const getNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0

const isValidStatus = (status) => Object.values(CARD_STATUSES).includes(status)

const isValidPriority = (priority) => Object.values(CARD_PRIORITIES).includes(priority)

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const entry = payload[0]
  const name = entry?.payload?.label || label || entry?.name || 'Value'
  const value = getNumber(entry?.value)

  return (
    <Paper
      elevation={3}
      sx={{
        px: 1.25,
        py: 0.75,
        border: (theme) =>
          theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.15)'
            : '1px solid rgba(0,0,0,0.09)',
        borderRadius: 1.25,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#13161e' : '#ffffff',
        boxShadow: '0 4px 16px rgba(0,0,0,0.16)'
      }}
    >
      <Typography variant="caption" color="text.secondary">{name}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 900 }}>{value}</Typography>
    </Paper>
  )
}

function ChartCard({ title, emptyText, isEmpty, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        minHeight: 280,
        border: (theme) =>
          theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(0,0,0,0.09)',
        borderRadius: 2.5,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f2436' : '#ffffff',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1.5 }}>{title}</Typography>
      {isEmpty
        ? <Box sx={{ height: 210, display: 'grid', placeItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
        </Box>
        : children
      }
    </Paper>
  )
}

function ChartsRow({ data, onDrillDown }) {
  const theme = useTheme()

  const statusColors = {
    [CARD_STATUSES.TODO]: theme.palette.text.disabled,
    [CARD_STATUSES.IN_PROGRESS]: theme.palette.info.main,
    [CARD_STATUSES.IN_REVIEW]: theme.palette.secondary.main,
    [CARD_STATUSES.DONE]: theme.palette.success.main,
    [CARD_STATUSES.CANCELLED]: theme.palette.action.disabled
  }

  const priorityColors = {
    [CARD_PRIORITIES.LOW]: theme.palette.text.disabled,
    [CARD_PRIORITIES.MEDIUM]: theme.palette.info.main,
    [CARD_PRIORITIES.HIGH]: theme.palette.warning.main,
    [CARD_PRIORITIES.URGENT]: theme.palette.error.main
  }

  const statusChartData = (Array.isArray(data?.cardsByStatus) ? data.cardsByStatus : [])
    .map(item => ({
      status: item?.status,
      label: statusLabels[item?.status] || item?.status,
      count: getNumber(item?.count)
    }))
    .filter(item => isValidStatus(item.status) && item.count > 0)

  const priorityChartData = (Array.isArray(data?.cardsByPriority) ? data.cardsByPriority : [])
    .map(item => ({
      priority: item?.priority,
      label: priorityLabels[item?.priority] || item?.priority,
      count: getNumber(item?.count)
    }))
    .filter(item => isValidPriority(item.priority))

  const hasStatusChartData = statusChartData.length > 0
  const hasPriorityChartData = priorityChartData.some(item => item.count > 0)

  return (
    <Grid container spacing={1.5}>
      <Grid item xs={12} md={6}>
        <ChartCard
          title="Phân bố theo trạng thái"
          emptyText="Chưa có dữ liệu trạng thái."
          isEmpty={!hasStatusChartData}
        >
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={statusChartData}
                dataKey="count"
                nameKey="label"
                innerRadius={54}
                outerRadius={84}
                paddingAngle={2}
                cursor="pointer"
                isAnimationActive
                animationDuration={900}
                onClick={(entry) => {
                  if (isValidStatus(entry?.status)) onDrillDown({ statuses: [entry.status] })
                }}
              >
                {statusChartData.map(item => (
                  <Cell
                    key={item.status}
                    fill={statusColors[item.status] || theme.palette.text.disabled}
                    stroke={theme.palette.background.paper}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <RechartsTooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <ChartCard
          title="Phân bố theo mức độ ưu tiên"
          emptyText="Chưa có dữ liệu mức độ ưu tiên."
          isEmpty={!hasPriorityChartData}
        >
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={priorityChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={alpha(theme.palette.text.primary, 0.12)} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: theme.palette.action.hover }} />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                cursor="pointer"
                isAnimationActive
                animationDuration={900}
                onClick={(entry) => {
                  if (isValidPriority(entry?.priority)) onDrillDown({ priorities: [entry.priority] })
                }}
              >
                {priorityChartData.map(item => (
                  <Cell key={item.priority} fill={priorityColors[item.priority] || theme.palette.text.disabled} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>
    </Grid>
  )
}

export default ChartsRow
