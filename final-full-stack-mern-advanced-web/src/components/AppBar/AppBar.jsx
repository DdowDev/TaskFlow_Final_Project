import Box from '@mui/material/Box'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import AppsIcon from '@mui/icons-material/Apps'
import { ReactComponent as TrelloIcon } from '~/assets/trello.svg'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Workspaces from './Menus/Workspaces'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Templates from './Menus/Templates'
import Profiles from './Menus/Profiles'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import Notifications from './Notifications/Notifications'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'

function AppBar() {
  const currentUser = useSelector(selectCurrentUser)
  const isSystemAdmin = currentUser?.role === 'system_admin'
  const homePath = isSystemAdmin ? '/admin/dashboard' : '/boards'

  return (
    <Box sx={{
      position: 'sticky',
      top: 0,
      zIndex: (theme) => theme.zIndex.appBar,
      width: '100%',
      height: (theme) => theme.trello.appBarHeight,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2c3e50' : '#1565c0')
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Link to={homePath}>
          <Tooltip title={isSystemAdmin ? 'Admin Console' : 'Board List'}>
            <AppsIcon sx={{ color: 'white', verticalAlign: 'middle' }} />
          </Tooltip>
        </Link>

        <Link to={homePath} style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SvgIcon component={TrelloIcon} fontSize="small" inheritViewBox sx={{ color: 'white' }} />
            <Typography variant="span" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>TaskFlowDdow</Typography>
          </Box>
        </Link>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {!isSystemAdmin &&
            <>
              <Workspaces />
              <Recent />
              <Starred />
              <Templates />
            </>
          }
          {isSystemAdmin &&
            <Button
              component={Link}
              to="/admin/dashboard"
              sx={{
                color: 'white',
                border: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { border: 'none', bgcolor: 'rgba(255,255,255,0.14)' }
              }}
              variant="outlined"
              startIcon={<AdminPanelSettingsIcon />}
            >
              Admin Console
            </Button>
          }
          {!isSystemAdmin &&
            <Button
              sx={{
                color: 'white',
                border: 'none',
                '&:hover': { border: 'none' }
              }}
              variant="outlined"
              startIcon={<LibraryAddIcon />}
            >
              Create
            </Button>
          }
        </Box>

      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Tìm kiếm nhanh một hoặc nhiều cái board */}
        {!isSystemAdmin && <AutoCompleteSearchBoard />}

        {/* Dark - Light - System modes */}
        <ModeSelect />

        {/* Xử lý hiển thị các thông báo - notifications ở đây */}
        <Notifications />

        <Tooltip title="Help">
          <HelpOutlineIcon sx={{ cursor: 'pointer', color: 'white' }} />
        </Tooltip>

        <Profiles />

      </Box>
    </Box>
  )
}

export default AppBar
