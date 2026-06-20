import { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import { CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'

const statusOptions = [
  { value: CARD_STATUSES.TODO, label: 'Todo' },
  { value: CARD_STATUSES.IN_PROGRESS, label: 'In Progress' },
  { value: CARD_STATUSES.IN_REVIEW, label: 'In Review' },
  { value: CARD_STATUSES.DONE, label: 'Done' },
  { value: CARD_STATUSES.CANCELLED, label: 'Cancelled' }
]

const priorityOptions = [
  { value: CARD_PRIORITIES.LOW, label: 'Low', color: 'default' },
  { value: CARD_PRIORITIES.MEDIUM, label: 'Medium', color: 'primary' },
  { value: CARD_PRIORITIES.HIGH, label: 'High', color: 'warning' },
  { value: CARD_PRIORITIES.URGENT, label: 'Urgent', color: 'error' }
]

const getStatusChipStyles = (status, selected, theme) => {
  const isDark = theme.palette.mode === 'dark'

  const statusColors = {
    [CARD_STATUSES.TODO]: {
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
      color: isDark ? '#60a5fa' : '#1d4ed8',
      border: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'
    },
    [CARD_STATUSES.IN_PROGRESS]: {
      bg: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
      color: isDark ? '#818cf8' : '#4f46e5',
      border: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)'
    },
    [CARD_STATUSES.IN_REVIEW]: {
      bg: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)',
      color: isDark ? '#c084fc' : '#7e22ce',
      border: isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.3)'
    },
    [CARD_STATUSES.DONE]: {
      bg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      color: isDark ? '#34d399' : '#047857',
      border: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'
    },
    [CARD_STATUSES.CANCELLED]: {
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      color: isDark ? '#f87171' : '#b91c1c',
      border: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'
    }
  }

  const colorConfig = statusColors[status] || { bg: 'transparent', color: 'inherit', border: 'transparent' }

  if (selected) {
    return {
      backgroundColor: colorConfig.bg,
      color: colorConfig.color,
      border: `1.5px solid ${colorConfig.border}`,
      fontWeight: 700,
      '&:hover': {
        backgroundColor: colorConfig.bg,
        opacity: 0.95
      }
    }
  }

  return {
    backgroundColor: 'transparent',
    color: theme.palette.text.secondary,
    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.15)',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      color: theme.palette.text.primary,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
    }
  }
}

const getPriorityChipStyles = (priority, selected, theme) => {
  const isDark = theme.palette.mode === 'dark'

  const priorityColors = {
    [CARD_PRIORITIES.LOW]: {
      bg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      color: isDark ? '#34d399' : '#047857',
      border: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'
    },
    [CARD_PRIORITIES.MEDIUM]: {
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
      color: isDark ? '#fbbf24' : '#b45309',
      border: isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.3)'
    },
    [CARD_PRIORITIES.HIGH]: {
      bg: isDark ? 'rgba(252, 90, 90, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      color: isDark ? '#f87171' : '#b91c1c',
      border: isDark ? 'rgba(252, 90, 90, 0.4)' : 'rgba(239, 68, 68, 0.3)'
    },
    [CARD_PRIORITIES.URGENT]: {
      bg: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.08)',
      color: isDark ? '#f472b6' : '#be185d',
      border: isDark ? 'rgba(236, 72, 153, 0.4)' : 'rgba(236, 72, 153, 0.3)'
    }
  }

  const colorConfig = priorityColors[priority] || { bg: 'transparent', color: 'inherit', border: 'transparent' }

  if (selected) {
    return {
      backgroundColor: colorConfig.bg,
      color: colorConfig.color,
      border: `1.5px solid ${colorConfig.border}`,
      fontWeight: 700,
      '&:hover': {
        backgroundColor: colorConfig.bg,
        opacity: 0.95
      }
    }
  }

  return {
    backgroundColor: 'transparent',
    color: theme.palette.text.secondary,
    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.15)',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      color: theme.palette.text.primary,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
    }
  }
}

