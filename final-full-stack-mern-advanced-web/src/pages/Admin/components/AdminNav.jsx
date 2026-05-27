import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Users', path: '/admin/users', icon: <PeopleAltIcon fontSize="small" /> },
  { label: 'Boards', path: '/admin/boards', icon: <ViewKanbanIcon fontSize="small" /> }
]

function AdminNav() {
  const location = useLocation()
  const currentTab = navItems.some(item => item.path === location.pathname)
    ? location.pathname
    : '/admin/dashboard'

  return (
    <Box sx={{
      borderBottom: '1px solid',
      borderColor: 'divider',
      mb: 3,
      overflowX: 'auto'
    }}>
      <Tabs
        value={currentTab}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="admin navigation"
      >
        {navItems.map(item => (
          <Tab
            key={item.path}
            value={item.path}
            label={item.label}
            icon={item.icon}
            iconPosition="start"
            component={Link}
            to={item.path}
            sx={{ minHeight: 48, fontWeight: 700 }}
          />
        ))}
      </Tabs>
    </Box>
  )
}

export default AdminNav
