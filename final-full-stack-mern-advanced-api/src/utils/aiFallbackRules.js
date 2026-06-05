import { CARD_PRIORITIES, CARD_STATUSES } from '~/utils/constants'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const DUE_SOON_DAYS = 3
const STALE_ACTIVITY_DAYS = 7
const HIGH_PRIORITY_VALUES = [CARD_PRIORITIES.HIGH, CARD_PRIORITIES.URGENT]

const toId = (value) => {
  if (!value) return null
  if (value._id) return toId(value._id)
  return value.toString?.() || `${value}`
}

const normalizeText = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback
  return value.trim() || fallback
}

const truncateText = (value, maxLength = 180) => {
  const text = normalizeText(value)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}

const getCardMemberIds = (card) => {
  if (!Array.isArray(card?.memberIds)) return []
  return card.memberIds.map(toId).filter(Boolean)
}

const getBoardUsers = (board) => {
  const owners = Array.isArray(board?.owners) ? board.owners : []
  const members = Array.isArray(board?.members) ? board.members : []
  return [...owners, ...members]
}

const getUserDisplayName = (user) => {
  return normalizeText(user?.displayName) || normalizeText(user?.username) || normalizeText(user?.email, 'Unknown member')
}

const getChecklistStats = (card) => {
  const checklists = Array.isArray(card?.checklists) ? card.checklists : []
  const items = checklists.flatMap(checklist => Array.isArray(checklist?.items) ? checklist.items : [])
  const totalItems = items.length
  const completedItems = items.filter(item => item?.isCompleted).length
  const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : null

  return { totalItems, completedItems, progress }
}

const getAssigneeNames = (card, board) => {
  const memberIds = getCardMemberIds(card)
  if (!memberIds.length) return []

  return getBoardUsers(board)
    .filter(user => memberIds.includes(toId(user)))
    .map(getUserDisplayName)
}

const sanitizeCard = (card, board) => {
  const checklistStats = getChecklistStats(card)
  return {
    cardId: toId(card?._id),
    title: normalizeText(card?.title, 'Untitled card'),
    status: card?.status || null,
    priority: card?.priority || null,
    dueDate: card?.dueDate || null,
    lastActivityAt: card?.lastActivityAt || null,
    assignees: getAssigneeNames(card, board),
    checklistProgress: checklistStats.progress,
    checklistItems: checklistStats.totalItems
  }
}

const isActiveCard = (card) => {
  return card && card._destroy !== true && card.isArchived !== true
}

const isOpenWork = (card) => {
  return ![CARD_STATUSES.DONE, CARD_STATUSES.CANCELLED].includes(card?.status)
}

const isOverdue = (card, now) => {
  return Boolean(card?.dueDate && card.dueDate < now && isOpenWork(card))
}

const isDueSoon = (card, now) => {
  const dueSoonLimit = now + (DUE_SOON_DAYS * DAY_IN_MS)
  return Boolean(card?.dueDate && card.dueDate >= now && card.dueDate <= dueSoonLimit && isOpenWork(card))
}

const isHighPriorityOpen = (card) => {
  return HIGH_PRIORITY_VALUES.includes(card?.priority) && isOpenWork(card)
}

const isStale = (card, now) => {
  if (!isOpenWork(card) || !card?.lastActivityAt) return false
  return card.lastActivityAt < now - (STALE_ACTIVITY_DAYS * DAY_IN_MS)
}

const getPriorityWeight = (priority) => {
  if (priority === CARD_PRIORITIES.URGENT) return 4
  if (priority === CARD_PRIORITIES.HIGH) return 3
  if (priority === CARD_PRIORITIES.MEDIUM) return 2
  return 1
}

