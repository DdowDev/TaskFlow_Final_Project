import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FilterListIcon from '@mui/icons-material/FilterList'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import InsightsIcon from '@mui/icons-material/Insights'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import ArchiveIcon from '@mui/icons-material/Archive'
import { Tooltip } from '@mui/material'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import BoardFilterPanel from './BoardFilterPanel'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  clearCurrentActiveBoard,
  updateCardInBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { removeBoardMemberAPI, updateBoardDetailsAPI, updateCardDetailsAPI } from '~/apis'
import { toast } from 'react-toastify'
import { useConfirm } from 'material-ui-confirm'
import { useNavigate } from 'react-router-dom'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

const VIEW_CHIP_STYLES = (isActive) => ({
  ...MENU_STYLES,
  bgcolor: isActive ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.24)',
  fontWeight: isActive ? 700 : 500
})
const getUserDisplayName = (user) => user?.displayName || user?.username || user?.email || 'Unknown user'
const getUserId = (user) => user?._id?.toString?.() || user?._id

const formatBoardDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function BoardUserList({ title, users = [], emptyText, canRemove = false, removingUserId = null, onRemoveUser }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
        {title}
      </Typography>

      {users.length === 0
        ? <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
        : <List dense sx={{ py: 0 }}>
          {users.map(user => {
            const userId = getUserId(user)
            const isRemoving = removingUserId === userId

            return (
              <ListItem
                key={userId || user?.email}
                disableGutters
                secondaryAction={canRemove &&
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<PersonRemoveIcon fontSize="small" />}
                    disabled={isRemoving}
                    onClick={() => onRemoveUser?.(user)}
                  >
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </Button>
                }
              >
                <ListItemAvatar sx={{ minWidth: 44 }}>
                  <Avatar src={user?.avatar} alt="User avatar" sx={{ width: 34, height: 34 }}>
                    {getUserDisplayName(user).charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={getUserDisplayName(user)}
                  secondary={user?.email || '-'}
                  primaryTypographyProps={{ fontWeight: 700 }}
                />
              </ListItem>
            )
          })}
        </List>
      }
    </Box>
  )
}

