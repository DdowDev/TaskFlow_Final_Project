import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { mapOrder } from '~/utils/sorts'
import { isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

// Khởi tạo giá trị State của một cái Slice trong redux
const initialState = {
  currentActiveBoard: null
}

// Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
// https://redux-toolkit.js.org/api/createAsyncThunk
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
    return response.data
  }
)

// Khởi tạo một cái Slice trong kho lưu trữ - Redux Store
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Lưu ý luôn là ở đây luôn luôn cần cặp ngoặc nhọn cho function trong reducer cho dù code bên trong chỉ có 1 dòng, đây là rule của Redux
    // https://redux-toolkit.js.org/usage/immer-reducers#mutating-and-returning-state
    updateCurrentActiveBoard: (state, action) => {
      // action.payload là chuẩn đặt tên nhận dữ liệu vào reducer, ở đây chúng ta gán nó ra một biến có nghĩa hơn
      const board = action.payload

      // Xử lý dữ liệu nếu cần thiết...
      // ...

      // Update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    },
    updateCardInBoard: (state, action) => {
      const incomingCard = action.payload
      if (!state.currentActiveBoard) return

      if (!Array.isArray(state.currentActiveBoard.archivedCards)) {
        state.currentActiveBoard.archivedCards = []
      }

      if (incomingCard.isArchived) {
        const column = state.currentActiveBoard.columns.find(i => i._id === incomingCard.columnId)
        if (column) {
          column.cards = column.cards.filter(c => c._id !== incomingCard._id)
          column.cardOrderIds = column.cardOrderIds.filter(id => id !== incomingCard._id)

          if (column.cards.length === 0) {
            const placeholder = generatePlaceholderCard(column)
            column.cards = [placeholder]
            column.cardOrderIds = [placeholder._id]
          }
        }

        const alreadyArchived = state.currentActiveBoard.archivedCards.some(c => c._id === incomingCard._id)
        if (!alreadyArchived) {
          state.currentActiveBoard.archivedCards.push(incomingCard)
        } else {
          state.currentActiveBoard.archivedCards = state.currentActiveBoard.archivedCards.map(c =>
            c._id === incomingCard._id ? { ...c, ...incomingCard } : c
          )
        }
      } else {
        state.currentActiveBoard.archivedCards = state.currentActiveBoard.archivedCards.filter(c => c._id !== incomingCard._id)

        const column = state.currentActiveBoard.columns.find(i => i._id === incomingCard.columnId)
        if (column) {
          column.cards = column.cards.filter(c => !c.FE_PlaceholderCard)
          column.cardOrderIds = column.cardOrderIds.filter(id => !id.toString().includes('placeholder'))

          const existingCardIndex = column.cards.findIndex(c => c._id === incomingCard._id)
          if (existingCardIndex !== -1) {
            Object.keys(incomingCard).forEach(key => {
              column.cards[existingCardIndex][key] = incomingCard[key]
            })
          } else {
            column.cards.push(incomingCard)
            if (!column.cardOrderIds.includes(incomingCard._id)) {
              column.cardOrderIds.push(incomingCard._id)
            }
            column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
          }
        }
      }
    },
    clearCurrentActiveBoard: (state) => {
      state.currentActiveBoard = null
    }
  },
  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // action.payload ở dây chính là cái response.data trả về ở trên
      let board = action.payload

      // Thành viên trong cái board sẽ là gộp lại của 2 mảng owners và members
      board.FE_allUsers = board.owners.concat(board.members)

      // Sắp xếp thứ tự các column luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        // Khi f5 trang web thì cần xử lý vấn đề kéo thả vào một column rỗng
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          // Sắp xếp thứ tự các cards luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      // Update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    })
  }
})

// Action creators are generated for each case reducer function
// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
export const { updateCurrentActiveBoard, updateCardInBoard, clearCurrentActiveBoard } = activeBoardSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

// Cái file này tên là activeBoardSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer, mọi người lưu ý :D
// export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer
