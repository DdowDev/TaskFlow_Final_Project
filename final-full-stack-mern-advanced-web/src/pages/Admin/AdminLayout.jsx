import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import AppBar from '~/components/AppBar/AppBar'
import AdminNav from '~/pages/Admin/components/AdminNav'
import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />
      <Box sx={{
        px: { xs: 2, md: 4 },
        py: 3,
        minHeight: (theme) => `calc(100vh - ${theme.trello.appBarHeight})`,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#111827' : '#f7f9fc'
      }}>
        <Container maxWidth="xl" disableGutters>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <AdminPanelSettingsIcon color="primary" />
                <Chip size="small" label="System Admin" color="primary" variant="outlined" />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Admin Console
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Monitor users, boards, and system activity at a glance.
              </Typography>
            </Box>
          </Stack>

          <AdminNav />
          <Outlet />
        </Container>
      </Box>
    </Container>
  )
}

export default AdminLayout
