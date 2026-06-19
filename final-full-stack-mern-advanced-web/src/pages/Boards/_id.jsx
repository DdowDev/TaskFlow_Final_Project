import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import BoardDashboard from './BoardDashboard/BoardDashboard'

// import { mockData } from '~/apis/mock-data'
import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { cloneDeep } from 'lodash'
import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useSearchParams } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { CARD_STATUSES } from '~/utils/constants'

const getDefaultBoardFilters = () => ({
  search: '',
  statuses: [],
  priorities: [],
  overdue: false,
  dueSoon: false,
  assignedToMe: false,
  memberId: '',
  cardIds: [],
  unassigned: false,
  lowChecklist: false
})

const getIdValue = (value) => value?._id || value?.id || value
const isSameId = (firstId, secondId) => getIdValue(firstId)?.toString() === getIdValue(secondId)?.toString()

const getTimestamp = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

const isClosedStatus = (status) => [CARD_STATUSES.DONE, CARD_STATUSES.CANCELLED].includes(status)

const isOverdueCard = (card) => {
  const dueDate = getTimestamp(card?.dueDate)
  return !!dueDate && dueDate < Date.now() && !isClosedStatus(card?.status)
}

const isDueSoonCard = (card) => {
  const dueDate = getTimestamp(card?.dueDate)
  const dueSoonLimit = Date.now() + (3 * 24 * 60 * 60 * 1000)
  return !!dueDate && dueDate >= Date.now() && dueDate <= dueSoonLimit && !isClosedStatus(card?.status)
}

const isAssignedToUser = (card, userId) => {
  const memberIds = Array.isArray(card?.memberIds) ? card.memberIds : []
  return memberIds.some(memberId => isSameId(memberId, userId))
}

const isLowChecklistCard = (card) => {
  if (isClosedStatus(card?.status)) return false
  const checklists = Array.isArray(card?.checklists) ? card.checklists : []
  const items = checklists.flatMap(c => Array.isArray(c?.items) ? c.items : [])
  if (!items.length) return false
  const completed = items.filter(item => item?.isCompleted).length
  return Math.round((completed / items.length) * 100) < 50
}

const getFilterActiveCount = (filters) => {
  let count = 0
  if (filters.search) count += 1
  if (filters.statuses.length) count += 1
  if (filters.priorities.length) count += 1
  if (filters.overdue) count += 1
  if (filters.dueSoon) count += 1
  if (filters.assignedToMe) count += 1
  if (filters.memberId) count += 1
  if (filters.cardIds?.length) count += 1
  if (filters.unassigned) count += 1
  if (filters.lowChecklist) count += 1
  return count
}

const doesCardMatchFilters = (card, filters, currentUserId) => {
  if (card?.FE_PlaceholderCard) return false

  const searchValue = filters.search.trim().toLowerCase()
  if (searchValue && !(card?.title || '').toLowerCase().includes(searchValue)) return false
  if (filters.statuses.length && !filters.statuses.includes(card?.status)) return false
  if (filters.priorities.length && !filters.priorities.includes(card?.priority)) return false
  if (filters.overdue && !isOverdueCard(card)) return false
  if (filters.dueSoon && !isDueSoonCard(card)) return false
  if (filters.assignedToMe && !isAssignedToUser(card, currentUserId)) return false
  if (filters.memberId && !isAssignedToUser(card, filters.memberId)) return false
  if (filters.cardIds?.length) {
    const cardId = card?._id?.toString?.() || String(card?._id || '')
    if (!filters.cardIds.includes(cardId)) return false
  }
  if (filters.unassigned) {
    const memberIds = Array.isArray(card?.memberIds) ? card.memberIds : []
    if (memberIds.length > 0) return false
  }
  if (filters.lowChecklist && !isLowChecklistCard(card)) return false

  return true
}

const countCardsInBoard = (targetBoard) => {
  return (targetBoard?.columns || []).reduce((total, column) => {
    const cards = Array.isArray(column?.cards) ? column.cards : []
    return total + cards.filter(card => !card?.FE_PlaceholderCard).length
  }, 0)
}

