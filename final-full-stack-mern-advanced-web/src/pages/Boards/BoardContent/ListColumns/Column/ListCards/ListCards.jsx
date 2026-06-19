import Box from '@mui/material/Box'
import Card from './Card/Card'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

function ListCards({ cards, isDragDisabled = false }) {
  return (
    <SortableContext items={cards?.map(c => c._id)} strategy={verticalListSortingStrategy}>
      <Box sx={{
        p: '0 5px 5px 5px',
        m: '0 5px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflowX: 'hidden',
        overflowY: 'auto',
        maxHeight: (theme) => `calc(
          ${theme.trello.boardContentHeight} -
          ${theme.spacing(5)} -
          ${theme.trello.columnHeaderHeight} -
          ${theme.trello.columnFooterHeight}
        )`,
        '&::-webkit-scrollbar': { width: '5px' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(255,255,255,0.32)' }
      }}>
        {cards?.map(card => <Card key={card._id} card={card} isDragDisabled={isDragDisabled} />)}
      </Box>
    </SortableContext>
  )
}

export default ListCards
