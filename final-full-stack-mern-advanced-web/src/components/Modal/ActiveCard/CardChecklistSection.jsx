import { memo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import { toast } from 'react-toastify'

function CardChecklistSection({
  checklists = [],
  isAddChecklistOpen = false,
  onAddChecklistOpenChange,
  onUpdateChecklist
}) {
  const safeChecklists = Array.isArray(checklists) ? checklists : []
  const [newChecklistTitle, setNewChecklistTitle] = useState('')
  const [newItemTitles, setNewItemTitles] = useState({})
  const [editingChecklist, setEditingChecklist] = useState({ checklistId: null, title: '' })
  const [editingItem, setEditingItem] = useState({ checklistId: null, itemId: null, title: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getChecklistStats = (checklist) => {
    const items = Array.isArray(checklist?.items) ? checklist.items : []
    const total = items.length
    const completed = items.filter(item => item?.isCompleted).length
    const percent = total ? Math.round((completed / total) * 100) : 0

    return { total, completed, percent }
  }

  const runChecklistAction = async (payload) => {
    setIsSubmitting(true)
    try {
      await onUpdateChecklist(payload)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openAddChecklistForm = () => onAddChecklistOpenChange?.(true)
  const closeAddChecklistForm = () => {
    setNewChecklistTitle('')
    onAddChecklistOpenChange?.(false)
  }

  const onAddChecklist = async (event) => {
    event.preventDefault()
    const title = newChecklistTitle.trim()
    if (!title) {
      toast.error('Checklist title is required!')
      return
    }

    await runChecklistAction({ checklistToAdd: { title } })
    closeAddChecklistForm()
  }

  const onRenameChecklist = async (event, checklistId) => {
    event.preventDefault()
    const title = editingChecklist.title.trim()
    if (!title) {
      toast.error('Checklist title is required!')
      return
    }

    await runChecklistAction({ checklistToRename: { checklistId, title } })
    setEditingChecklist({ checklistId: null, title: '' })
  }

  const onDeleteChecklist = async (checklistId) => {
    await runChecklistAction({ checklistToDelete: { checklistId } })
  }

  const onAddChecklistItem = async (event, checklistId) => {
    event.preventDefault()
    const title = (newItemTitles[checklistId] || '').trim()
    if (!title) {
      toast.error('Checklist item title is required!')
      return
    }

    await runChecklistAction({ checklistItemToAdd: { checklistId, title } })
    setNewItemTitles(prev => ({ ...prev, [checklistId]: '' }))
  }

  const onRenameChecklistItem = async (event) => {
    event.preventDefault()
    const title = editingItem.title.trim()
    if (!title) {
      toast.error('Checklist item title is required!')
      return
    }

    await runChecklistAction({
      checklistItemToRename: {
        checklistId: editingItem.checklistId,
        itemId: editingItem.itemId,
        title
      }
    })
    setEditingItem({ checklistId: null, itemId: null, title: '' })
  }

  const onToggleChecklistItem = async (checklistId, item) => {
    await runChecklistAction({
      checklistItemToToggle: {
        checklistId,
        itemId: item._id,
        isCompleted: !item.isCompleted
      }
    })
  }

  const onDeleteChecklistItem = async (checklistId, itemId) => {
    await runChecklistAction({ checklistItemToDelete: { checklistId, itemId } })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <TaskAltOutlinedIcon />
        <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Checklist</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={openAddChecklistForm}
          sx={{ ml: 'auto' }}
        >
          Add
        </Button>
      </Box>

      {isAddChecklistOpen &&
        <Box component="form" onSubmit={onAddChecklist} sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Checklist title"
            value={newChecklistTitle}
            onChange={(event) => setNewChecklistTitle(event.target.value)}
            inputProps={{ maxLength: 100 }}
          />
          <Button type="submit" size="small" variant="contained" disabled={isSubmitting}>Add</Button>
          <IconButton size="small" onClick={closeAddChecklistForm} disabled={isSubmitting}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      }

      {!safeChecklists.length &&
        <Box sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f'
        }}>
          <Typography variant="body2" color="text.secondary">
            No checklists yet.
          </Typography>
        </Box>
      }

      <Stack spacing={2}>
        {safeChecklists.map(checklist => {
          const items = Array.isArray(checklist?.items) ? checklist.items : []
          const stats = getChecklistStats(checklist)
          const progressColor = stats.total > 0 && stats.completed === stats.total ? 'success' : 'primary'
          const isEditingChecklist = editingChecklist.checklistId === checklist._id

          return (
            <Box
              key={checklist._id}
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`
              }}
            >
              {isEditingChecklist
                ? <Box component="form" onSubmit={(event) => onRenameChecklist(event, checklist._id)} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    value={editingChecklist.title}
                    onChange={(event) => setEditingChecklist(prev => ({ ...prev, title: event.target.value }))}
                    inputProps={{ maxLength: 100 }}
                  />
                  <IconButton type="submit" size="small" color="primary" disabled={isSubmitting}>
                    <SaveOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setEditingChecklist({ checklistId: null, title: '' })} disabled={isSubmitting}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                : <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, flex: 1 }}>{checklist.title}</Typography>
                  <Chip
                    size="small"
                    label={`${stats.completed}/${stats.total}`}
                    color={progressColor}
                    variant={progressColor === 'success' ? 'filled' : 'outlined'}
                    sx={{ height: 22, fontWeight: 700 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setEditingChecklist({ checklistId: checklist._id, title: checklist.title || '' })}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDeleteChecklist(checklist._id)} disabled={isSubmitting}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              }

              <Box sx={{ mb: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={stats.percent}
                  color={progressColor}
                  sx={{ height: 7, borderRadius: 999 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {stats.completed}/{stats.total} completed
                </Typography>
              </Box>

              {!items.length &&
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  No checklist items yet.
                </Typography>
              }

              <Stack spacing={0.5}>
                {items.map(item => {
                  const isEditingItem = editingItem.checklistId === checklist._id && editingItem.itemId === item._id

                  return (
                    <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={!!item.isCompleted}
                        onChange={() => onToggleChecklistItem(checklist._id, item)}
                        disabled={isSubmitting}
                        sx={{ p: 0.5 }}
                      />

                      {isEditingItem
                        ? <Box component="form" onSubmit={onRenameChecklistItem} sx={{ flex: 1, display: 'flex', gap: 0.5 }}>
                          <TextField
                            autoFocus
                            fullWidth
                            size="small"
                            value={editingItem.title}
                            onChange={(event) => setEditingItem(prev => ({ ...prev, title: event.target.value }))}
                            inputProps={{ maxLength: 200 }}
                          />
                          <IconButton type="submit" size="small" color="primary" disabled={isSubmitting}>
                            <SaveOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setEditingItem({ checklistId: null, itemId: null, title: '' })} disabled={isSubmitting}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        : <>
                          <Typography
                            variant="body2"
                            sx={{
                              flex: 1,
                              textDecoration: item.isCompleted ? 'line-through' : 'none',
                              color: item.isCompleted ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {item.title}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setEditingItem({ checklistId: checklist._id, itemId: item._id, title: item.title || '' })}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDeleteChecklistItem(checklist._id, item._id)}
                            disabled={isSubmitting}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      }
                    </Box>
                  )
                })}
              </Stack>

              <Box component="form" onSubmit={(event) => onAddChecklistItem(event, checklist._id)} sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add an item"
                  value={newItemTitles[checklist._id] || ''}
                  onChange={(event) => setNewItemTitles(prev => ({ ...prev, [checklist._id]: event.target.value }))}
                  inputProps={{ maxLength: 200 }}
                />
                <Button type="submit" size="small" variant="contained" disabled={isSubmitting}>Add</Button>
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

const MemoizedCardChecklistSection = memo(CardChecklistSection)

export default MemoizedCardChecklistSection
