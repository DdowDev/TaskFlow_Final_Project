import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { fetchAdminUsersAPI, updateAdminUserStatusAPI } from '~/apis'
import { selectCurrentUser } from '~/redux/user/userSlice'
import StatusChip from '~/pages/Admin/components/StatusChip'
import BlockUserDialog from '~/pages/Admin/components/BlockUserDialog'

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

const buildSearchPath = ({ page, rowsPerPage, searchField, searchValue }) => {
  const params = new URLSearchParams()
  params.set('page', String(page + 1))
  params.set('itemsPerPage', String(rowsPerPage))

  if (searchValue.trim()) {
    params.set(`q[${searchField}]`, searchValue.trim())
  }

  return `?${params.toString()}`
}

function TableLoadingRows({ rowsPerPage }) {
  return [...Array(rowsPerPage)].map((_, index) => (
    <TableRow key={index}>
      {[...Array(7)].map((__, cellIndex) => (
        <TableCell key={cellIndex}>
          <Skeleton height={32} />
        </TableCell>
      ))}
    </TableRow>
  ))
}

function AdminUsers() {
  const currentUser = useSelector(selectCurrentUser)
  const [users, setUsers] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchField, setSearchField] = useState('email')
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dialogState, setDialogState] = useState({ open: false, user: null, nextBlocked: false })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, 500)

    return () => clearTimeout(timeout)
  }, [searchValue])

  useEffect(() => {
    setLoading(true)
    setError(null)

    const searchPath = buildSearchPath({
      page,
      rowsPerPage,
      searchField,
      searchValue: debouncedSearchValue
    })

    fetchAdminUsersAPI(searchPath)
      .then(res => {
        setUsers(Array.isArray(res?.users) ? res.users : [])
        setTotalUsers(Number.isFinite(Number(res?.totalUsers)) ? Number(res.totalUsers) : 0)
      })
      .catch(() => {
        setError('Could not load users.')
        setUsers([])
        setTotalUsers(0)
      })
      .finally(() => setLoading(false))
  }, [page, rowsPerPage, searchField, debouncedSearchValue])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchValueChange = (event) => {
    setSearchValue(event.target.value)
    setPage(0)
  }

  const handleSearchFieldChange = (event) => {
    setSearchField(event.target.value)
    setPage(0)
  }

  const handleOpenStatusDialog = (user) => {
    setDialogState({
      open: true,
      user,
      nextBlocked: !user?.isBlocked
    })
  }

  const handleCloseStatusDialog = () => {
    if (submitting) return
    setDialogState({ open: false, user: null, nextBlocked: false })
  }

  const handleConfirmStatus = (data) => {
    if (!dialogState.user?._id) return

    setSubmitting(true)
    updateAdminUserStatusAPI(dialogState.user._id, data)
      .then(updatedUser => {
        setUsers(prevUsers => prevUsers.map(user => (
          user._id === updatedUser._id ? updatedUser : user
        )))
        toast.success(data.isBlocked ? 'User blocked successfully.' : 'User unblocked successfully.')
        setDialogState({ open: false, user: null, nextBlocked: false })
      })
      .catch(() => {})
      .finally(() => setSubmitting(false))
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Users
          </Typography>
          <Typography color="text.secondary">
            Review accounts and block or unblock access when needed.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="admin-user-search-field-label">Search by</InputLabel>
            <Select
              labelId="admin-user-search-field-label"
              value={searchField}
              label="Search by"
              onChange={handleSearchFieldChange}
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="displayName">Display Name</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            value={searchValue}
            onChange={handleSearchValueChange}
            placeholder={`Search ${searchField}`}
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
          />
        </Stack>
      </Stack>

      {error &&
        <Alert severity="error">{error}</Alert>
      }

      <Card sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Display Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Email Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Account Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Created At</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading && <TableLoadingRows rowsPerPage={Math.min(rowsPerPage, 10)} />}

                {!loading && users.length === 0 &&
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No users found.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                }

                {!loading && users.map(user => {
                  const isSelf = String(user?._id) === String(currentUser?._id)

                  return (
                    <TableRow key={user?._id || user?.email} hover>
                      <TableCell sx={{ minWidth: 220 }}>{user?.email || '-'}</TableCell>
                      <TableCell sx={{ minWidth: 180 }}>{user?.displayName || '-'}</TableCell>
                      <TableCell><StatusChip type="role" value={user?.role} /></TableCell>
                      <TableCell><StatusChip type="active" value={Boolean(user?.isActive)} /></TableCell>
                      <TableCell><StatusChip type="blocked" value={Boolean(user?.isBlocked)} /></TableCell>
                      <TableCell sx={{ minWidth: 140 }}>{formatDate(user?.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title={isSelf ? 'You cannot block yourself' : ''}>
                          <span>
                            <Button
                              size="small"
                              variant={user?.isBlocked ? 'outlined' : 'contained'}
                              color={user?.isBlocked ? 'success' : 'error'}
                              disabled={isSelf}
                              onClick={() => handleOpenStatusDialog(user)}
                            >
                              {user?.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </CardContent>
      </Card>

      <BlockUserDialog
        open={dialogState.open}
        user={dialogState.user}
        nextBlocked={dialogState.nextBlocked}
        loading={submitting}
        onClose={handleCloseStatusDialog}
        onConfirm={handleConfirmStatus}
      />
    </Stack>
  )
}

export default AdminUsers
