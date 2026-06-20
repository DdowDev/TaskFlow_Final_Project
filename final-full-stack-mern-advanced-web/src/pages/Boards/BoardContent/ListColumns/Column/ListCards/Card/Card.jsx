import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import ArchiveIcon from '@mui/icons-material/Archive'
import { useConfirm } from 'material-ui-confirm'
import { updateCardDetailsAPI } from '~/apis'
import { updateCardInBoard, fetchBoardDetailsAPI } from '~/redux/activeBoard/activeBoardSlice'
import { toast } from 'react-toastify'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch } from 'react-redux'
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'
import { CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'

// ── Priority tag config ────────────────────────────────────────────
const PRIORITY_STYLES = {
  [CARD_PRIORITIES.LOW]: {
    label: 'Low',
    bg: 'rgba(16,185,129,0.14)',
    color: '#34d399',
    border: 'rgba(16,185,129,0.28)'
  },
  [CARD_PRIORITIES.MEDIUM]: {
    label: 'Medium',
    bg: 'rgba(245,158,11,0.14)',
    color: '#fbbf24',
    border: 'rgba(245,158,11,0.28)'
  },
  [CARD_PRIORITIES.HIGH]: {
    label: 'High',
    bg: 'rgba(239,68,68,0.14)',
    color: '#f87171',
    border: 'rgba(239,68,68,0.28)'
  },
  [CARD_PRIORITIES.URGENT]: {
    label: 'Urgent',
    bg: 'rgba(236,72,153,0.14)',
    color: '#f472b6',
    border: 'rgba(236,72,153,0.28)'
  }
}

const STATUS_STYLES = {
  [CARD_STATUSES.DONE]: {
    label: 'Completed',
    bg: 'rgba(16,185,129,0.12)',
    color: '#34d399',
    border: 'rgba(16,185,129,0.22)'
  },
  [CARD_STATUSES.CANCELLED]: {
    label: 'Cancelled',
    bg: 'rgba(239,68,68,0.1)',
    color: '#f87171',
    border: 'rgba(239,68,68,0.2)'
  }
}

// ── Helpers ────────────────────────────────────────────────────────
const toTimestamp = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

const formatShortDate = (value) => {
  const timestamp = toTimestamp(value)
  if (!timestamp) return null
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

const getDateRangeLabel = (startDate, dueDate) => {
  const startLabel = formatShortDate(startDate)
  const dueLabel = formatShortDate(dueDate)
  if (startLabel && dueLabel) return `${startLabel} – ${dueLabel}`
  return startLabel || dueLabel || null
}

const getDueStatus = (card) => {
  const dueTimestamp = toTimestamp(card?.dueDate)
  if (!dueTimestamp) return null
  if (card?.status === CARD_STATUSES.DONE || card?.status === CARD_STATUSES.CANCELLED) return null

  const now = new Date(); now.setHours(0, 0, 0, 0)
  const due = new Date(dueTimestamp); due.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: `Overdue ${Math.abs(diffDays)}d`, isOverdue: true }
  if (diffDays <= 3) return { label: 'Due soon', isOverdue: false }
  return null
}

const getChecklistStats = (card) => {
  const checklists = Array.isArray(card?.checklists) ? card.checklists : []
  return checklists.reduce((result, checklist) => {
    const items = Array.isArray(checklist?.items) ? checklist.items : []
    result.total += items.length
    result.completed += items.filter(item => item?.isCompleted).length
    return result
  }, { completed: 0, total: 0 })
}

// ── Reusable Tag chip ──────────────────────────────────────────────
function Tag({ label, bg, color, border }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: '7px',
        py: '2px',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1.6,
        flexShrink: 0
      }}
    >
      {label}
    </Box>
  )
}

