import { useState } from 'react'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ListCards from './ListCards/ListCards'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { useConfirm } from 'material-ui-confirm'
import { createNewCardAPI, deleteColumnDetailsAPI, updateColumnDetailsAPI } from '~/apis'
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'

// ── Column accent colors (cycling by index) ────────────────────────
const COLUMN_ACCENTS = [
  { color: '#3b82f6', glow: 'rgba(59,130,246,0.6)',  bg: 'rgba(59,130,246,0.06)'  }, // blue
  { color: '#a855f7', glow: 'rgba(168,85,247,0.6)',  bg: 'rgba(168,85,247,0.06)'  }, // purple
  { color: '#f59e0b', glow: 'rgba(245,158,11,0.6)',  bg: 'rgba(245,158,11,0.06)'  }, // amber
  { color: '#10b981', glow: 'rgba(16,185,129,0.6)',  bg: 'rgba(16,185,129,0.06)'  }, // emerald
  { color: '#ec4899', glow: 'rgba(236,72,153,0.6)',  bg: 'rgba(236,72,153,0.06)'  }, // pink
  { color: '#06b6d4', glow: 'rgba(6,182,212,0.6)',   bg: 'rgba(6,182,212,0.06)'   }  // cyan
]

function Column({ column, columnIndex = 0, canManageColumns = false, isDragDisabled = false }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

  const accent = COLUMN_ACCENTS[columnIndex % COLUMN_ACCENTS.length]

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column },
    disabled: isDragDisabled
  })
  const dndKitColumnStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const orderedCards = column.cards

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)
  const [newCardTitle, setNewCardTitle] = useState('')

  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please enter Card Title!', { position: 'bottom-right' })
      return
    }
    const newCardData = { title: newCardTitle, columnId: column._id }
    const createdCard = await createNewCardAPI({ ...newCardData, boardId: board._id })

    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id]
      } else {
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }
    dispatch(updateCurrentActiveBoard(newBoard))
    toggleOpenNewCardForm()
    setNewCardTitle('')
  }

  const confirmDeleteColumn = useConfirm()
  const handleDeleteColumn = () => {
    confirmDeleteColumn({
      title: 'Delete Column?',
      description: 'This action will permanently delete your Column and its Cards! Are you sure?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      const newBoard = { ...board }
      newBoard.columns = newBoard.columns.filter(c => c._id !== column._id)
      newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
      dispatch(updateCurrentActiveBoard(newBoard))
      deleteColumnDetailsAPI(column._id).then(res => {
        toast.success(res?.deleteResult)
      })
    }).catch(() => {})
  }

  const onUpdateColumnTitle = (newTitle) => {
    updateColumnDetailsAPI(column._id, { title: newTitle }).then(() => {
      const newBoard = cloneDeep(board)
      const columnToUpdate = newBoard.columns.find(c => c._id === column._id)
      if (columnToUpdate) columnToUpdate.title = newTitle
      dispatch(updateCurrentActiveBoard(newBoard))
    })
  }

  const cardCount = orderedCards?.filter(c => !c.FE_PlaceholderCard).length || 0

  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
      <Box
        {...(canManageColumns && !isDragDisabled ? listeners : {})}
        sx={{
          minWidth: '272px',
          maxWidth: '272px',
          ml: 2,
          height: 'fit-content',
          maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(15, 17, 25, 0.58)'
              : '#ffffff',
          border: (theme) =>
            theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
          overflow: 'hidden', // needed for border-radius clipping; does NOT block ListCards internal scroll
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.35)'
              : '0 2px 12px rgba(0, 0, 0, 0.06)',
          transition: 'box-shadow 0.2s ease'
        }}
      >
        {/* ── Column Header ────────────────────────────────────────── */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnHeaderHeight,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            borderBottom: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(0,0,0,0.05)'
          }}
        >
          {/* Accent bar */}
          <Box
            sx={{
              width: '3px',
              height: '18px',
              borderRadius: '2px',
              flexShrink: 0,
              backgroundColor: accent.color,
              boxShadow: `0 0 8px ${accent.glow}`
            }}
          />

          {/* Column title */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ToggleFocusInput
              value={column?.title}
              onChangedValue={onUpdateColumnTitle}
              disabled={!canManageColumns}
              data-no-dnd="true"
            />
          </Box>

          {/* Card count badge */}
          <Box
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              px: '7px',
              py: '2px',
              borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.08)',
              color: 'text.secondary',
              flexShrink: 0
            }}
          >
            {cardCount}
          </Box>

          {/* More options */}
          <Tooltip title="More options">
            <ExpandMoreIcon
              sx={{
                color: 'text.secondary',
                cursor: 'pointer',
                fontSize: '20px',
                flexShrink: 0,
                borderRadius: '4px',
                transition: 'all 0.15s',
                '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.08)' }
              }}
              id="basic-column-dropdown"
              aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            />
          </Tooltip>

          <Menu
            id="basic-menu-column-dropdown"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            MenuListProps={{ 'aria-labelledby': 'basic-column-dropdown' }}
            PaperProps={{
              sx: {
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f2436' : '#fff'
              }
            }}
          >
            <MenuItem
              onClick={toggleOpenNewCardForm}
              sx={{ '&:hover': { color: 'success.light', '& .add-card-icon': { color: 'success.light' } } }}
            >
              <ListItemIcon><AddCardIcon className="add-card-icon" fontSize="small" /></ListItemIcon>
              <ListItemText>Add new card</ListItemText>
            </MenuItem>
            <MenuItem>
              <ListItemIcon><ContentCut fontSize="small" /></ListItemIcon>
              <ListItemText>Cut</ListItemText>
            </MenuItem>
            <MenuItem>
              <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
              <ListItemText>Copy</ListItemText>
            </MenuItem>
            <MenuItem>
              <ListItemIcon><ContentPaste fontSize="small" /></ListItemIcon>
              <ListItemText>Paste</ListItemText>
            </MenuItem>
            {canManageColumns && <Divider />}
            {canManageColumns && (
              <MenuItem
                onClick={handleDeleteColumn}
                sx={{ '&:hover': { color: 'warning.dark', '& .delete-forever-icon': { color: 'warning.dark' } } }}
              >
                <ListItemIcon><DeleteForeverIcon className="delete-forever-icon" fontSize="small" /></ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
            )}
            {canManageColumns && (
              <MenuItem>
                <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </Box>

        {/* ── Cards list ───────────────────────────────────────────── */}
        <ListCards cards={orderedCards} isDragDisabled={isDragDisabled} />

        {/* ── Column Footer ────────────────────────────────────────── */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnFooterHeight,
            px: 1.5,
            py: 1
          }}
        >
          {!openNewCardForm
            ? (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button
                  startIcon={<AddCardIcon />}
                  onClick={toggleOpenNewCardForm}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'text.secondary',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '8px',
                    border: '1.5px dashed rgba(255,255,255,0.1)',
                    py: 0.9,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: accent.color,
                      color: accent.color,
                      bgcolor: accent.bg
                    }
                  }}
                >
                  Add new card
                </Button>
                {canManageColumns && (
                  <Tooltip title="Drag to move">
                    <DragHandleIcon sx={{ cursor: 'pointer', color: 'text.secondary', ml: 1, flexShrink: 0 }} />
                  </Tooltip>
                )}
              </Box>
            )
            : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Enter card title..."
                  type="text"
                  size="small"
                  variant="outlined"
                  autoFocus
                  data-no-dnd="true"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  sx={{
                    flex: 1,
                    '& label': { color: 'text.secondary', fontSize: '0.8rem' },
                    '& input': { color: 'text.primary', fontSize: '0.8rem' },
                    '& label.Mui-focused': { color: 'primary.main' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: 'primary.main' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                    }
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Button
                    className="interceptor-loading"
                    onClick={addNewCard}
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ boxShadow: 'none', minWidth: 'auto', px: 1.5 }}
                  >
                    Add
                  </Button>
                  <CloseIcon
                    fontSize="small"
                    sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'warning.light' } }}
                    onClick={toggleOpenNewCardForm}
                  />
                </Box>
              </Box>
            )
          }
        </Box>
      </Box>
    </div>
  )
}

export default Column