function BoardFilterPanel({
  filters,
  onChangeFilters,
  onClearFilters,
  filterActiveCount = 0
}) {
  const theme = useTheme()
  const [searchInput, setSearchInput] = useState(filters.search || '')

  useEffect(() => {
    setSearchInput(filters.search || '')
  }, [filters.search])

  useEffect(() => {
    const normalizedSearch = searchInput.trim()
    if (normalizedSearch === (filters.search || '')) return

    const timeoutId = setTimeout(() => {
      onChangeFilters({ search: normalizedSearch })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters.search, onChangeFilters, searchInput])

  const toggleArrayFilter = (fieldName, value) => {
    const currentValues = filters[fieldName] || []
    const nextValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value]

    onChangeFilters({ [fieldName]: nextValues })
  }

  const checkboxFilters = [
    { key: 'overdue', label: 'Overdue only', icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
    { key: 'dueSoon', label: 'Due soon', icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
    { key: 'assignedToMe', label: 'Assigned to me', icon: <PersonIcon sx={{ fontSize: 16 }} /> },
    { key: 'unassigned', label: 'Chưa có người phụ trách', icon: <PersonOutlineIcon sx={{ fontSize: 16 }} /> },
    { key: 'lowChecklist', label: 'Checklist chưa đạt (< 50%)', icon: <PlaylistAddCheckIcon sx={{ fontSize: 18 }} /> }
  ]

  return (
    <Box sx={{ width: 340, p: 2.5 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
            Board Filters
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Combine filters to find cards in this board.
          </Typography>
        </Box>

        <TextField
          placeholder="Search card title..."
          size="small"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: searchInput && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchInput('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: '8px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
              }
            }
          }}
        />

        <Divider sx={{ my: 0.5 }} />

        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'text.secondary',
              letterSpacing: '0.6px',
              display: 'block',
              mb: 1.5
            }}
          >
            Status
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ gap: '8px' }}>
            {statusOptions.map(option => {
              const selected = filters.statuses.includes(option.value)
              const chipStyles = getStatusChipStyles(option.value, selected, theme)
              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  onClick={() => toggleArrayFilter('statuses', option.value)}
                  sx={{
                    borderRadius: '6px',
                    fontSize: '11px',
                    height: '28px',
                    transition: 'all 0.2s ease',
                    ...chipStyles
                  }}
                />
              )
            })}
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'text.secondary',
              letterSpacing: '0.6px',
              display: 'block',
              mb: 1.5
            }}
          >
            Priority
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ gap: '8px' }}>
            {priorityOptions.map(option => {
              const selected = filters.priorities.includes(option.value)
              const chipStyles = getPriorityChipStyles(option.value, selected, theme)
              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  onClick={() => toggleArrayFilter('priorities', option.value)}
                  sx={{
                    borderRadius: '6px',
                    fontSize: '11px',
                    height: '28px',
                    transition: 'all 0.2s ease',
                    ...chipStyles
                  }}
                />
              )
            })}
          </Stack>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'text.secondary',
              letterSpacing: '0.6px',
              display: 'block',
              mb: 1.5
            }}
          >
            Advanced Options
          </Typography>
          <Stack spacing={0.75}>
            {checkboxFilters.map(filter => {
              const checked = Boolean(filters[filter.key])
              return (
                <Box
                  key={filter.key}
                  onClick={() => onChangeFilters({ [filter.key]: !checked })}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: '1px solid transparent',
                    bgcolor: checked
                      ? (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.05)'
                      : 'transparent',
                    borderColor: checked
                      ? (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'
                      : 'transparent',
                    '&:hover': {
                      bgcolor: checked
                        ? (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.08)'
                        : 'action.hover',
                      borderColor: checked
                        ? (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)'
                        : (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  <Checkbox
                    checked={checked}
                    size="small"
                    disableRipple
                    sx={{
                      p: 0,
                      pointerEvents: 'none',
                      color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)',
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                    {filter.icon && (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: checked ? 'primary.main' : 'text.secondary' }}>
                        {filter.icon}
                      </Box>
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: checked ? 600 : 400,
                        color: checked ? 'text.primary' : 'text.secondary',
                        transition: 'color 0.15s ease'
                      }}
                    >
                      {filter.label}
                    </Typography>
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Box>

        {filters.cardIds?.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip
              label={`AI Filter: ${filters.cardIds.length} thẻ`}
              color="primary"
              size="small"
              variant="outlined"
              onDelete={() => onChangeFilters({ cardIds: [] })}
            />
          </Box>
        )}

        <Button
          variant={filterActiveCount > 0 ? 'contained' : 'outlined'}
          color={filterActiveCount > 0 ? 'error' : 'inherit'}
          startIcon={<FilterAltOffIcon sx={{ fontSize: 16 }} />}
          onClick={onClearFilters}
          disabled={!filterActiveCount}
          fullWidth
          sx={{
            py: 1,
            fontWeight: 700,
            borderRadius: '8px',
            textTransform: 'none',
            boxShadow: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 'none'
            }
          }}
        >
          Xóa tất cả bộ lọc {filterActiveCount > 0 ? `(${filterActiveCount})` : ''}
        </Button>
      </Stack>
    </Box>
  )
}

export default BoardFilterPanel
