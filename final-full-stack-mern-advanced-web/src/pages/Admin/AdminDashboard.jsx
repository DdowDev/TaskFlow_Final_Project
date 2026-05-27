import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import BlockIcon from '@mui/icons-material/Block'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import { useTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { fetchAdminDashboardAPI } from '~/apis'
import StatCard from '~/pages/Admin/components/StatCard'
import { selectCurrentUser } from '~/redux/user/userSlice'

const safeNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0

function ChartCard({ title, children }) {
  return (
    <Card sx={{
      height: 360,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <CardContent sx={{ height: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ height: 280 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  )
}

function WelcomeSection({ currentUser }) {
  const displayName = currentUser?.displayName || currentUser?.username || 'System Admin'

  return (
    <Card sx={{
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      background: (theme) => theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(25,118,210,0.18), rgba(156,39,176,0.10))'
        : 'linear-gradient(135deg, #e9f2ff, #f7f0ff)'
    }}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <AdminPanelSettingsIcon color="primary" />
              <Chip label="System Admin" color="primary" size="small" sx={{ fontWeight: 700 }} />
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              Welcome back, {displayName}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Monitor users, boards, and system activity at a glance.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={132} />
      <Grid container spacing={2}>
        {[...Array(5)].map((_, index) => (
          <Grid xs={12} sm={6} md={index < 3 ? 4 : 6} lg={2.4} key={index}>
            <Skeleton variant="rounded" height={128} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid xs={12} md={5}>
          <Skeleton variant="rounded" height={360} />
        </Grid>
        <Grid xs={12} md={7}>
          <Skeleton variant="rounded" height={360} />
        </Grid>
      </Grid>
    </Stack>
  )
}

function AdminDashboard() {
  const theme = useTheme()
  const currentUser = useSelector(selectCurrentUser)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchAdminDashboardAPI()
      .then(data => {
        setDashboard(data || {})
      })
      .catch(() => {
        setError('Could not load admin dashboard data.')
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ({
    totalUsers: safeNumber(dashboard?.totalUsers),
    activeUsers: safeNumber(dashboard?.activeUsers),
    blockedUsers: safeNumber(dashboard?.blockedUsers),
    totalBoards: safeNumber(dashboard?.totalBoards),
    totalCards: safeNumber(dashboard?.totalCards)
  }), [dashboard])

  const userStatusData = [
    { name: 'Active Users', value: stats.activeUsers },
    { name: 'Blocked Users', value: stats.blockedUsers }
  ]

  const systemData = [
    { name: 'Users', value: stats.totalUsers },
    { name: 'Boards', value: stats.totalBoards },
    { name: 'Cards', value: stats.totalCards }
  ]

  const pieColors = [theme.palette.success.main, theme.palette.error.main]
  const hasUserStatusData = userStatusData.some(item => item.value > 0)
  const hasSystemData = systemData.some(item => item.value > 0)

  if (loading) return <DashboardSkeleton />

  return (
    <Fade in={true} timeout={450}>
      <Stack spacing={3}>
        <WelcomeSection currentUser={currentUser} />

        {error &&
          <Alert severity="error">{error}</Alert>
        }

        {!error && !dashboard &&
          <Alert severity="info">No dashboard data available.</Alert>
        }

        <Grid container spacing={2}>
          <Grid xs={12} sm={6} md={4} lg={2.4}>
            <StatCard title="Total Users" value={stats.totalUsers} color="primary.main" icon={<PeopleAltIcon />} />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={2.4}>
            <StatCard title="Active Users" value={stats.activeUsers} color="success.main" icon={<VerifiedUserIcon />} />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={2.4}>
            <StatCard title="Blocked Users" value={stats.blockedUsers} color="error.main" icon={<BlockIcon />} />
          </Grid>
          <Grid xs={12} sm={6} md={6} lg={2.4}>
            <StatCard title="Total Boards" value={stats.totalBoards} color="info.main" icon={<ViewKanbanIcon />} />
          </Grid>
          <Grid xs={12} sm={6} md={6} lg={2.4}>
            <StatCard title="Total Cards" value={stats.totalCards} color="warning.main" icon={<CreditCardIcon />} />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid xs={12} md={5}>
            <ChartCard title="User Status">
              {hasUserStatusData
                ? <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                    >
                      {userStatusData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                : <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                  <Typography color="text.secondary">No user status data available.</Typography>
                </Box>
              }
            </ChartCard>
          </Grid>

          <Grid xs={12} md={7}>
            <ChartCard title="System Overview">
              {hasSystemData
                ? <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={systemData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis allowDecimals={false} stroke={theme.palette.text.secondary} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      fill={theme.palette.primary.main}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
                : <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                  <Typography color="text.secondary">No system overview data available.</Typography>
                </Box>
              }
            </ChartCard>
          </Grid>
        </Grid>
      </Stack>
    </Fade>
  )
}

export default AdminDashboard
