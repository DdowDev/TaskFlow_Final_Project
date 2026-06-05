import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { toast } from 'react-toastify'
import { suggestCardChecklistWithAIAPI } from '~/apis'
import { CARD_STATUSES } from '~/utils/constants'

const MAX_VISIBLE_ITEMS = 12
const MAX_CHECKLISTS_PER_CARD = 5
const FALLBACK_CHECKLIST_TITLE = 'Checklist gợi ý bởi AI'

const getModeLabel = (mode) => {
  if (mode === 'mock') return 'Mock'
  if (mode === 'fallback') return 'Fallback'
  if (mode === 'real') return 'AI'
  return 'AI'
}

const formatGeneratedAt = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatConfidence = (value) => {
  if (typeof value === 'number') {
    const percent = value <= 1 ? value * 100 : value
    return `${Math.round(percent)}%`
  }

  return value || null
}

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage
}

const normalizeSuggestionItems = (suggestion) => {
  const items = Array.isArray(suggestion?.items) ? suggestion.items : []

  return items
    .map(item => ({
      title: String(item?.title || '').trim(),
      reason: String(item?.reason || '').trim()
    }))
    .filter(item => item.title)
    .slice(0, MAX_VISIBLE_ITEMS)
}

function AiChecklistSuggestionDialog({
  open,
  card,
  checklists = [],
  onClose,
  onUpdateCard
}) {
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedItemIndexes, setSelectedItemIndexes] = useState([])
  const [applying, setApplying] = useState(false)
  const [applyProgress, setApplyProgress] = useState({ current: 0, total: 0 })

  const visibleItems = useMemo(() => normalizeSuggestionItems(suggestion), [suggestion])
  const selectedItemIndexSet = useMemo(() => new Set(selectedItemIndexes), [selectedItemIndexes])
  const selectedItems = visibleItems.filter((_, index) => selectedItemIndexSet.has(index))
  const generatedAtLabel = formatGeneratedAt(suggestion?.generatedAt)
  const confidenceLabel = formatConfidence(suggestion?.confidence)
  const checklistTitle = String(suggestion?.checklistTitle || '').trim() || FALLBACK_CHECKLIST_TITLE
  const notesText = Array.isArray(suggestion?.notes)
    ? suggestion.notes.filter(Boolean).join(' ')
    : String(suggestion?.notes || '').trim()
  const isMaxChecklistReached = checklists.length >= MAX_CHECKLISTS_PER_CARD
  const isReferenceOnlyCard = [CARD_STATUSES.DONE, CARD_STATUSES.CANCELLED].includes(card?.status)
  const canApply = !loading && !applying && selectedItems.length > 0 && !isMaxChecklistReached

  useEffect(() => {
    if (!open || !card?._id) return

    let isCancelled = false

    const fetchSuggestion = async () => {
      setSuggestion(null)
      setError(null)
      setSelectedItemIndexes([])
      setApplyProgress({ current: 0, total: 0 })
      setLoading(true)

      try {
        const result = await suggestCardChecklistWithAIAPI(card._id)
        if (isCancelled) return

        const validItems = normalizeSuggestionItems(result)
        setSuggestion(result)
        setSelectedItemIndexes(validItems.map((_, index) => index))
      } catch (err) {
        if (!isCancelled) {
          setError(getErrorMessage(err, 'Không thể tạo gợi ý checklist.'))
        }
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    fetchSuggestion()

    return () => {
      isCancelled = true
    }
  }, [open, card?._id])

  const handleClose = () => {
    if (applying) return
    onClose?.()
  }

  const handleToggleItem = (index) => {
    if (applying) return

    setSelectedItemIndexes(prev => {
      if (prev.includes(index)) return prev.filter(itemIndex => itemIndex !== index)
      return [...prev, index]
    })
  }

  const handleSelectAll = () => {
    if (applying) return
    setSelectedItemIndexes(visibleItems.map((_, index) => index))
  }

  const handleClearSelection = () => {
    if (applying) return
    setSelectedItemIndexes([])
  }

  const handleApplyChecklist = async () => {
    if (!canApply) return

    const oldChecklistIds = new Set(
      (Array.isArray(card?.checklists) ? card.checklists : [])
        .map(checklist => checklist?._id)
        .filter(Boolean)
    )

    setApplying(true)
    setError(null)
    setApplyProgress({ current: 0, total: selectedItems.length })

    let checklistWasCreated = false

    try {
      const updatedAfterChecklist = await onUpdateCard({
        checklistToAdd: { title: checklistTitle }
      })
      checklistWasCreated = true

      const updatedChecklists = Array.isArray(updatedAfterChecklist?.checklists)
        ? updatedAfterChecklist.checklists
        : []
      const newChecklist = updatedChecklists.find(checklist => checklist?._id && !oldChecklistIds.has(checklist._id))

      if (!newChecklist?._id) {
        throw new Error('Không xác định được checklist mới.')
      }

      for (let index = 0; index < selectedItems.length; index += 1) {
        const item = selectedItems[index]
        setApplyProgress({ current: index + 1, total: selectedItems.length })

        await onUpdateCard({
          checklistItemToAdd: {
            checklistId: newChecklist._id,
            title: item.title
          }
        })
      }

      toast.success('Checklist AI đã được áp dụng.')
      onClose?.()
    } catch (err) {
      const fallbackMessage = checklistWasCreated
        ? 'Checklist đã được tạo nhưng một số mục chưa được thêm. Vui lòng thử lại hoặc thêm thủ công.'
        : 'Không thể áp dụng checklist AI.'
      const message = getErrorMessage(err, fallbackMessage)
      setError(message)
      toast.error(message)
    } finally {
      setApplying(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.contrastText',
            bgcolor: 'primary.main'
          }}>
            <AutoAwesomeIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>AI gợi ý checklist</Typography>
            <Typography variant="body2" color="text.secondary">
              Dựa trên nội dung card, AI đề xuất các bước cần thực hiện.
            </Typography>
          </Box>
          {suggestion?.mode &&
            <Chip size="small" label={getModeLabel(suggestion.mode)} variant="outlined" />
          }
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {isReferenceOnlyCard &&
            <Alert severity="warning">
              Card này đã hoàn thành/hủy. Checklist gợi ý chỉ mang tính tham khảo.
            </Alert>
          }

          {isMaxChecklistReached &&
            <Alert severity="warning">
              Card đã đạt giới hạn checklist, không thể áp dụng thêm checklist mới.
            </Alert>
          }

          {error &&
            <Alert severity="error">{error}</Alert>
          }

          {loading &&
            <Stack spacing={1.5} alignItems="center" sx={{ py: 3 }}>
              <CircularProgress size={28} />
              <Typography variant="body2" color="text.secondary">
                Đang tạo gợi ý checklist...
              </Typography>
            </Stack>
          }

          {!loading && suggestion &&
            <>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper'
              }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography sx={{ fontWeight: 700, flex: 1, minWidth: 160 }}>
                      {checklistTitle}
                    </Typography>
                    {confidenceLabel &&
                      <Chip size="small" label={`Tin cậy ${confidenceLabel}`} color="primary" variant="outlined" />
                    }
                  </Stack>
                  {generatedAtLabel &&
                    <Typography variant="caption" color="text.secondary">
                      Gợi ý lúc: {generatedAtLabel}
                    </Typography>
                  }
                  {notesText &&
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {notesText}
                    </Alert>
                  }
                </Stack>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Đã chọn {selectedItems.length}/{visibleItems.length} mục
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={handleSelectAll} disabled={applying || !visibleItems.length}>
                    Chọn tất cả
                  </Button>
                  <Button size="small" color="inherit" onClick={handleClearSelection} disabled={applying || !visibleItems.length}>
                    Bỏ chọn tất cả
                  </Button>
                </Stack>
              </Stack>

              {!visibleItems.length &&
                <Alert severity="info">
                  AI chưa trả về mục checklist hợp lệ.
                </Alert>
              }

              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {visibleItems.map((item, index) => {
                  const itemId = `${item.title}-${index}`
                  const isSelected = selectedItemIndexSet.has(index)

                  return (
                    <ListItemButton
                      key={itemId}
                      onClick={() => handleToggleItem(index)}
                      disabled={applying}
                      sx={{
                        borderRadius: 2,
                        border: (theme) => `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                        bgcolor: isSelected ? 'action.selected' : 'background.paper',
                        alignItems: 'flex-start'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 38 }}>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 700 }}>
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          item.reason
                            ? <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {item.reason}
                            </Typography>
                            : null
                        }
                      />
                    </ListItemButton>
                  )
                })}
              </List>

              {suggestion?.items?.length > MAX_VISIBLE_ITEMS &&
                <Typography variant="caption" color="text.secondary">
                  Chỉ hiển thị {MAX_VISIBLE_ITEMS} mục đầu tiên để giữ giao diện gọn.
                </Typography>
              }
            </>
          }

          {applying &&
            <Box>
              <LinearProgress
                variant={applyProgress.total ? 'determinate' : 'indeterminate'}
                value={applyProgress.total ? (applyProgress.current / applyProgress.total) * 100 : 0}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Đang thêm {applyProgress.current}/{applyProgress.total} mục...
              </Typography>
            </Box>
          }
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={applying}>Đóng</Button>
        <Button
          variant="contained"
          startIcon={applying ? <CircularProgress color="inherit" size={16} /> : <AutoAwesomeIcon />}
          onClick={handleApplyChecklist}
          disabled={!canApply}
        >
          {applying
            ? `Đang thêm ${applyProgress.current}/${applyProgress.total}...`
            : 'Áp dụng checklist'
          }
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AiChecklistSuggestionDialog
