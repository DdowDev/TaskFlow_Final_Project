import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
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
import Typography from '@mui/material/Typography'
import { fetchAdminBoardsAPI } from '~/apis'
import StatusChip from '~/pages/Admin/components/StatusChip'

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

const safeArrayCount = (value) => Array.isArray(value) ? value.length : 0

const buildSearchPath = ({ page, rowsPerPage, searchValue }) => {
  const params = new URLSearchParams()
  params.set('page', String(page + 1))
  params.set('itemsPerPage', String(rowsPerPage))

  if (searchValue.trim()) {
    params.set('q[title]', searchValue.trim())
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

function BoardInfoDialog({ open, board, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Board information</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Typography><strong>Title:</strong> {board?.title || '-'}</Typography>
          <Typography><strong>Description:</strong> {board?.description || '-'}</Typography>
          <Typography><strong>Type:</strong> {board?.type || '-'}</Typography>
          <Typography><strong>Owners:</strong> {safeArrayCount(board?.ownerIds)}</Typography>
          <Typography><strong>Members:</strong> {safeArrayCount(board?.memberIds)}</Typography>
          <Typography><strong>Created:</strong> {formatDate(board?.createdAt)}</Typography>
          <Typography><strong>Board ID:</strong> {board?._id || '-'}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

function AdminBoards() {
  const [boards, setBoards] = useState([])
  const [totalBoards, setTotalBoards] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBoard, setSelectedBoard] = useState(null)

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
      searchValue: debouncedSearchValue
    })

    fetchAdminBoardsAPI(searchPath)
      .then(res => {
        setBoards(Array.isArray(res?.boards) ? res.boards : [])
        setTotalBoards(Number.isFinite(Number(res?.totalBoards)) ? Number(res.totalBoards) : 0)
      })
      .catch(() => {
        setError('Could not load boards.')
        setBoards([])
        setTotalBoards(0)
      })
      .finally(() => setLoading(false))
  }, [page, rowsPerPage, debouncedSearchValue])

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
            Boards
          </Typography>
          <Typography color="text.secondary">
            View boards across the system without changing board data.
          </Typography>
        </Box>

        <TextField
          size="small"
          value={searchValue}
          onChange={handleSearchValueChange}
          placeholder="Search title"
          sx={{ minWidth: { xs: '100%', sm: 300 } }}
        />
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
                  <TableCell sx={{ fontWeight: 800 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Owners</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Members</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading && <TableLoadingRows rowsPerPage={Math.min(rowsPerPage, 10)} />}

                {!loading && boards.length === 0 &&
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No boards found.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                }

                {!loading && boards.map(board => (
                  <TableRow key={board?._id || board?.title} hover>
                    <TableCell sx={{ minWidth: 220 }}>{board?.title || '-'}</TableCell>
                    <TableCell><StatusChip type="boardType" value={board?.type} /></TableCell>
                    <TableCell>{safeArrayCount(board?.ownerIds)}</TableCell>
                    <TableCell>{safeArrayCount(board?.memberIds)}</TableCell>
                    <TableCell sx={{ minWidth: 140 }}>{formatDate(board?.createdAt)}</TableCell>
                    <TableCell><StatusChip type="destroy" value={Boolean(board?._destroy)} /></TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedBoard(board)}
                      >
                        View info
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalBoards}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </CardContent>
      </Card>

      <BoardInfoDialog
        open={Boolean(selectedBoard)}
        board={selectedBoard}
        onClose={() => setSelectedBoard(null)}
      />
    </Stack>
  )
}

export default AdminBoards
