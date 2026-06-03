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
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import InsightsIcon from '@mui/icons-material/Insights'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { Tooltip } from '@mui/material'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import BoardFilterPanel from './BoardFilterPanel'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { updateBoardDetailsAPI } from '~/apis'
import { toast } from 'react-toastify'

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

const COMING_SOON_CHIP_STYLES = {
  ...MENU_STYLES,
  opacity: 0.72,
  '&.Mui-disabled': {
    color: 'rgba(255,255,255,0.72)'
  },
  '&.Mui-disabled .MuiChip-icon': {
    color: 'rgba(255,255,255,0.72)'
  }
}

const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

const getUserDisplayName = (user) => user?.displayName || user?.username || user?.email || 'Unknown user'

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

function BoardUserList({ title, users = [], emptyText }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
        {title}
      </Typography>

      {users.length === 0
        ? <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
        : <List dense sx={{ py: 0 }}>
          {users.map(user => (
            <ListItem key={user?._id || user?.email} disableGutters>
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
          ))}
        </List>
      }
    </Box>
  )
}

function BoardInfoDialog({ open, board, isBoardOwner, currentUserRole, onClose, onOpenEdit }) {
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
              <Chip size="small" label={capitalizeFirstLetter(board?.type || '-')} />
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
              <BoardUserList title={`Members (${members.length})`} users={members} emptyText="No members yet." />
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
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ mt: 1.25 }}
                    onClick={onOpenEdit}
                  >
                    Edit board
                  </Button>
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
    description: '',
    type: BOARD_TYPES.PUBLIC
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setFormData({
      title: board?.title || '',
      description: board?.description || '',
      type: board?.type || BOARD_TYPES.PUBLIC
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
      description,
      type: formData.type
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

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75 }}>
                Type
              </Typography>
              <RadioGroup
                row
                value={formData.type}
                onChange={handleChangeField('type')}
              >
                <FormControlLabel value={BOARD_TYPES.PUBLIC} control={<Radio size="small" />} label="Public" />
                <FormControlLabel value={BOARD_TYPES.PRIVATE} control={<Radio size="small" />} label="Private" />
              </RadioGroup>
            </Box>
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

function ComingSoonChip({ icon, label }) {
  return (
    <Tooltip title="Coming soon">
      <Box component="span">
        <Chip
          sx={COMING_SOON_CHIP_STYLES}
          icon={icon}
          label={label}
          disabled
        />
      </Box>
    </Tooltip>
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
  const currentUser = useSelector(selectCurrentUser)
  const isBoardOwner = board?.owners?.some(owner => owner._id === currentUser?._id)
  const [filterAnchorEl, setFilterAnchorEl] = useState(null)
  const [isBoardInfoOpen, setIsBoardInfoOpen] = useState(false)
  const [isBoardEditOpen, setIsBoardEditOpen] = useState(false)
  const [isSavingBoard, setIsSavingBoard] = useState(false)
  const isFilterPopoverOpen = Boolean(filterAnchorEl)
  const currentUserRole = isBoardOwner ? 'Board Owner' : 'Board Member'

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
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />
        <ComingSoonChip icon={<AddToDriveIcon />} label="Add To Google Drive" />
        <ComingSoonChip icon={<BoltIcon />} label="Automation" />
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
        onClose={() => setIsBoardInfoOpen(false)}
        onOpenEdit={handleOpenEditBoard}
      />

      <EditBoardDialog
        open={isBoardEditOpen}
        board={board}
        isSaving={isSavingBoard}
        onClose={() => setIsBoardEditOpen(false)}
        onSubmit={handleUpdateBoardMetadata}
      />
    </Box>
  )
}

export default BoardBar