function Board() {
  const dispatch = useDispatch()
  // Không dùng State của component nữa mà chuyển qua dùng State của Redux
  const board = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)
  const [activeBoardView, setActiveBoardView] = useState('kanban')
  const [boardFilters, setBoardFilters] = useState(getDefaultBoardFilters)
  const lastScrolledElementRef = useRef('')

  const { boardId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryMemberId = searchParams.get('filterMember') || ''

  useEffect(() => {
    // Call API
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch, boardId])

  useEffect(() => {
    setBoardFilters(getDefaultBoardFilters())
    setActiveBoardView('kanban')
  }, [boardId])

  useEffect(() => {
    setBoardFilters(prevFilters => {
      if ((prevFilters.memberId || '') === queryMemberId) return prevFilters
      return { ...prevFilters, memberId: queryMemberId }
    })

    if (queryMemberId) setActiveBoardView('kanban')
  }, [queryMemberId])

  const updateFilterMemberQuery = useCallback((memberId, options = {}) => {
    const nextParams = new URLSearchParams(searchParams)
    if (memberId) nextParams.set('filterMember', memberId)
    else nextParams.delete('filterMember')

    setSearchParams(nextParams, options)
  }, [searchParams, setSearchParams])

  const updateBoardFilters = useCallback((filterPatch) => {
    setBoardFilters(prevFilters => {
      const nextFilters = { ...prevFilters, ...filterPatch }
      if (filterPatch.overdue) nextFilters.dueSoon = false
      if (filterPatch.dueSoon) nextFilters.overdue = false
      return nextFilters
    })
  }, [])

  const clearBoardFilters = useCallback(() => {
    setBoardFilters(getDefaultBoardFilters())
    updateFilterMemberQuery('', { replace: true })
    lastScrolledElementRef.current = ''
  }, [updateFilterMemberQuery])

  const clearMemberFilter = useCallback(() => {
    setBoardFilters(prevFilters => ({ ...prevFilters, memberId: '' }))
    updateFilterMemberQuery('', { replace: true })
  }, [updateFilterMemberQuery])

  const filterActiveCount = useMemo(() => getFilterActiveCount(boardFilters), [boardFilters])
  const isFilterActive = filterActiveCount > 0

  const filteredBoard = useMemo(() => {
    if (!board || !isFilterActive) return board

    return {
      ...board,
      columns: (board.columns || []).map(column => ({
        ...column,
        cards: (column.cards || []).filter(card => doesCardMatchFilters(card, boardFilters, currentUser?._id))
      }))
    }
  }, [board, boardFilters, currentUser?._id, isFilterActive])

  const matchedCardsCount = useMemo(() => countCardsInBoard(filteredBoard), [filteredBoard])

  const firstMatchedCardId = useMemo(() => {
    if (!isFilterActive) return null

    for (const column of filteredBoard?.columns || []) {
      const matchedCard = (column.cards || []).find(card => !card?.FE_PlaceholderCard && card?._id)
      if (matchedCard?._id) return matchedCard._id
    }

    return null
  }, [isFilterActive, filteredBoard])

  const memberFilterUser = useMemo(() => {
    if (!boardFilters.memberId) return null
    const boardUsers = [...(board?.owners || []), ...(board?.members || [])]
    return boardUsers.find(user => isSameId(user?._id || user?.id, boardFilters.memberId))
  }, [board?.members, board?.owners, boardFilters.memberId])

  const memberFilterName = memberFilterUser?.displayName || memberFilterUser?.username || memberFilterUser?.email

  const handleDashboardDrillDown = useCallback((filterPatch) => {
    const nextFilters = {
      ...getDefaultBoardFilters(),
      ...filterPatch
    }

    lastScrolledElementRef.current = ''
    setBoardFilters({ ...nextFilters })
    setActiveBoardView('kanban')

    updateFilterMemberQuery(nextFilters.memberId || '')
  }, [updateFilterMemberQuery])

  useEffect(() => {
    if (activeBoardView !== 'kanban' || !isFilterActive || !firstMatchedCardId) return

    const scrollKey = String(firstMatchedCardId)
    if (lastScrolledElementRef.current === scrollKey) return

    const timeoutId = setTimeout(() => {
      const targetCard = document.getElementById(`card-${firstMatchedCardId}`)
      if (!targetCard) return

      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      lastScrolledElementRef.current = scrollKey
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [activeBoardView, isFilterActive, firstMatchedCardId])

  /**
   * Func này có nhiệm vụ gọi API và xử lý khi kéo thả Column xong xuôi
   * Chỉ cần gọi API để cập nhật mảng columnOrderIds của Board chứa nó (thay đổi vị trí trong board)
   */
  const moveColumns = (dndOrderedColumns) => {
    if (!board?.owners?.some(owner => owner._id === currentUser?._id)) return

    // Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    /**
    * Trường hợp dùng Spread Operator này thì lại không sao bởi vì ở đây chúng ta không dùng push như ở trên làm thay đổi trực tiếp kiểu mở rộng mảng, mà chỉ đang gán lại toàn bộ giá trị columns và columnOrderIds bằng 2 mảng mới. Tương tự như cách làm concat ở trường hợp createNewColumn thôi :))
    */
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API update Board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  /**
   * Khi di chuyển card trong cùng Column:
   * Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng)
   */
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    // Update cho chuẩn dữ liệu state Board

    /**
    * Cannot assign to read only property 'cards' of object
    * Trường hợp Immutability ở đây đã đụng tới giá trị cards đang được coi là chỉ đọc read only - (nested object - can thiệp sâu dữ liệu)
    */
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API update Column
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  /**
   * Khi di chuyển card sang Column khác:
   * B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
   * B3: Cập nhật lại trường columnId mới của cái Card đã kéo
   * => Làm một API support riêng.
   */
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    // Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    // Tương tự đoạn xử lý chỗ hàm moveColumns nên không ảnh hưởng Redux Toolkit Immutability gì ở đây cả.
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API xử lý phía BE
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    // Xử lý vấn đề khi kéo Card cuối cùng ra khỏi Column, Column rỗng sẽ có placeholder card, cần xóa nó đi trước khi gửi dữ liệu lên cho phía BE.
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })
  }

  if (!board) {
    return <PageLoadingSpinner caption="Loading Board..." />
  }

  const isBoardOwner = board?.owners?.some(owner => owner._id === currentUser?._id)
  const filterAlertActions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {boardFilters.memberId &&
        <Button color="inherit" size="small" onClick={clearMemberFilter}>
          Clear member
        </Button>
      }
      <Button color="inherit" size="small" onClick={clearBoardFilters}>
        Clear filters
      </Button>
    </Box>
  )

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      {/* Modal Active Card, check đóng/mở dựa theo cái State isShowModalActiveCard lưu trong Redux */}
      <ActiveCard />

      {/* Các thành phần còn lại của Board Details */}
      <AppBar />
      <BoardBar
        board={board}
        activeView={activeBoardView}
        onChangeView={setActiveBoardView}
        filters={boardFilters}
        onChangeFilters={updateBoardFilters}
        onClearFilters={clearBoardFilters}
        filterActiveCount={filterActiveCount}
      />

      {isFilterActive &&
        <Alert
          severity="info"
          action={filterAlertActions}
          sx={{ borderRadius: 0 }}
        >
          {boardFilters.cardIds?.length > 0
            ? `AI Filter: ${boardFilters.cardIds.length} thẻ được lọc từ phân tích AI. `
            : boardFilters.memberId
              ? `Đang lọc công việc của ${memberFilterName || 'thành viên đã chọn'}. `
              : boardFilters.unassigned
                ? 'Đang lọc các thẻ chưa được phân công. '
                : boardFilters.lowChecklist
                  ? 'Đang lọc các thẻ có tiến độ checklist dưới 50%. '
                  : ''
          }
          Kéo thả bị tắt khi đang lọc.
        </Alert>
      }

      {isFilterActive && matchedCardsCount === 0 &&
        <Alert
          severity="warning"
          action={filterAlertActions}
          sx={{ borderRadius: 0 }}
        >
          No cards match your current filters.
        </Alert>
      }

      <Fade in={activeBoardView === 'kanban'} timeout={250}>
        <Box sx={{ display: activeBoardView === 'kanban' ? 'block' : 'none' }}>
          <BoardContent
            board={filteredBoard}
            canManageColumns={isBoardOwner}
            isDragDisabled={isFilterActive}
            // 3 cái trường hợp move dưới đây thì giữ nguyên để code xử lý kéo thả ở phần BoardContent không bị quá dài mất kiểm soát khi đọc code, maintain.
            moveColumns={moveColumns}
            moveCardInTheSameColumn={moveCardInTheSameColumn}
            moveCardToDifferentColumn={moveCardToDifferentColumn}
          />
        </Box>
      </Fade>

      <Fade in={activeBoardView === 'dashboard'} timeout={250}>
        <Box sx={{ display: activeBoardView === 'dashboard' ? 'block' : 'none' }}>
          <BoardDashboard
            boardId={board._id}
            isActive={activeBoardView === 'dashboard'}
            onDrillDown={handleDashboardDrillDown}
          />
        </Box>
      </Fade>
    </Container>
  )
}

export default Board
