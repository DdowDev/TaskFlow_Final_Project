import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

function BlockUserDialog({ open, user, nextBlocked, loading, onClose, onConfirm }) {
  const [blockedReason, setBlockedReason] = useState('')

  useEffect(() => {
    if (open) {
      setBlockedReason(user?.blockedReason || '')
    }
  }, [open, user])

  const handleConfirm = () => {
    onConfirm({
      isBlocked: nextBlocked,
      blockedReason: nextBlocked ? blockedReason : null
    })
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {nextBlocked ? 'Block user' : 'Unblock user'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {nextBlocked
            ? `Block ${user?.email || 'this user'} from signing in and using protected APIs.`
            : `Allow ${user?.email || 'this user'} to sign in and use the system again.`}
        </Typography>

        {nextBlocked &&
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Blocked reason"
            value={blockedReason}
            onChange={(event) => setBlockedReason(event.target.value)}
            placeholder="Reason shown to admins only"
          />
        }
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={nextBlocked ? 'error' : 'success'}
          onClick={handleConfirm}
          disabled={loading}
        >
          {nextBlocked ? 'Block' : 'Unblock'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BlockUserDialog