const calculateHealth = ({ totalCards, overdueCards, dueSoonCards, highPriorityCards, lowChecklistCards, staleCards, workloadImbalance }) => {
  if (!totalCards) return { healthScore: 100, healthStatus: 'good' }

  let score = 100
  score -= Math.min(overdueCards.length * 10, 30)
  score -= Math.min(highPriorityCards.length * 6, 24)
  score -= Math.min(dueSoonCards.length * 3, 15)
  score -= Math.min(lowChecklistCards.length * 4, 12)
  score -= Math.min(staleCards.length * 4, 12)
  if (workloadImbalance) score -= 10

  const healthScore = Math.max(score, 0)
  let healthStatus = 'good'
  if (healthScore < 50) healthStatus = 'critical'
  else if (healthScore < 75) healthStatus = 'warning'

  return { healthScore, healthStatus }
}

const buildRisk = ({ level, title, reason, relatedCards = [], suggestedAction }) => ({
  level,
  title,
  reason,
  relatedCardIds: relatedCards.map(card => toId(card?._id)).filter(Boolean).slice(0, 8),
  suggestedAction
})

const buildRecommendation = (card, board, now) => {
  const reasons = []
  if (isOverdue(card, now)) reasons.push('the card is overdue')
  if (isDueSoon(card, now)) reasons.push(`the card is due within ${DUE_SOON_DAYS} days`)
  if (HIGH_PRIORITY_VALUES.includes(card?.priority)) reasons.push(`priority is ${card.priority}`)
  if (!getCardMemberIds(card).length) reasons.push('no member is assigned')
  if (isStale(card, now)) reasons.push(`there has been no activity for more than ${STALE_ACTIVITY_DAYS} days`)

  return {
    cardId: toId(card._id),
    title: normalizeText(card.title, 'Untitled card'),
    priority: card.priority || null,
    status: card.status || null,
    dueDate: card.dueDate || null,
    assignees: getAssigneeNames(card, board),
    reason: `This task should be reviewed because ${reasons.join(', ')}.`,
    suggestedNextStep: getCardMemberIds(card).length
      ? 'Confirm the next owner action and update the card status.'
      : 'Assign a responsible member and clarify the next action.'
  }
}

const buildWorkloadInsights = (dashboard) => {
  const workload = Array.isArray(dashboard?.memberWorkload) ? dashboard.memberWorkload : []
  if (!workload.length) return []

  const total = workload.reduce((sum, item) => sum + (Number(item?.totalCards) || 0), 0)
  const average = total / workload.length
  const maxWorkload = Math.max(...workload.map(item => Number(item?.totalCards) || 0))

  return workload.map(item => {
    const totalCards = Number(item?.totalCards) || 0
    let riskLevel = 'low'
    let suggestedAction = 'Workload looks balanced.'
    let reason = `${getUserDisplayName(item)} is assigned to ${totalCards} active card(s).`

    if (totalCards === maxWorkload && totalCards >= Math.max(3, average + 2)) {
      riskLevel = 'medium'
      reason = `${getUserDisplayName(item)} has the highest workload with ${totalCards} active card(s), above the board average.`
      suggestedAction = 'Review whether some cards should be reassigned or clarified.'
    }

    return {
      memberId: toId(item?.memberId),
      displayName: getUserDisplayName(item),
      totalCards,
      riskLevel,
      reason,
      suggestedAction
    }
  })
}

