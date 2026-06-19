import Chip from '@mui/material/Chip'

const chipConfig = {
  role: {
    system_admin: { label: 'System Admin', color: 'secondary' },
    user: { label: 'User', color: 'default' },
    admin: { label: 'Legacy Admin', color: 'warning' },
    client: { label: 'Legacy User', color: 'default' }
  },
  active: {
    true: { label: 'Active', color: 'success' },
    false: { label: 'Inactive', color: 'warning' }
  },
  blocked: {
    true: { label: 'Blocked', color: 'error' },
    false: { label: 'Normal', color: 'success' }
  },

  destroy: {
    true: { label: 'Deleted', color: 'error' },
    false: { label: 'Active', color: 'success' }
  }
}

function StatusChip({ type, value }) {
  const normalizedValue = String(value)
  const config = chipConfig[type]?.[normalizedValue] || {
    label: value || 'Unknown',
    color: 'default'
  }

  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      variant={config.color === 'default' ? 'outlined' : 'filled'}
      sx={{ fontWeight: 600 }}
    />
  )
}

export default StatusChip
