import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import Popover from '@mui/material/Popover'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CancelIcon from '@mui/icons-material/Cancel'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ArchiveIcon from '@mui/icons-material/Archive'
import { useConfirm } from 'material-ui-confirm'

import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { singleFileValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import CardUserGroup from './CardUserGroup'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'
import CardChecklistSection from './CardChecklistSection'
import AiChecklistSuggestionDialog from './AiChecklistSuggestionDialog'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard
} from '~/redux/activeCard/activeCardSlice'
import { updateCardDetailsAPI } from '~/apis'
import { updateCardInBoard } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { CARD_MEMBER_ACTIONS, CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { styled } from '@mui/material/styles'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  padding: '10px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    '&.active': {
      color: theme.palette.mode === 'dark' ? '#000000de' : '#0c66e4',
      backgroundColor: theme.palette.mode === 'dark' ? '#90caf9' : '#e9f2ff'
    }
  }
}))

const statusOptions = [
  { value: CARD_STATUSES.TODO, label: 'Todo', color: 'default' },
  { value: CARD_STATUSES.IN_PROGRESS, label: 'In Progress', color: 'primary' },
  { value: CARD_STATUSES.IN_REVIEW, label: 'In Review', color: 'warning' },
  { value: CARD_STATUSES.DONE, label: 'Done', color: 'success' },
  { value: CARD_STATUSES.CANCELLED, label: 'Cancelled', color: 'error' }
]

const priorityOptions = [
  { value: CARD_PRIORITIES.LOW, label: 'Low', color: 'default' },
  { value: CARD_PRIORITIES.MEDIUM, label: 'Medium', color: 'primary' },
  { value: CARD_PRIORITIES.HIGH, label: 'High', color: 'warning' },
  { value: CARD_PRIORITIES.URGENT, label: 'Urgent', color: 'error' }
]

const getStatusConfig = (status) => {
  return statusOptions.find(option => option.value === status) || statusOptions[0]
}

const getPriorityConfig = (priority) => {
  return priorityOptions.find(option => option.value === priority) || priorityOptions[1]
}

const formatDateTime = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toDateInputValue = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatShortDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit'
  })
}

const getDateRangeLabel = (startDate, dueDate) => {
  const startLabel = formatShortDate(startDate)
  const dueLabel = formatShortDate(dueDate)

  if (startLabel && dueLabel) return `${startLabel} - ${dueLabel}`
  if (dueLabel) return `Due ${dueLabel}`
  return startLabel || null
}

const isInvalidDateRange = (startDate, dueDate) => {
  if (!startDate || !dueDate) return false
  return new Date(startDate).getTime() > new Date(dueDate).getTime()
}

const isUserCardMember = (card, userId) => {
  if (!userId) return false

  const memberIds = Array.isArray(card?.memberIds) ? card.memberIds : []
  const members = Array.isArray(card?.members) ? card.members : []

  return memberIds.some(memberId => memberId === userId || memberId?._id === userId) ||
    members.some(member => member === userId || member?._id === userId)
}

