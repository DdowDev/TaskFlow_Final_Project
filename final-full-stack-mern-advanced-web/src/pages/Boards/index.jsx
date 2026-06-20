import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
// Grid: https://mui.com/material-ui/react-grid2/#whats-changed
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import ArchiveIcon from '@mui/icons-material/Archive'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
// import CardMedia from '@mui/material/CardMedia'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import randomColor from 'randomcolor'
import SidebarCreateBoardModal from './create'
import { fetchBoardsAPI, updateBoardDetailsAPI } from '~/apis'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { toast } from 'react-toastify'

import { styled } from '@mui/material/styles'
// Styles của mấy cái Sidebar item menu, anh gom lại ra đây cho gọn.
const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300]
  },
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#90caf9' : '#0c66e4',
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#e9f2ff'
  }
}))

function Boards() {
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const isSystemAdmin = currentUser?.role === 'system_admin'

  // Số lượng bản ghi boards hiển thị tối đa trên 1 page tùy dự án (thường sẽ là 12 cái)
  const [boards, setBoards] = useState(null)
  // Tổng toàn bộ số lượng bản ghi boards có trong Database mà phía BE trả về để FE dùng tính toán phân trang
  const [totalBoards, setTotalBoards] = useState(null)

  // Xử lý phân trang từ url với MUI: https://mui.com/material-ui/react-pagination/#router-integration
  const location = useLocation()
  /**
   * Parse chuỗi string search trong location về đối tượng URLSearchParams trong JavaScript
   * https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams
   */
  const query = new URLSearchParams(location.search)
  const showArchived = query.get('q[isArchived]') === 'true'
  /**
   * Lấy giá trị page từ query, default sẽ là 1 nếu không tồn tại page từ url.
   * Nhắc lại kiến thức cơ bản hàm parseInt cần tham số thứ 2 là Hệ thập phân (hệ đếm cơ số 10) để đảm bảo chuẩn số cho phân trang
   */
  const page = parseInt(query.get('page') || '1', 10)

  const updateStateData = (res) => {
    setBoards(res.boards || [])
    setTotalBoards(res.totalBoards || 0)
  }

  useEffect(() => {
    if (isSystemAdmin) return
    fetchBoardsAPI(location.search).then(updateStateData)
  }, [isSystemAdmin, location.search])

  const afterCreateNewBoard = () => {
    fetchBoardsAPI(location.search).then(updateStateData)
  }

  const handleRestoreBoard = (boardId) => {
    updateBoardDetailsAPI(boardId, { isArchived: false })
      .then(() => {
        toast.success('Board restored successfully.')
        fetchBoardsAPI(location.search).then(updateStateData)
      })
      .catch(error => {
        toast.error(error?.response?.data?.message || 'Could not restore board')
      })
  }

  if (isSystemAdmin) {
    return <Navigate to="/admin/dashboard" replace={true} />
  }

  // Lúc chưa tồn tại boards > đang chờ gọi api thì hiện loading
  if (!boards) {
    return <PageLoadingSpinner caption="Loading Boards..." />
  }

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />
      <Box sx={{ paddingX: 2, my: 4 }}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={3}>
            <Stack direction="column" spacing={1}>
              <SidebarItem
                className={!showArchived ? 'active' : ''}
                onClick={() => {
                  navigate('/boards')
                }}
              >
                <SpaceDashboardIcon fontSize="small" />
                Boards
              </SidebarItem>
              <SidebarItem
                className={showArchived ? 'active' : ''}
                onClick={() => {
                  navigate('/boards?q[isArchived]=true')
                }}
              >
                <ArchiveIcon fontSize="small" />
                Archived Boards
              </SidebarItem>
            </Stack>
            <Divider sx={{ my: 1 }} />
            {!showArchived && (
              <Stack direction="column" spacing={1}>
                <SidebarCreateBoardModal afterCreateNewBoard={afterCreateNewBoard} />
              </Stack>
            )}
          </Grid>

          <Grid xs={12} sm={9}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
              {showArchived ? 'Archived boards:' : 'Your boards:'}
            </Typography>

            {/* Trường hợp gọi API nhưng không tồn tại cái board nào trong Database trả về */}
            {boards?.length === 0 && isSystemAdmin &&
              <Card sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                maxWidth: 720
              }}>
                <CardContent>
                  <Stack spacing={2} alignItems="flex-start">
                    <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Bạn đang đăng nhập với quyền System Admin.
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        Bạn có thể vào Admin Console để quản lý người dùng, board và thống kê hệ thống.
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      to="/admin/dashboard"
                      variant="contained"
                      startIcon={<AdminPanelSettingsIcon />}
                    >
                      Go to Admin Console
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            }

            {boards?.length === 0 && !isSystemAdmin &&
              <Typography variant="span" sx={{ fontWeight: 'bold', mb: 3 }}>No result found!</Typography>
            }

            {/* Trường hợp gọi API và có boards trong Database trả về thì render danh sách boards */}
            {boards?.length > 0 &&
              <Grid container spacing={2}>
                {boards.map(b => {
                  const isOwner = b.ownerIds?.includes(currentUser?._id) || b.ownerIds?.some(id => id?.toString() === currentUser?._id?.toString())
                  return (
                    <Grid xs={2} sm={3} md={4} key={b._id}>
                      <Card sx={{ width: '250px' }}>
                        <Box sx={{ height: '50px', backgroundColor: randomColor() }}></Box>

                        <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
                          <Typography gutterBottom variant="h6" component="div">
                            {b?.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {b?.description}
                          </Typography>

                          {showArchived ? (
                            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip size="small" label="Archived" color="warning" sx={{ fontWeight: 700 }} />
                              {isOwner && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  onClick={() => handleRestoreBoard(b._id)}
                                >
                                  Restore
                                </Button>
                              )}
                            </Box>
                          ) : (
                            <Box
                              component={Link}
                              to={`/boards/${b._id}`}
                              sx={{
                                mt: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                color: 'primary.main',
                                '&:hover': { color: 'primary.light' }
                              }}>
                              Go to board <ArrowRightIcon fontSize="small" />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            }

            {/* Trường hợp gọi API và có totalBoards trong Database trả về thì render khu vực phân trang  */}
            {(totalBoards > 0) &&
              <Box sx={{ my: 3, pr: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Pagination
                  size="large"
                  color="secondary"
                  showFirstButton
                  showLastButton
                  count={Math.ceil(totalBoards / DEFAULT_ITEMS_PER_PAGE)}
                  page={page}
                  renderItem={(item) => (
                    <PaginationItem
                      component={Link}
                      to={`/boards${item.page === DEFAULT_PAGE ? (showArchived ? '?q[isArchived]=true' : '') : `?page=${item.page}${showArchived ? '&q[isArchived]=true' : ''}`}`}
                      {...item}
                    />
                  )}
                />
              </Box>
            }
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default Boards