export const buildBoardAnalysisByRules = ({ board, dashboard, cards, mode = 'fallback' }) => {
  const now = Date.now()
  const activeCards = (Array.isArray(cards) ? cards : []).filter(isActiveCard)
  const overdueCards = activeCards.filter(card => isOverdue(card, now))
  const dueSoonCards = activeCards.filter(card => isDueSoon(card, now))
  const highPriorityCards = activeCards.filter(isHighPriorityOpen)
  const lowChecklistCards = activeCards.filter(card => {
    const stats = getChecklistStats(card)
    return stats.totalItems > 0 && stats.progress < 50 && isOpenWork(card)
  })
  const staleCards = activeCards.filter(card => isStale(card, now))
  const workloadInsights = buildWorkloadInsights(dashboard)
  const workloadImbalance = workloadInsights.some(item => item.riskLevel !== 'low')
  const { healthScore, healthStatus } = calculateHealth({
    totalCards: activeCards.length,
    overdueCards,
    dueSoonCards,
    highPriorityCards,
    lowChecklistCards,
    staleCards,
    workloadImbalance
  })

  const risks = []
  const overdueHighPriority = overdueCards.filter(card => HIGH_PRIORITY_VALUES.includes(card?.priority))
  if (overdueHighPriority.length) {
    risks.push(buildRisk({
      level: 'high',
      title: 'Overdue high-priority work',
      reason: 'There are overdue cards with HIGH or URGENT priority that are not completed.',
      relatedCards: overdueHighPriority,
      suggestedAction: 'Review these cards first and confirm who owns the next action.'
    }))
  } else if (overdueCards.length) {
    risks.push(buildRisk({
      level: 'medium',
      title: 'Overdue work exists',
      reason: 'Some active cards are past their due date.',
      relatedCards: overdueCards,
      suggestedAction: 'Update due dates or move blocked work back into focus.'
    }))
  }

  if (dueSoonCards.length) {
    risks.push(buildRisk({
      level: 'medium',
      title: 'Upcoming deadline pressure',
      reason: `Some active cards are due within ${DUE_SOON_DAYS} days.`,
      relatedCards: dueSoonCards,
      suggestedAction: 'Confirm progress before these cards become overdue.'
    }))
  }

  if (lowChecklistCards.length) {
    risks.push(buildRisk({
      level: 'medium',
      title: 'Low checklist progress',
      reason: 'Some active cards have checklist progress below 50%.',
      relatedCards: lowChecklistCards,
      suggestedAction: 'Break down these cards further or remove blockers.'
    }))
  }

  if (staleCards.length) {
    risks.push(buildRisk({
      level: 'low',
      title: 'Stale active work',
      reason: `Some active cards have had no activity for more than ${STALE_ACTIVITY_DAYS} days.`,
      relatedCards: staleCards,
      suggestedAction: 'Ask assignees for an update or re-prioritize these cards.'
    }))
  }

  if (workloadImbalance) {
    risks.push({
      level: 'medium',
      title: 'Workload imbalance',
      reason: 'One or more members have noticeably more active cards than the rest of the team.',
      relatedCardIds: [],
      suggestedAction: 'Review assignments and redistribute work if needed.'
    })
  }

  const scoredCards = activeCards
    .filter(isOpenWork)
    .map(card => {
      let score = getPriorityWeight(card.priority)
      if (isOverdue(card, now)) score += 8
      if (isDueSoon(card, now)) score += 4
      if (isHighPriorityOpen(card)) score += 3
      if (!getCardMemberIds(card).length) score += 2
      if (isStale(card, now)) score += 2
      return { card, score }
    })
    .sort((first, second) => second.score - first.score)

  const priorityRecommendations = scoredCards
    .slice(0, 5)
    .map(item => buildRecommendation(item.card, board, now))

  const nextActions = []
  if (overdueCards.length) {
    nextActions.push({
      label: 'Resolve overdue cards',
      reason: 'Overdue active cards are the clearest delivery risk.',
      priority: 'high'
    })
  }
  if (dueSoonCards.length) {
    nextActions.push({
      label: 'Check cards due soon',
      reason: `Cards due within ${DUE_SOON_DAYS} days need progress confirmation.`,
      priority: 'medium'
    })
  }
  if (workloadImbalance) {
    nextActions.push({
      label: 'Review member workload',
      reason: 'Unbalanced assignments can slow down delivery or create hidden blockers.',
      priority: 'medium'
    })
  }
  if (!nextActions.length) {
    nextActions.push({
      label: 'Keep the board updated',
      reason: 'No major risk was detected, so maintaining status, due dates, and checklist progress is the next best action.',
      priority: 'low'
    })
  }

  const warnings = []
  if (!activeCards.length) warnings.push('No active cards were found for this board.')
  if ((dashboard?.totalCards || 0) !== activeCards.length) {
    warnings.push('Dashboard totals may exclude archived or destroyed cards.')
  }

  return {
    mode,
    generatedAt: now,
    boardId: toId(board?._id),
    summary: {
      title: healthStatus === 'critical'
        ? 'Board needs immediate attention'
        : healthStatus === 'warning'
          ? 'Board has risks to review'
          : 'Board is in a healthy state',
      description: activeCards.length
        ? `This board has ${activeCards.length} active card(s), ${overdueCards.length} overdue card(s), and ${dueSoonCards.length} card(s) due soon.`
        : 'This board currently has no active cards to analyze.',
      healthScore,
      healthStatus,
      keyMetrics: {
        totalCards: dashboard?.totalCards || activeCards.length,
        overdueCards: overdueCards.length,
        dueSoonCards: dueSoonCards.length,
        highPriorityOpenCards: highPriorityCards.length,
        averageChecklistProgress: dashboard?.averageChecklistProgress || 0
      }
    },
    risks,
    priorityRecommendations,
    workloadInsights,
    nextActions,
    analyzedCards: activeCards.map(card => sanitizeCard(card, board)).slice(0, 30),
    warnings
  }
}