function BoardInfoDialog({
  open,
  board,
  isBoardOwner,
  currentUserRole,
  removingMemberId,
  onClose,
  onOpenEdit,
  onRemoveMember,
  onArchive
}) {
  const owners = Array.isArray(board?.owners) ? board.owners : []
  const members = Array.isArray(board?.members) ? board.members : []
  const primaryOwner = owners[0]

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 900 }}>
        Board information
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {board?.title || '-'}
              </Typography>
              <Chip size="small" label={currentUserRole} color={isBoardOwner ? 'primary' : 'default'} />
            </Stack>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {board?.description || 'No description.'}
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.25}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: 1 }}>
                <Typography color="text.secondary">Creator / primary owner</Typography>
                <Typography sx={{ fontWeight: 700 }}>{primaryOwner ? getUserDisplayName(primaryOwner) : '-'}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: 1 }}>
                <Typography color="text.secondary">Created at</Typography>
                <Typography>{formatBoardDate(board?.createdAt)}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: 1 }}>
                <Typography color="text.secondary">Updated at</Typography>
                <Typography>{formatBoardDate(board?.updatedAt)}</Typography>
              </Box>
            </Stack>
          </Paper>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <BoardUserList title={`Owners (${owners.length})`} users={owners} emptyText="No owners found." />
            </Box>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
            <Box sx={{ flex: 1 }}>
              <BoardUserList
                title={`Members (${members.length})`}
                users={members}
                emptyText="No members yet."
                canRemove={isBoardOwner}
                removingUserId={removingMemberId}
                onRemoveUser={onRemoveMember}
              />
            </Box>
          </Stack>

          {isBoardOwner &&
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <ManageAccountsIcon color="primary" fontSize="small" sx={{ mt: '2px' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Board actions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You are the board owner. You can update board information from here.
                  </Typography>
                  <Stack direction="row" spacing={1.25} sx={{ mt: 1.25 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={onOpenEdit}
                    >
                      Edit board
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={onArchive}
                    >
                      Archive board
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          }
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

function EditBoardDialog({ open, board, isSaving, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setFormData({
      title: board?.title || '',
      description: board?.description || ''
    })
    setErrors({})
  }, [board, open])

  const handleChangeField = (fieldName) => (event) => {
    setFormData(prevData => ({
      ...prevData,
      [fieldName]: event.target.value
    }))
    setErrors(prevErrors => ({
      ...prevErrors,
      [fieldName]: ''
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    const title = formData.title.trim()
    const description = formData.description.trim()

    if (!title) nextErrors.title = 'Title is required'
    if (!description) nextErrors.description = 'Description is required'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      title,
      description
    })
  }

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 900 }}>
          Edit board
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={handleChangeField('title')}
              error={Boolean(errors.title)}
              helperText={errors.title}
              fullWidth
              autoFocus
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChangeField('description')}
              error={Boolean(errors.description)}
              helperText={errors.description}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

function ArchivedCardsDialog({ open, archivedCards = [], isSaving, onClose, onRestoreCard }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ArchiveIcon color="primary" /> Archived Cards
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {archivedCards.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
            Không có thẻ lưu trữ nào.
          </Typography>
        ) : (
          <List sx={{ py: 0 }}>
            {archivedCards.map((card, index) => (
              <ListItem
                key={card._id}
                divider={index !== archivedCards.length - 1}
                secondaryAction={
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => onRestoreCard(card)}
                    disabled={isSaving}
                  >
                    Restore
                  </Button>
                }
                sx={{ px: 3, py: 1.5 }}
              >
                <ListItemText
                  primary={card.title}
                  secondary={card.updatedAt ? `Archived at: ${new Date(card.updatedAt).toLocaleString()}` : ''}
                  primaryTypographyProps={{ fontWeight: 700, variant: 'body1' }}
                  secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSaving} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function BoardBar({
  board,
  activeView = 'kanban',
  onChangeView = () => {},
  filters = { search: '', statuses: [], priorities: [], overdue: false, dueSoon: false, assignedToMe: false },
  onChangeFilters = () => {},
  onClearFilters = () => {},
  filterActiveCount = 0
}) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const confirmRemoveMember = useConfirm()
  const confirmArchiveBoard = useConfirm()
  const currentUser = useSelector(selectCurrentUser)
  const isBoardOwner = board?.owners?.some(owner => getUserId(owner) === getUserId(currentUser))
  const [filterAnchorEl, setFilterAnchorEl] = useState(null)
  const [isBoardInfoOpen, setIsBoardInfoOpen] = useState(false)
  const [isBoardEditOpen, setIsBoardEditOpen] = useState(false)
  const [isSavingBoard, setIsSavingBoard] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState(null)
  const isFilterPopoverOpen = Boolean(filterAnchorEl)
  const currentUserRole = isBoardOwner ? 'Board Owner' : 'Board Member'

  const [isArchivedCardsOpen, setIsArchivedCardsOpen] = useState(false)
  const [isRestoringCard, setIsRestoringCard] = useState(false)

  const handleRestoreCard = (card) => {
    setIsRestoringCard(true)
    updateCardDetailsAPI(card._id, { isArchived: false })
      .then(updatedCard => {
        toast.success('Card restored successfully!')
        dispatch(updateCardInBoard(updatedCard))
      })
      .catch(error => {
        toast.error(error?.response?.data?.message || 'Could not restore card')
      })
      .finally(() => {
        setIsRestoringCard(false)
      })
  }

  const openFilterPopover = (event) => setFilterAnchorEl(event.currentTarget)
  const closeFilterPopover = () => setFilterAnchorEl(null)

  const handleOpenEditBoard = () => {
    if (!isBoardOwner) return
    setIsBoardEditOpen(true)
  }

  const handleUpdateBoardMetadata = (payload) => {
    if (!board?._id) return

    setIsSavingBoard(true)
    updateBoardDetailsAPI(board._id, payload)
      .then(updatedBoard => {
        const nextBoard = {
          ...board,
          title: updatedBoard?.title || payload.title,
          description: updatedBoard?.description || payload.description,
          type: updatedBoard?.type || payload.type,
          updatedAt: updatedBoard?.updatedAt || Date.now()
        }

        dispatch(updateCurrentActiveBoard(nextBoard))
        setIsBoardEditOpen(false)
        toast.success('Board updated successfully')
      })
      .catch(error => {
        toast.error(error?.response?.data?.message || 'Could not update board')
      })
      .finally(() => {
        setIsSavingBoard(false)
      })
  }

  const handleRemoveBoardMember = (member) => {
    const memberId = getUserId(member)
    if (!isBoardOwner || !board?._id || !memberId) return

    confirmRemoveMember({
      title: 'Remove member?',
      description: 'Remove this member from board? This member will also be removed from assigned cards in this board.',
      confirmationText: 'Remove',
      cancellationText: 'Cancel',
      confirmationButtonProps: { variant: 'contained', color: 'error' }
    })
      .then(() => {
        setRemovingMemberId(memberId)
        removeBoardMemberAPI(board._id, memberId)
          .then(response => {
            toast.success(response?.removeResult || 'Member removed from board successfully!')
            dispatch(fetchBoardDetailsAPI(board._id))
          })
          .catch(error => {
            toast.error(error?.response?.data?.message || 'Could not remove member')
          })
          .finally(() => {
            setRemovingMemberId(null)
          })
      })
      .catch(() => {})
  }

  const handleArchiveBoard = () => {
    confirmArchiveBoard({
      title: 'Archive Board',
      description: 'Board sẽ bị lưu trữ và ẩn khỏi danh sách làm việc. Dữ liệu sẽ không bị xoá. Bao gồm: Columns, Cards, Members, Activity Logs, Invitations. Bạn có thể khôi phục bất kỳ lúc nào.',
      confirmationText: 'Archive',
      cancellationText: 'Cancel',
      confirmationButtonProps: { variant: 'contained', color: 'warning' }
    })
      .then(() => {
        setIsSavingBoard(true)
        updateBoardDetailsAPI(board._id, { isArchived: true })
          .then(() => {
            toast.success('Board archived successfully.')
            setIsBoardInfoOpen(false)
            dispatch(clearCurrentActiveBoard())
            navigate('/boards')
          })
          .catch(error => {
            toast.error(error?.response?.data?.message || 'Could not archive board')
          })
          .finally(() => {
            setIsSavingBoard(false)
          })
      })
      .catch(() => {})
  }

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2')
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={board?.description}>
          <Chip
            sx={MENU_STYLES}
            icon={<DashboardIcon />}
            label={board?.title}
            clickable
          />
        </Tooltip>
        <Chip
          sx={MENU_STYLES}
          icon={<InfoOutlinedIcon />}
          label="Board info"
          clickable
          onClick={() => setIsBoardInfoOpen(true)}
        />
        <Chip
          sx={MENU_STYLES}
          icon={<ArchiveIcon />}
          label="Archived cards"
          clickable
          onClick={() => setIsArchivedCardsOpen(true)}
        />
        <Badge
          color="warning"
          badgeContent={filterActiveCount}
          invisible={!filterActiveCount}
        >
          <Chip
            sx={{
              ...MENU_STYLES,
              bgcolor: filterActiveCount ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
              border: filterActiveCount ? '1px solid rgba(255, 255, 255, 0.24)' : 'none',
              fontWeight: filterActiveCount ? 700 : 500
            }}
            icon={<FilterListIcon />}
            label="Filters"
            clickable
            onClick={openFilterPopover}
          />
        </Badge>
        <Popover
          open={isFilterPopoverOpen}
          anchorEl={filterAnchorEl}
          onClose={closeFilterPopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <BoardFilterPanel
            filters={filters}
            onChangeFilters={onChangeFilters}
            onClearFilters={onClearFilters}
            filterActiveCount={filterActiveCount}
          />
        </Popover>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Chip
            sx={VIEW_CHIP_STYLES(activeView === 'kanban')}
            icon={<ViewKanbanIcon />}
            label="Kanban"
            clickable
            onClick={() => onChangeView('kanban')}
          />
          <Chip
            sx={VIEW_CHIP_STYLES(activeView === 'dashboard')}
            icon={<InsightsIcon />}
            label="Dashboard"
            clickable
            onClick={() => onChangeView('dashboard')}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Xử lý mời user vào làm thành viên của board */}
        {isBoardOwner && <InviteBoardUser boardId={board._id} />}

        {/* Xử lý hiển thị danh sách thành viên của board */}
        <BoardUserGroup boardUsers={board?.FE_allUsers} />
      </Box>

      <BoardInfoDialog
        open={isBoardInfoOpen}
        board={board}
        isBoardOwner={isBoardOwner}
        currentUserRole={currentUserRole}
        removingMemberId={removingMemberId}
        onClose={() => setIsBoardInfoOpen(false)}
        onOpenEdit={handleOpenEditBoard}
        onRemoveMember={handleRemoveBoardMember}
        onArchive={handleArchiveBoard}
      />

      <EditBoardDialog
        open={isBoardEditOpen}
        board={board}
        isSaving={isSavingBoard}
        onClose={() => setIsBoardEditOpen(false)}
        onSubmit={handleUpdateBoardMetadata}
      />

      <ArchivedCardsDialog
        open={isArchivedCardsOpen}
        archivedCards={board?.archivedCards || []}
        isSaving={isRestoringCard}
        onClose={() => setIsArchivedCardsOpen(false)}
        onRestoreCard={handleRestoreCard}
      />
    </Box>
  )
}

export default BoardBar