// ── Main Card component ────────────────────────────────────────────
function Card({ card, isDragDisabled = false }) {
  const dispatch = useDispatch()
  const priority = card?.priority
  const priorityStyle = PRIORITY_STYLES[priority]
  const statusStyle = STATUS_STYLES[card?.status]
  const dateRangeLabel = getDateRangeLabel(card?.startDate, card?.dueDate)
  const dueStatus = getDueStatus(card)
  const isCompleted = card?.status === CARD_STATUSES.DONE
  const checklistStats = getChecklistStats(card)
  const hasChecklist = checklistStats.total > 0
  const checklistPercent = hasChecklist
    ? Math.round((checklistStats.completed / checklistStats.total) * 100)
    : 0
  const isChecklistDone = hasChecklist && checklistStats.completed === checklistStats.total

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card },
    disabled: isDragDisabled
  })

  const dndKitCardStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    outline: isDragging ? '1px solid #6366f1' : undefined
  }

  const shouldShowCardActions = () =>
    !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length

  const setActiveCard = () => {
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  const confirmArchive = useConfirm()
  const handleArchiveClick = (e) => {
    e.stopPropagation()
    confirmArchive({
      title: 'Archive Card?',
      description: 'Thẻ này sẽ bị lưu trữ và ẩn khỏi bảng. Bạn có thể khôi phục lại bất kỳ lúc nào.',
      confirmationText: 'Archive',
      cancellationText: 'Cancel',
      confirmationButtonProps: { color: 'warning', variant: 'contained' }
    }).then(() => {
      updateCardDetailsAPI(card._id, { isArchived: true })
        .then(updatedCard => {
          toast.success('Card archived successfully!')
          dispatch(updateCardInBoard(updatedCard))
        })
        .catch(err => {
          if (err?.response?.status === 409) {
            toast.error('This card is already archived.')
            dispatch(fetchBoardDetailsAPI(card.boardId))
          } else {
            toast.error(err?.response?.data?.message || 'Could not archive card')
          }
        })
    }).catch(() => {})
  }

  return (
    <MuiCard
      id={card?._id ? `card-${card._id}` : undefined}
      onClick={setActiveCard}
      ref={setNodeRef}
      style={dndKitCardStyles}
      {...attributes}
      {...listeners}
      sx={{
        cursor: 'pointer',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        overflow: 'unset',
        position: 'relative',
        // ── Mode-aware card styling ─────────────────────────────────
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f2436' : '#ffffff',
        border: (theme) =>
          theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(0,0,0,0.09)',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 1px 4px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(99,102,241,0.45)'
              : 'rgba(99,102,241,0.35)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.25)'
              : '0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(99,102,241,0.2)',
          '& .archive-card-btn': {
            opacity: 1
          }
        }
      }}
    >
      {!card?.FE_PlaceholderCard && (
        <Tooltip title="Archive card">
          <IconButton
            size="small"
            className="archive-card-btn"
            onClick={handleArchiveClick}
            sx={{
              position: 'absolute',
              top: card?.cover ? 8 : 4,
              right: card?.cover ? 8 : 4,
              zIndex: 10,
              opacity: 0,
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)',
                color: 'text.primary'
              },
              transition: 'opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease'
            }}
          >
            <ArchiveIcon sx={{ fontSize: '15px' }} />
          </IconButton>
        </Tooltip>
      )}

      {/* Cover image */}
      {card?.cover && (
        <CardMedia
          sx={{
            height: 120,
            objectFit: 'cover',
            borderRadius: '11px 11px 0 0'
          }}
          image={card?.cover}
        />
      )}

      <CardContent sx={{ p: '11px 12px', '&:last-child': { pb: '11px' } }}>

        {/* Tags row: Priority + Status */}
        {(priorityStyle || statusStyle || dueStatus) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px', mb: 0.9 }}>
            {priorityStyle && (
              <Tag
                label={priorityStyle.label}
                bg={priorityStyle.bg}
                color={priorityStyle.color}
                border={priorityStyle.border}
              />
            )}
            {statusStyle && (
              <Tag
                label={statusStyle.label}
                bg={statusStyle.bg}
                color={statusStyle.color}
                border={statusStyle.border}
              />
            )}
            {dueStatus && (
              <Tag
                label={dueStatus.label}
                bg={dueStatus.isOverdue ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)'}
                color={dueStatus.isOverdue ? '#f87171' : '#fbbf24'}
                border={dueStatus.isOverdue ? 'rgba(239,68,68,0.22)' : 'rgba(245,158,11,0.22)'}
              />
            )}
          </Box>
        )}

        {/* Title */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            lineHeight: 1.45,
            color: isCompleted ? 'text.secondary' : 'text.primary',
            textDecoration: isCompleted ? 'line-through' : 'none',
            mb: dateRangeLabel ? 0.9 : 0
          }}
        >
          {card?.title}
        </Typography>

        {/* Date range */}
        {dateRangeLabel && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              mb: hasChecklist ? 1 : 0,
              color: dueStatus?.isOverdue ? 'error.light' : 'text.secondary',
              fontSize: '11px'
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {dateRangeLabel}
          </Box>
        )}

        {/* Checklist progress bar */}
        {hasChecklist && (
          <Box sx={{ mb: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '10px' }}
              >
                Checklist
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: isChecklistDone ? 'success.light' : 'text.secondary'
                }}
              >
                {checklistStats.completed}/{checklistStats.total}
              </Typography>
            </Box>
            <Tooltip title={`${checklistPercent}% completed`} placement="top">
              <LinearProgress
                variant="determinate"
                value={checklistPercent}
                color={isChecklistDone ? 'success' : 'primary'}
                sx={{ mb: 0 }}
              />
            </Tooltip>
          </Box>
        )}
      </CardContent>

      {/* Footer: members + comments + attachments */}
      {shouldShowCardActions() && (
        <CardActions sx={{ p: '0 10px 10px', gap: 0.5 }}>
          {!!card?.memberIds?.length && (
            <Button
              size="small"
              startIcon={<GroupIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'text.secondary',
                minWidth: 'auto',
                p: '2px 6px',
                borderRadius: '6px',
                '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.06)' }
              }}
            >
              {card?.memberIds?.length}
            </Button>
          )}
          {!!card?.comments?.length && (
            <Button
              size="small"
              startIcon={<CommentIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'text.secondary',
                minWidth: 'auto',
                p: '2px 6px',
                borderRadius: '6px',
                '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.06)' }
              }}
            >
              {card?.comments?.length}
            </Button>
          )}
          {!!card?.attachments?.length && (
            <Button
              size="small"
              startIcon={<AttachmentIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'text.secondary',
                minWidth: 'auto',
                p: '2px 6px',
                borderRadius: '6px',
                '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.06)' }
              }}
            >
              {card?.attachments?.length}
            </Button>
          )}
        </CardActions>
      )}
    </MuiCard>
  )
}

export default Card