const addUniqueSuggestion = (items, title, reason) => {
  const safeTitle = truncateText(title, 200)
  if (!safeTitle || items.some(item => item.title.toLowerCase() === safeTitle.toLowerCase())) return

  items.push({
    title: safeTitle,
    reason: truncateText(reason, 240)
  })
}

export const buildChecklistSuggestionsByRules = ({ card, mode = 'fallback' }) => {
  const now = Date.now()
  const title = normalizeText(card?.title, 'Untitled task')
  const description = normalizeText(card?.description)
  const items = []

  addUniqueSuggestion(
    items,
    'Clarify acceptance criteria',
    description
      ? 'The task has a description, but clear acceptance criteria help define when it is done.'
      : 'The task has no detailed description, so acceptance criteria should be clarified first.'
  )

  if (HIGH_PRIORITY_VALUES.includes(card?.priority)) {
    addUniqueSuggestion(
      items,
      'Confirm priority and deadline with the owner',
      `The task priority is ${card.priority}, so scope and deadline should be confirmed before execution.`
    )
  }

  if (card?.dueDate) {
    addUniqueSuggestion(
      items,
      card.dueDate < now ? 'Review overdue reason and new target date' : 'Plan work before the due date',
      card.dueDate < now
        ? 'The due date has passed, so the team should record why and agree on a realistic next date.'
        : 'The task has a due date, so the team should plan the next steps before the deadline.'
    )
  }

  if ([CARD_STATUSES.TODO, CARD_STATUSES.IN_PROGRESS].includes(card?.status)) {
    addUniqueSuggestion(
      items,
      'Implement the main task outcome',
      'This is the core work needed to move the task toward completion.'
    )
  }

  addUniqueSuggestion(
    items,
    'Test and verify the result',
    'Verification reduces the chance of marking incomplete work as done.'
  )

  addUniqueSuggestion(
    items,
    'Update card status and notes',
    'Keeping status and notes updated helps the board dashboard and team members stay accurate.'
  )

  if (card?.status === CARD_STATUSES.DONE) {
    addUniqueSuggestion(
      items,
      'Review completion evidence',
      'The card is already marked done, so evidence and final notes should be checked.'
    )
  }

  const checklistTitle = truncateText(`AI checklist: ${title}`, 100)

  return {
    mode,
    generatedAt: now,
    cardId: toId(card?._id),
    checklistTitle,
    items: items.slice(0, 8),
    confidence: description || card?.dueDate || HIGH_PRIORITY_VALUES.includes(card?.priority) ? 'medium' : 'low',
    notes: [
      'Review suggestions before applying them to the real card.',
      'Suggestions are generated from card title, description, priority, status, and due date.'
    ]
  }
}
