import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import InsightsIcon from '@mui/icons-material/Insights'
import { Tooltip } from '@mui/material'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

const VIEW_CHIP_STYLES = (isActive) => ({
  ...MENU_STYLES,
  bgcolor: isActive ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.24)',
  fontWeight: isActive ? 700 : 500
})

function BoardBar({ board, activeView = 'kanban', onChangeView = () => {} }) {
  const currentUser = useSelector(selectCurrentUser)
  const isBoardOwner = board?.owners?.some(owner => owner._id === currentUser?._id)

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2')
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={board?.description}>
          <Chip
            sx={MENU_STYLES}
            icon={<DashboardIcon />}
            label={board?.title}
            clickable
          />
        </Tooltip>
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add To Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Chip
            sx={VIEW_CHIP_STYLES(activeView === 'kanban')}
            icon={<ViewKanbanIcon />}
            label="Kanban"
            clickable
            onClick={() => onChangeView('kanban')}
          />
          <Chip
            sx={VIEW_CHIP_STYLES(activeView === 'dashboard')}
            icon={<InsightsIcon />}
            label="Dashboard"
            clickable
            onClick={() => onChangeView('dashboard')}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Xử lý mời user vào làm thành viên của board */}
        {isBoardOwner && <InviteBoardUser boardId={board._id} />}

        {/* Xử lý hiển thị danh sách thành viên của board */}
        <BoardUserGroup boardUsers={board?.FE_allUsers} />
      </Box>
    </Box>
  )
}

export default BoardBar
