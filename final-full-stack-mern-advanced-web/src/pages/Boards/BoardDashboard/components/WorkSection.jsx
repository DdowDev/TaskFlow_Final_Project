import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const priorityLabels = {
  [CARD_PRIORITIES.LOW]: 'Low',
  [CARD_PRIORITIES.MEDIUM]: 'Medium',
  [CARD_PRIORITIES.HIGH]: 'High',
  [CARD_PRIORITIES.URGENT]: 'Urgent'
}

const priorityChipColors = {
  [CARD_PRIORITIES.LOW]: 'default',
  [CARD_PRIORITIES.MEDIUM]: 'info',
  [CARD_PRIORITIES.HIGH]: 'warning',
  [CARD_PRIORITIES.URGENT]: 'error'
}

const statusLabels = {
  [CARD_STATUSES.TODO]: 'To do',
  [CARD_STATUSES.IN_PROGRESS]: 'In progress',
  [CARD_STATUSES.IN_REVIEW]: 'In review',
  [CARD_STATUSES.DONE]: 'Done',
  [CARD_STATUSES.CANCELLED]: 'Cancelled'
}

const statusChipColors = {
  [CARD_STATUSES.TODO]: 'default',
  [CARD_STATUSES.IN_PROGRESS]: 'info',
  [CARD_STATUSES.IN_REVIEW]: 'secondary',
  [CARD_STATUSES.DONE]: 'success',
  [CARD_STATUSES.CANCELLED]: 'default'
}

const getNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0

const getAssigneeLabel = (assignees) => {
  if (!Array.isArray(assignees) || !assignees.length) return 'Unassigned'

  const names = assignees
    .map(user => user?.displayName || user?.email)
    .filter(Boolean)

  if (!names.length) return 'Unassigned'
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
}

const getRelativeDueDate = (value) => {
  if (!value) return { label: 'Chưa có hạn', color: 'default', variant: 'outlined' }

  const dueDate = Number(value)
  if (!Number.isFinite(dueDate)) return { label: 'Chưa có hạn', color: 'default', variant: 'outlined' }

  const diff = dueDate - Date.now()
  const absDiff = Math.abs(diff)
  const hours = Math.max(Math.ceil(absDiff / HOUR), 1)
  const days = Math.max(Math.ceil(absDiff / DAY), 1)

  if (diff < 0) {
    return {
      label: absDiff < DAY ? `${hours}h quá hạn` : `${days}d quá hạn`,
      color: 'error',
      variant: 'filled'
    }
  }

  if (diff < DAY) {
    return { label: `còn ${hours}h`, color: 'warning', variant: 'filled' }
  }

  if (diff < 3 * DAY) {
    return { label: `còn ${days}d`, color: 'warning', variant: 'filled' }
  }

  return { label: `còn ${days}d`, color: 'default', variant: 'outlined' }
}

function SectionCard({ title, count, emptyText, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        bgcolor: 'background.paper'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{title}</Typography>
        <Chip size="small" label={count} sx={{ height: 22, fontWeight: 800 }} />
      </Stack>

      {count === 0
        ? <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
        </Box>
        : children
      }
    </Paper>
  )
}

function PriorityChip({ priority }) {
  if (!priority) return null

  return (
    <Chip
      size="small"
      label={priorityLabels[priority] || priority}
      color={priorityChipColors[priority] || 'default'}
      variant="outlined"
      sx={{ height: 22, fontWeight: 800 }}
    />
  )
}

function StatusChip({ status }) {
  if (!status) return null

  return (
    <Chip
      size="small"
      label={statusLabels[status] || status}
      color={statusChipColors[status] || 'default'}
      sx={{ height: 22, fontWeight: 800 }}
    />
  )
}

function DueChip({ dueDate }) {
  const dueMeta = getRelativeDueDate(dueDate)

  return (
    <Chip
      size="small"
      label={dueMeta.label}
      color={dueMeta.color}
      variant={dueMeta.variant}
      sx={{ height: 22, fontWeight: 800 }}
    />
  )
}

function CardListItem({ card, onClick }) {
  const theme = useTheme()

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        borderRadius: 1.5
      }}
    >
      <Box
        sx={{
          width: '100%',
          px: 1.25,
          py: 1,
          borderRadius: 1.5,
          transition: 'background-color 0.15s ease',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }
        }}
      >
        <Stack spacing={0.75}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 900,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {card?.title || 'Untitled card'}
          </Typography>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <PriorityChip priority={card?.priority} />
            <StatusChip status={card?.status} />
            <DueChip dueDate={card?.dueDate} />
          </Stack>

          <Typography variant="caption" color="text.secondary" noWrap>
            {getAssigneeLabel(card?.assignees)}
          </Typography>
        </Stack>
      </Box>
    </ButtonBase>
  )
}

function WorkloadRow({ member, maxCards }) {
  const totalCards = getNumber(member?.totalCards)
  const memberName = member?.displayName || member?.email || 'Unknown member'

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Avatar src={member?.avatar || undefined} sx={{ width: 28, height: 28, fontSize: 13 }}>
            {memberName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>{memberName}</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
          {totalCards}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={(totalCards / maxCards) * 100}
        sx={{
          height: 5,
          borderRadius: 999,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
        }}
      />
    </Stack>
  )
}

function WorkSection({ overdueCards, dueSoonCards, memberWorkload, onDrillDown }) {
  const safeOverdueCards = Array.isArray(overdueCards) ? overdueCards : []
  const safeDueSoonCards = Array.isArray(dueSoonCards) ? dueSoonCards : []
  const safeMemberWorkload = Array.isArray(memberWorkload) ? memberWorkload : []
  const maxCards = Math.max(...safeMemberWorkload.map(member => getNumber(member.totalCards)), 1)

  return (
    <Grid container spacing={1.5}>
      <Grid item xs={12} md={4}>
        <SectionCard
          title="Overdue"
          count={safeOverdueCards.length}
          emptyText="Không có công việc quá hạn."
        >
          <Stack spacing={0.5}>
            {safeOverdueCards.map(card => (
              <CardListItem
                key={card?._id || card?.title}
                card={card}
                onClick={() => onDrillDown({ overdue: true, dueSoon: false })}
              />
            ))}
          </Stack>
        </SectionCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <SectionCard
          title="Due Soon"
          count={safeDueSoonCards.length}
          emptyText="Không có công việc sắp đến hạn."
        >
          <Stack spacing={0.5}>
            {safeDueSoonCards.map(card => (
              <CardListItem
                key={card?._id || card?.title}
                card={card}
                onClick={() => onDrillDown({ dueSoon: true, overdue: false })}
              />
            ))}
          </Stack>
        </SectionCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <SectionCard
          title="Workload"
          count={safeMemberWorkload.length}
          emptyText="Chưa có thành viên được gán công việc."
        >
          <Stack spacing={1.5}>
            {safeMemberWorkload.map(member => (
              <WorkloadRow
                key={member?.memberId || member?.email || member?.displayName}
                member={member}
                maxCards={maxCards}
              />
            ))}
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>
  )
}

export default WorkSection
