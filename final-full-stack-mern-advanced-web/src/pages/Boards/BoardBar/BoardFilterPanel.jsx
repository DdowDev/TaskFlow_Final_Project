import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
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

function BoardFilterPanel({
  filters,
  onChangeFilters,
  onClearFilters,
  filterActiveCount = 0
}) {
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

  return (
    <Box sx={{ width: 340, p: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Board Filters</Typography>
          <Typography variant="caption" color="text.secondary">
            Combine filters to find cards in this board.
          </Typography>
        </Box>

        <TextField
          label="Search card title"
          size="small"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          fullWidth
        />

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Status</Typography>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {statusOptions.map(option => {
              const selected = filters.statuses.includes(option.value)
              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  onClick={() => toggleArrayFilter('statuses', option.value)}
                />
              )
            })}
          </Stack>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Priority</Typography>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {priorityOptions.map(option => {
              const selected = filters.priorities.includes(option.value)
              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  color={selected ? option.color : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  onClick={() => toggleArrayFilter('priorities', option.value)}
                />
              )
            })}
          </Stack>
        </Box>

        <Divider />

        <Stack spacing={0.5}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.overdue}
                onChange={(event) => onChangeFilters({ overdue: event.target.checked })}
              />
            }
            label="Overdue only"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.dueSoon}
                onChange={(event) => onChangeFilters({ dueSoon: event.target.checked })}
              />
            }
            label="Due soon"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.assignedToMe}
                onChange={(event) => onChangeFilters({ assignedToMe: event.target.checked })}
              />
            }
            label="Assigned to me"
          />
        </Stack>

        <Button
          variant="outlined"
          disabled={!filterActiveCount}
          onClick={onClearFilters}
        >
          Clear filters
        </Button>
      </Stack>
    </Box>
  )
}

export default BoardFilterPanel
