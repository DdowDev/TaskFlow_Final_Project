import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import RefreshIcon from '@mui/icons-material/Refresh'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { alpha, useTheme } from '@mui/material/styles'

const getHealthMeta = (status, score) => {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus === 'critical') {
    return { color: 'error', label: 'Critical', icon: <ReportProblemIcon /> }
  }

  if (['at_risk', 'at-risk', 'warning'].includes(normalizedStatus)) {
    return { color: 'warning', label: 'At risk', icon: <WarningAmberIcon /> }
  }

  if (['healthy', 'good'].includes(normalizedStatus)) {
    return { color: 'success', label: 'Healthy', icon: <FavoriteBorderIcon /> }
  }

  const safeScore = Number(score)
  if (Number.isFinite(safeScore)) {
    if (safeScore <= 40) return { color: 'error', label: 'Critical', icon: <ReportProblemIcon /> }
    if (safeScore <= 70) return { color: 'warning', label: 'At risk', icon: <WarningAmberIcon /> }
    return { color: 'success', label: 'Healthy', icon: <FavoriteBorderIcon /> }
  }

  return null
}

const formatUpdatedTime = (value) => {
  if (!value) return 'Chưa cập nhật'

  const diffMs = Date.now() - value
  const diffMinutes = Math.floor(diffMs / (60 * 1000))
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function DashboardHeader({ healthScore, healthStatus, updatedAt, loading, onRefresh }) {
  const theme = useTheme()
  const hasHealthScore = Number.isFinite(Number(healthScore))
  const healthMeta = hasHealthScore ? getHealthMeta(healthStatus, healthScore) : null

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        border: (theme) =>
          theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(0,0,0,0.09)',
        borderRadius: 2.5,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f2436' : '#ffffff',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={1.5}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              flexShrink: 0
            }}
          >
            <FavoriteBorderIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Board Dashboard
              </Typography>
              {healthMeta &&
                <Chip
                  size="small"
                  variant="outlined"
                  color={healthMeta.color}
                  icon={healthMeta.icon}
                  label={`${healthMeta.label} · ${Number(healthScore)}`}
                  sx={{ height: 24, fontWeight: 800 }}
                />
              }
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Theo dõi tiến độ, rủi ro và workload của board
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Updated {formatUpdatedTime(updatedAt)}
          </Typography>
          <Tooltip title="Refresh dashboard">
            <span>
              <IconButton
                size="small"
                disabled={loading}
                onClick={onRefresh}
                sx={{
                  bgcolor: 'action.hover',
                  transition: 'transform 0.6s ease',
                  transform: loading ? 'rotate(360deg)' : 'none'
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default DashboardHeader