function ActiveCard() {
  const dispatch = useDispatch()
  const activeCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentUser = useSelector(selectCurrentUser)
  const checklistSectionRef = useRef(null)
  const [activePopover, setActivePopover] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [dateDraft, setDateDraft] = useState({ startDate: '', dueDate: '' })
  const [isChecklistFormOpen, setIsChecklistFormOpen] = useState(false)
  const [isAiChecklistDialogOpen, setIsAiChecklistDialogOpen] = useState(false)

  const currentStatus = activeCard?.status || CARD_STATUSES.TODO
  const currentPriority = activeCard?.priority || CARD_PRIORITIES.MEDIUM
  const statusConfig = getStatusConfig(currentStatus)
  const priorityConfig = getPriorityConfig(currentPriority)
  const dateRangeLabel = getDateRangeLabel(activeCard?.startDate, activeCard?.dueDate)
  const lastActivityLabel = formatDateTime(activeCard?.lastActivityAt)
  const isCompleted = currentStatus === CARD_STATUSES.DONE
  const isCurrentUserJoined = isUserCardMember(activeCard, currentUser?._id)
  const checklists = Array.isArray(activeCard?.checklists) ? activeCard.checklists : []

  const handleCloseModal = () => {
    setIsAiChecklistDialogOpen(false)
    dispatch(clearAndHideCurrentActiveCard())
  }

  const confirmArchiveCard = useConfirm()
  const handleArchiveCard = () => {
    confirmArchiveCard({
      title: 'Archive Card?',
      description: 'Thẻ này sẽ bị lưu trữ và ẩn khỏi bảng. Bạn có thể khôi phục lại bất kỳ lúc nào.',
      confirmationText: 'Archive',
      cancellationText: 'Cancel',
      confirmationButtonProps: { color: 'warning', variant: 'contained' }
    }).then(() => {
      toast.promise(
        callApiUpdateCard({ isArchived: true }).then(() => {
          handleCloseModal()
        }),
        {
          pending: 'Archiving card...',
          success: 'Card archived successfully!',
          error: 'Could not archive card'
        }
      )
    }).catch(() => {})
  }

  const callApiUpdateCard = async (updateData) => {
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData)

    dispatch(updateCurrentActiveCard(updatedCard))
    dispatch(updateCardInBoard(updatedCard))

    return updatedCard
  }

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle.trim() })
  }

  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription })
  }

  const onUploadCardCover = (event) => {
    const error = singleFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('cardCover', event.target?.files[0])

    toast.promise(
      callApiUpdateCard(reqData).finally(() => event.target.value = ''),
      { pending: 'Updating...' }
    )
  }

  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd })
  }

  const onUpdateCardMembers = (incomingMemberInfo) => {
    callApiUpdateCard({ incomingMemberInfo })
  }

  const onToggleCurrentUserMember = () => {
    if (!currentUser?._id) return

    onUpdateCardMembers({
      userId: currentUser._id,
      action: isCurrentUserJoined ? CARD_MEMBER_ACTIONS.REMOVE : CARD_MEMBER_ACTIONS.ADD
    })
  }

  const handleOpenPopover = (popoverName, event) => {
    setActivePopover(popoverName)
    setAnchorEl(event.currentTarget)

    if (popoverName === 'dates') {
      setDateDraft({
        startDate: toDateInputValue(activeCard?.startDate),
        dueDate: toDateInputValue(activeCard?.dueDate)
      })
    }
  }

  const handleClosePopover = () => {
    setActivePopover(null)
    setAnchorEl(null)
  }

  const onUpdateStatus = (status) => {
    callApiUpdateCard({ status })
    handleClosePopover()
  }

  const onUpdatePriority = (priority) => {
    callApiUpdateCard({ priority })
    handleClosePopover()
  }

  const onSaveDates = () => {
    if (isInvalidDateRange(dateDraft.startDate, dateDraft.dueDate)) {
      toast.error('Start date must be before or equal to due date!')
      return
    }

    callApiUpdateCard({
      startDate: dateDraft.startDate || null,
      dueDate: dateDraft.dueDate || null
    })
    handleClosePopover()
  }

  const onClearDates = () => {
    callApiUpdateCard({ startDate: null, dueDate: null })
    handleClosePopover()
  }

  const onToggleComplete = () => {
    callApiUpdateCard({ status: isCompleted ? CARD_STATUSES.TODO : CARD_STATUSES.DONE })
  }

  const onOpenChecklistSection = () => {
    if (!checklists.length) setIsChecklistFormOpen(true)

    setTimeout(() => {
      checklistSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const renderOptionChip = (option) => (
    <Chip
      size="small"
      label={option.label}
      color={option.color}
      variant={option.color === 'default' ? 'outlined' : 'filled'}
      sx={{ fontWeight: 700 }}
    />
  )


  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal}
      sx={{ overflowY: 'auto' }}>
      <Box sx={{
        position: 'relative',
        width: 900,
        maxWidth: 'calc(100vw - 32px)',
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '8px',
        border: 'none',
        outline: 0,
        padding: '40px 20px 20px',
        margin: '50px auto',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#fff'
      }}>
        <Box sx={{
          position: 'absolute',
          top: '12px',
          right: '10px',
          cursor: 'pointer'
        }}>
          <CancelIcon color="error" sx={{ '&:hover': { color: 'error.light' } }} onClick={handleCloseModal} />
        </Box>

        {activeCard?.cover &&
          <Box sx={{ mb: 4 }}>
            <img
              style={{ width: '100%', height: '320px', borderRadius: '6px', objectFit: 'cover' }}
              src={activeCard?.cover}
              alt="card-cover"
            />
          </Box>
        }

        <Box sx={{ mb: 1, mt: -3, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon />
          <IconButton
            size="small"
            color={isCompleted ? 'success' : 'default'}
            onClick={onToggleComplete}
            sx={{ ml: -0.5 }}
          >
            {isCompleted ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
          </IconButton>

          <Box sx={{ flex: 1, opacity: isCompleted ? 0.72 : 1 }}>
            <ToggleFocusInput
              inputFontSize='22px'
              value={activeCard?.title}
              onChangedValue={onUpdateCardTitle} />
          </Box>
          {isCompleted &&
            <Chip label="Completed" color="success" size="small" sx={{ fontWeight: 700 }} />
          }
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12} sm={9}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SubjectRoundedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Description</Typography>
              </Box>

              <CardDescriptionMdEditor
                cardDescriptionProp={activeCard?.description}
                handleUpdateCardDescription={onUpdateCardDescription}
              />
            </Box>

            <Box ref={checklistSectionRef} sx={{ mb: 3, scrollMarginTop: '24px' }}>
              <CardChecklistSection
                checklists={checklists}
                isAddChecklistOpen={isChecklistFormOpen}
                onAddChecklistOpenChange={setIsChecklistFormOpen}
                onUpdateChecklist={callApiUpdateCard}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DvrOutlinedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Activity</Typography>
              </Box>

              <CardActivitySection
                cardId={activeCard?._id}
                cardComments={activeCard?.comments}
                onAddCardComment={onAddCardComment}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={3}>
            <Box sx={{ maxHeight: 'calc(100vh - 190px)', overflowY: 'auto', pr: 0.5 }}>
              <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Members</Typography>
              <CardUserGroup
                cardMemberIds={activeCard?.memberIds}
                onUpdateCardMembers={onUpdateCardMembers}
              />

              <SidebarItem
                role="button"
                className={isCurrentUserJoined ? undefined : 'active'}
                onClick={onToggleCurrentUserMember}
                sx={isCurrentUserJoined
                  ? { mt: 1, color: 'error.light', '&:hover': { color: 'error.light' } }
                  : { mt: 1 }
                }
              >
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isCurrentUserJoined
                      ? <ExitToAppIcon fontSize="small" />
                      : <PersonOutlineOutlinedIcon fontSize="small" />
                    }
                    <span>{isCurrentUserJoined ? 'Leave' : 'Join'}</span>
                  </Box>
                  {!isCurrentUserJoined &&
                    <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                  }
                </Box>
              </SidebarItem>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Add to card</Typography>
              <Stack direction="column" spacing={1}>
                <SidebarItem onClick={(event) => handleOpenPopover('status', event)}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TaskAltOutlinedIcon fontSize="small" />
                      <span>Status</span>
                    </Box>
                    {renderOptionChip(statusConfig)}
                  </Box>
                </SidebarItem>

                <SidebarItem onClick={(event) => handleOpenPopover('priority', event)}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <LocalOfferOutlinedIcon fontSize="small" />
                      <span>Priority</span>
                    </Box>
                    {renderOptionChip(priorityConfig)}
                  </Box>
                </SidebarItem>

                <SidebarItem onClick={(event) => handleOpenPopover('dates', event)}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <WatchLaterOutlinedIcon fontSize="small" />
                      <span>Dates</span>
                    </Box>
                    <Chip
                      size="small"
                      label={dateRangeLabel || 'Set dates'}
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                    />
                  </Box>
                </SidebarItem>

                <SidebarItem className="active" component="label">
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ImageOutlinedIcon fontSize="small" />
                      <span>Cover</span>
                    </Box>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                  </Box>
                  <VisuallyHiddenInput type="file" onChange={onUploadCardCover} />
                </SidebarItem>

                <SidebarItem onClick={onOpenChecklistSection}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TaskAltOutlinedIcon fontSize="small" />
                      <span>Checklist</span>
                    </Box>
                    <Chip
                      size="small"
                      label={checklists.length ? `${checklists.length}` : 'Add'}
                      color={checklists.length ? 'primary' : 'default'}
                      variant={checklists.length ? 'filled' : 'outlined'}
                      sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                    />
                  </Box>
                </SidebarItem>

                <SidebarItem onClick={() => setIsAiChecklistDialogOpen(true)}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AutoAwesomeIcon fontSize="small" />
                      <span>AI Checklist</span>
                    </Box>
                    <Chip
                      size="small"
                      label="Suggest"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                    />
                  </Box>
                </SidebarItem>

                <SidebarItem onClick={handleArchiveCard} sx={{ color: 'warning.light' }}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArchiveIcon fontSize="small" />
                    <span>Archive card</span>
                  </Box>
                </SidebarItem>

              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Metadata</Typography>
              <Box sx={{
                p: 1,
                borderRadius: '4px',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f'
              }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Last activity</Typography>
                <Typography variant="body2" color="text.secondary">
                  {lastActivityLabel || 'No activity yet'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Menu
          anchorEl={anchorEl}
          open={activePopover === 'status'}
          onClose={handleClosePopover}
        >
          {statusOptions.map(option => (
            <MenuItem
              key={option.value}
              selected={option.value === currentStatus}
              onClick={() => onUpdateStatus(option.value)}
            >
              {renderOptionChip(option)}
            </MenuItem>
          ))}
        </Menu>

        <Menu
          anchorEl={anchorEl}
          open={activePopover === 'priority'}
          onClose={handleClosePopover}
        >
          {priorityOptions.map(option => (
            <MenuItem
              key={option.value}
              selected={option.value === currentPriority}
              onClick={() => onUpdatePriority(option.value)}
            >
              {renderOptionChip(option)}
            </MenuItem>
          ))}
        </Menu>

        <Popover
          anchorEl={anchorEl}
          open={activePopover === 'dates'}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <Stack spacing={2} sx={{ p: 2, width: 280 }}>
            <Typography sx={{ fontWeight: 700 }}>Dates</Typography>
            <TextField
              label="Start date"
              type="date"
              size="small"
              value={dateDraft.startDate}
              onChange={(event) => setDateDraft(prev => ({ ...prev, startDate: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Due date"
              type="date"
              size="small"
              value={dateDraft.dueDate}
              onChange={(event) => setDateDraft(prev => ({ ...prev, dueDate: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button size="small" color="inherit" onClick={onClearDates}>Clear</Button>
              <Button size="small" variant="contained" onClick={onSaveDates}>Save</Button>
            </Stack>
          </Stack>
        </Popover>

        <AiChecklistSuggestionDialog
          open={isAiChecklistDialogOpen}
          card={activeCard}
          checklists={checklists}
          onClose={() => setIsAiChecklistDialogOpen(false)}
          onUpdateCard={callApiUpdateCard}
        />
      </Box>
    </Modal>
  )
}

export default ActiveCard
