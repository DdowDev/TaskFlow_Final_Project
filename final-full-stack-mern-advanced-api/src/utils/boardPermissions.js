const normalizeId = (id) => id?.toString?.() || `${id}`

const hasId = (ids = [], userId) => {
  const normalizedUserId = normalizeId(userId)
  return ids.some(id => normalizeId(id) === normalizedUserId)
}

export const isBoardOwner = (userId, board) => {
  if (!userId || !board) return false
  return hasId(board.ownerIds, userId)
}

export const isBoardMember = (userId, board) => {
  if (!userId || !board) return false
  return hasId(board.memberIds, userId)
}

export const isBoardOwnerOrMember = (userId, board) => {
  return isBoardOwner(userId, board) || isBoardMember(userId, board)
}

export const boardPermissions = {
  isBoardOwner,
  isBoardMember,
  isBoardOwnerOrMember
}
