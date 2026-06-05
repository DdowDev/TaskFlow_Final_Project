import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ChecklistIcon from '@mui/icons-material/Checklist'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import { alpha, useTheme } from '@mui/material/styles'
import { CARD_STATUSES } from '~/utils/constants'

const getNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0

function KpiCard({ icon, label, value, suffix, accentColor, onClick }) {
  const theme = useTheme()
  const isClickable = Boolean(onClick)

  const content = (
    <Box
      sx={{
        position: 'relative',
        p: 1.75,
        height: '100%',
        minHeight: 104,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
        ...(isClickable && {
          cursor: 'pointer',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderColor: 'primary.main',
            transform: 'translateY(-1px)'
          }
        })
      }}
    >
      {accentColor &&
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            bgcolor: accentColor
          }}
        />
      }

      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.4 }}
          >
            {label}
          </Typography>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              color: accentColor || 'primary.main',
              bgcolor: accentColor ? alpha(accentColor, 0.12) : 'action.hover'
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1 }}>
          {value}
          {suffix &&
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 800 }}>
              {suffix}
            </Typography>
          }
        </Typography>
      </Stack>
    </Box>
  )

  if (!isClickable) return content

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'block',
        width: '100%',
        height: '100%',
        textAlign: 'left',
        borderRadius: 2
      }}
    >
      {content}
    </ButtonBase>
  )
}

function KpiRow({ data, onDrillDown }) {
  const theme = useTheme()

  const items = [
    {
      key: 'total',
      label: 'Total Cards',
      value: getNumber(data?.totalCards),
      icon: <AssignmentIcon fontSize="small" />
    },
    {
      key: 'completed',
      label: 'Completed',
      value: getNumber(data?.completedCards),
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      accentColor: theme.palette.success.main,
      onClick: () => onDrillDown({ statuses: [CARD_STATUSES.DONE] })
    },
    {
      key: 'overdue',
      label: 'Overdue',
      value: getNumber(data?.overdueCardsCount),
      icon: <ErrorOutlineIcon fontSize="small" />,
      accentColor: theme.palette.error.main,
      onClick: () => onDrillDown({ overdue: true, dueSoon: false })
    },
    {
      key: 'dueSoon',
      label: 'Due Soon',
      value: getNumber(data?.dueSoonCardsCount),
      icon: <HourglassEmptyIcon fontSize="small" />,
      accentColor: theme.palette.warning.main,
      onClick: () => onDrillDown({ dueSoon: true, overdue: false })
    },
    {
      key: 'noDueDate',
      label: 'No Due Date',
      value: getNumber(data?.cardsWithoutDueDate),
      icon: <EventBusyIcon fontSize="small" />
    },
    {
      key: 'checklist',
      label: 'Checklist Avg',
      value: getNumber(data?.averageChecklistProgress),
      suffix: '%',
      icon: <ChecklistIcon fontSize="small" />
    }
  ]

  return (
    <Grid container spacing={1.5}>
      {items.map(item => (
        <Grid key={item.key} item xs={6} sm={4} md={2}>
          <KpiCard {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default KpiRow
