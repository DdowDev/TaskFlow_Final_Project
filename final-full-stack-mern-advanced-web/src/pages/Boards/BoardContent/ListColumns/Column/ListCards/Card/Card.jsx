import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch } from 'react-redux'
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'
import { CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'

const priorityChipConfig = {
  [CARD_PRIORITIES.LOW]: { label: 'Low', color: 'default' },
  [CARD_PRIORITIES.MEDIUM]: { label: 'Medium', color: 'primary' },
  [CARD_PRIORITIES.HIGH]: { label: 'High', color: 'warning' },
  [CARD_PRIORITIES.URGENT]: { label: 'Urgent', color: 'error' }
}

const statusChipConfig = {
  [CARD_STATUSES.DONE]: { label: 'Completed', color: 'success' },
  [CARD_STATUSES.CANCELLED]: { label: 'Cancelled', color: 'error' }
}

const toTimestamp = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

const formatShortDate = (value) => {
  const timestamp = toTimestamp(value)
  if (!timestamp) return null

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit'
  })
}

const getDateRangeLabel = (startDate, dueDate) => {
  const startLabel = formatShortDate(startDate)
  const dueLabel = formatShortDate(dueDate)

  if (startLabel && dueLabel) return `${startLabel} - ${dueLabel}`
  return startLabel || dueLabel || null
}

const getDueChipConfig = (card) => {
  const dueTimestamp = toTimestamp(card?.dueDate)
  if (!dueTimestamp || card?.status === CARD_STATUSES.DONE || card?.status === CARD_STATUSES.CANCELLED) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dueDate = new Date(dueTimestamp)
  dueDate.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Overdue', color: 'error' }
  if (diffDays <= 3) return { label: 'Due soon', color: 'warning' }
  return { label: 'Due date', color: 'default' }
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

function Card({ card, isDragDisabled = false }) {
  const dispatch = useDispatch()
  const priority = card?.priority
  const priorityConfig = priorityChipConfig[priority]
  const currentStatusConfig = statusChipConfig[card?.status]
  const dateRangeLabel = getDateRangeLabel(card?.startDate, card?.dueDate)
  const dueChipConfig = getDueChipConfig(card)
  const isCompleted = card?.status === CARD_STATUSES.DONE
  const checklistStats = getChecklistStats(card)
  const isChecklistCompleted = checklistStats.total > 0 && checklistStats.completed === checklistStats.total

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card },
    disabled: isDragDisabled
  })
  const dndKitCardStyles = {
    // touchAction: 'none', // Dành cho sensor default dạng PointerSensor
    // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch
    // https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #2ecc71' : undefined
  }

  const shouldShowCardActions = () => {
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length
  }

  const setActiveCard = () => {
    // Cập nhật data cho cái activeCard trong Redux
    dispatch(updateCurrentActiveCard(card))
    // Hiện Modal ActiveCard lên
    dispatch(showModalActiveCard())
  }

  return (
    <MuiCard
      id={card?._id ? `card-${card._id}` : undefined}
      onClick={setActiveCard}
      ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
      sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
        overflow: 'unset',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        border: '1px solid transparent',
        '&:hover': { borderColor: (theme) => theme.palette.primary.main }
        // overflow: card?.FE_PlaceholderCard ? 'hidden' : 'unset',
        // height: card?.FE_PlaceholderCard ? '0px' : 'unset'
      }}
    >
      {card?.cover && <CardMedia sx={{ height: 140 }} image={card?.cover} /> }
      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        <Typography
          sx={{
            opacity: isCompleted ? 0.66 : 1,
            textDecoration: isCompleted ? 'line-through' : 'none'
          }}
        >
          {card?.title}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.75 }}>
          {priorityConfig &&
            <Chip
              size="small"
              label={priorityConfig.label}
              color={priorityConfig.color}
              variant={priorityConfig.color === 'default' ? 'outlined' : 'filled'}
              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
            />
          }
          {dateRangeLabel &&
            <Chip
              size="small"
              label={dateRangeLabel}
              variant="outlined"
              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
            />
          }
          {currentStatusConfig &&
            <Chip
              size="small"
              label={currentStatusConfig.label}
              color={currentStatusConfig.color}
              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
            />
          }
          {dueChipConfig &&
            <Chip
              size="small"
              label={dueChipConfig.label}
              color={dueChipConfig.color}
              variant={dueChipConfig.color === 'default' ? 'outlined' : 'filled'}
              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
            />
          }
          {checklistStats.total > 0 &&
            <Chip
              size="small"
              icon={<TaskAltOutlinedIcon />}
              label={`${checklistStats.completed}/${checklistStats.total}`}
              color={isChecklistCompleted ? 'success' : 'default'}
              variant={isChecklistCompleted ? 'filled' : 'outlined'}
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                '& .MuiChip-icon': { fontSize: 14 }
              }}
            />
          }
        </Stack>
      </CardContent>
      {shouldShowCardActions() &&
        <CardActions sx={{ p: '0 4px 8px 4px' }}>
          {!!card?.memberIds?.length &&
            <Button size="small" startIcon={<GroupIcon />}>{card?.memberIds?.length}</Button>
          }
          {!!card?.comments?.length &&
            <Button size="small" startIcon={<CommentIcon />}>{card?.comments?.length}</Button>
          }
          {!!card?.attachments?.length &&
            <Button size="small" startIcon={<AttachmentIcon />}>{card?.attachments?.length}</Button>
          }
        </CardActions>
      }
    </MuiCard>
  )
}

export default Card
