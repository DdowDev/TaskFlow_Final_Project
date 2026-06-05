import OpenAI from 'openai'
import { env } from '~/config/environment'

const DEFAULT_MODEL = 'gpt-4o-mini'
const DEFAULT_TIMEOUT_MS = 15000
const MAX_BOARD_CARDS = 15
const MAX_ANALYZED_CARDS = 5
const MAX_EXISTING_CHECKLIST_ITEMS = 30

const getMode = () => (env.AI_MODE || 'mock').toLowerCase()
const getProvider = () => (env.AI_PROVIDER || 'openai').toLowerCase()
const getModel = () => env.AI_MODEL || DEFAULT_MODEL
const getTimeoutMs = () => {
  const timeout = Number(env.AI_TIMEOUT_MS)
  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS
}
const isDevMode = () => env.BUILD_MODE === 'dev' || process.env.NODE_ENV === 'development'

const getAiErrorInfo = (error) => ({
  name: error?.name || 'Error',
  message: error?.message || 'Unknown AI provider error.',
  status: error?.status || error?.code || null
})

const logAiDebug = (scope, message, data = {}) => {
  if (!isDevMode()) return

  // eslint-disable-next-line no-console
  console.log(`[AI][${scope}] ${message}`, data)
}

const toId = (value) => {
  if (!value) return ''
  if (value._id) return toId(value._id)
  return value.toString?.() || `${value}`
}

const normalizeText = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback
  return value.trim() || fallback
}

const truncateText = (value, maxLength = 240) => {
  const text = normalizeText(value)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}

const clampNumber = (value, min, max, fallback = 0) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(max, number))
}

const safeArray = (value) => Array.isArray(value) ? value : []

const getBoardUsers = (board) => {
  return [
    ...safeArray(board?.owners),
    ...safeArray(board?.members)
  ]
}

const getUserName = (user) => {
  return normalizeText(user?.displayName) ||
    normalizeText(user?.username) ||
    normalizeText(user?.email, 'Unknown member')
}

const getChecklistStats = (card) => {
  const checklists = safeArray(card?.checklists)
  const items = checklists.flatMap(checklist => safeArray(checklist?.items))
  const totalItems = items.length
  const completedItems = items.filter(item => item?.isCompleted).length
  const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : null

  return { totalItems, completedItems, progress }
}

const getCardMemberNames = (card, board) => {
  const memberIds = safeArray(card?.memberIds).map(toId).filter(Boolean)
  if (!memberIds.length) return []

  return getBoardUsers(board)
    .filter(user => memberIds.includes(toId(user)))
    .map(getUserName)
    .slice(0, 8)
}

const getCardScore = (card) => {
  let score = 0
  const now = Date.now()
  const isOpen = !['DONE', 'CANCELLED'].includes(card?.status)

  if (isOpen && card?.dueDate && card.dueDate < now) score += 10
  if (isOpen && card?.dueDate && card.dueDate >= now && card.dueDate <= now + 3 * 24 * 60 * 60 * 1000) score += 6
  if (card?.priority === 'URGENT') score += 5
  if (card?.priority === 'HIGH') score += 4
  if (isOpen && !safeArray(card?.memberIds).length) score += 2
  if (isOpen && card?.lastActivityAt && card.lastActivityAt < now - 7 * 24 * 60 * 60 * 1000) score += 2

  return score
}

const sanitizeBoardInput = ({ board, dashboard, cards }) => {
  const importantCards = safeArray(cards)
    .filter(card => card && card._destroy !== true && card.isArchived !== true)
    .map(card => ({ card, score: getCardScore(card) }))
    .sort((first, second) => second.score - first.score)
    .slice(0, MAX_BOARD_CARDS)
    .map(({ card }) => {
      const checklistStats = getChecklistStats(card)

      return {
        cardId: toId(card?._id),
        title: truncateText(card?.title, 120),
        status: card?.status || '',
        priority: card?.priority || '',
        dueDate: card?.dueDate || null,
        lastActivityAt: card?.lastActivityAt || null,
        memberNames: getCardMemberNames(card, board),
        checklistProgress: checklistStats.progress,
        checklistItems: checklistStats.totalItems
      }
    })

  return {
    board: {
      boardId: toId(board?._id),
      title: truncateText(board?.title, 120),
      description: truncateText(board?.description, 260),
      type: board?.type || ''
    },
    dashboard: {
      totalCards: dashboard?.totalCards || 0,
      completedCards: dashboard?.completedCards || 0,
      overdueCardsCount: dashboard?.overdueCardsCount || 0,
      dueSoonCardsCount: dashboard?.dueSoonCardsCount || 0,
      cardsWithoutDueDate: dashboard?.cardsWithoutDueDate || 0,
      averageChecklistProgress: dashboard?.averageChecklistProgress || 0,
      memberWorkload: safeArray(dashboard?.memberWorkload).map(item => ({
        memberId: toId(item?.memberId),
        displayName: getUserName(item),
        totalCards: Number(item?.totalCards) || 0
      })).slice(0, 20)
    },
    cards: importantCards
  }
}

const sanitizeChecklistInput = ({ card }) => {
  const existingItems = safeArray(card?.checklists)
    .flatMap(checklist => safeArray(checklist?.items).map(item => ({
      checklistTitle: truncateText(checklist?.title, 80),
      itemTitle: truncateText(item?.title, 160),
      isCompleted: Boolean(item?.isCompleted)
    })))
    .filter(item => item.itemTitle)
    .slice(0, MAX_EXISTING_CHECKLIST_ITEMS)

  return {
    card: {
      cardId: toId(card?._id),
      title: truncateText(card?.title, 140),
      description: truncateText(card?.description, 600),
      status: card?.status || '',
      priority: card?.priority || '',
      startDate: card?.startDate || null,
      dueDate: card?.dueDate || null,
      completedAt: card?.completedAt || null,
      existingChecklistItems: existingItems
    }
  }
}

const nullableString = () => ({
  anyOf: [
    { type: 'string' },
    { type: 'null' }
  ]
})

const nullableNumber = () => ({
  anyOf: [
    { type: 'number' },
    { type: 'null' }
  ]
})

const stringArray = () => ({
  type: 'array',
  items: { type: 'string' }
})

const boardAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'mode',
    'generatedAt',
    'boardId',
    'summary',
    'risks',
    'priorityRecommendations',
    'workloadInsights',
    'nextActions',
    'analyzedCards',
    'warnings'
  ],
  properties: {
    mode: { type: 'string' },
    generatedAt: { type: 'number' },
    boardId: { type: 'string' },
    summary: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'description', 'healthScore', 'healthStatus', 'keyMetrics'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        healthScore: { type: 'number' },
        healthStatus: { type: 'string' },
        keyMetrics: {
          type: 'object',
          additionalProperties: false,
          required: [
            'totalCards',
            'overdueCards',
            'dueSoonCards',
            'highPriorityOpenCards',
            'averageChecklistProgress'
          ],
          properties: {
            totalCards: { type: 'number' },
            overdueCards: { type: 'number' },
            dueSoonCards: { type: 'number' },
            highPriorityOpenCards: { type: 'number' },
            averageChecklistProgress: { type: 'number' }
          }
        }
      }
    },
    risks: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['level', 'title', 'reason', 'relatedCardIds', 'suggestedAction'],
        properties: {
          level: { type: 'string' },
          title: { type: 'string' },
          reason: { type: 'string' },
          relatedCardIds: stringArray(),
          suggestedAction: { type: 'string' }
        }
      }
    },
    priorityRecommendations: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['cardId', 'title', 'priority', 'status', 'dueDate', 'assignees', 'reason', 'suggestedNextStep'],
        properties: {
          cardId: { type: 'string' },
          title: { type: 'string' },
          priority: nullableString(),
          status: nullableString(),
          dueDate: nullableNumber(),
          assignees: stringArray(),
          reason: { type: 'string' },
          suggestedNextStep: { type: 'string' }
        }
      }
    },
    workloadInsights: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['memberId', 'displayName', 'totalCards', 'riskLevel', 'reason', 'suggestedAction'],
        properties: {
          memberId: { type: 'string' },
          displayName: { type: 'string' },
          totalCards: { type: 'number' },
          riskLevel: { type: 'string' },
          reason: { type: 'string' },
          suggestedAction: { type: 'string' }
        }
      }
    },
    nextActions: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'reason', 'priority'],
        properties: {
          label: { type: 'string' },
          reason: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    },
    analyzedCards: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['cardId', 'title', 'status', 'priority', 'dueDate', 'lastActivityAt', 'assignees', 'checklistProgress', 'checklistItems'],
        properties: {
          cardId: { type: 'string' },
          title: { type: 'string' },
          status: nullableString(),
          priority: nullableString(),
          dueDate: nullableNumber(),
          lastActivityAt: nullableNumber(),
          assignees: stringArray(),
          checklistProgress: nullableNumber(),
          checklistItems: { type: 'number' }
        }
      }
    },
    warnings: stringArray()
  }
}

const checklistSuggestionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['mode', 'generatedAt', 'cardId', 'checklistTitle', 'items', 'confidence', 'notes'],
  properties: {
    mode: { type: 'string' },
    generatedAt: { type: 'number' },
    cardId: { type: 'string' },
    checklistTitle: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'reason'],
        properties: {
          title: { type: 'string' },
          reason: { type: 'string' }
        }
      }
    },
    confidence: { type: 'string' },
    notes: stringArray()
  }
}

const assertCanUseOpenAI = () => {
  if (getMode() !== 'real') return false
  if (getProvider() !== 'openai') {
    throw new Error('Unsupported AI provider.')
  }
  if (!env.AI_API_KEY) {
    throw new Error('OpenAI API key is missing.')
  }
  return true
}

const createClient = () => new OpenAI({ apiKey: env.AI_API_KEY })

const callOpenAIJson = async ({ scope, instructions, input, schema, schemaName, maxOutputTokens = 1800 }) => {
  const payload = JSON.stringify(input)
  logAiDebug(scope, 'request', {
    model: getModel(),
    timeoutMs: getTimeoutMs(),
    boardId: input?.board?.boardId,
    cardId: input?.card?.cardId,
    payloadChars: payload.length,
    cards: safeArray(input?.cards).length,
    schemaName
  })

  try {
    const response = await createClient().responses.create({
      model: getModel(),
      instructions,
      input: payload,
      max_output_tokens: maxOutputTokens,
      temperature: 0.2,
      text: {
        format: {
          type: 'json_schema',
          name: schemaName,
          strict: true,
          schema
        }
      }
    }, { timeout: getTimeoutMs() })

    const outputText = response.output_text
    if (!outputText) {
      throw new Error('OpenAI returned an empty response.')
    }

    logAiDebug(scope, 'response', {
      outputChars: outputText.length
    })

    try {
      return JSON.parse(outputText)
    } catch (error) {
      throw new Error('OpenAI returned invalid JSON.')
    }
  } catch (error) {
    logAiDebug(scope, 'fallbackReason', getAiErrorInfo(error))
    throw error
  }
}

const normalizeStringArray = (value) => safeArray(value)
  .map(item => normalizeText(item))
  .filter(Boolean)

const normalizeBoardAnalysisResponse = ({ result, board, dashboard, cards }) => {
  const sanitizedInput = sanitizeBoardInput({ board, dashboard, cards })
  const boardId = sanitizedInput.board.boardId
  const now = Date.now()
  const summary = result?.summary || {}
  const healthScore = clampNumber(summary.healthScore, 0, 100, 70)
  const healthStatus = normalizeText(summary.healthStatus, healthScore < 50 ? 'critical' : healthScore < 75 ? 'warning' : 'good')

  return {
    mode: 'real',
    generatedAt: now,
    boardId,
    summary: {
      title: truncateText(summary.title, 140) || 'Phân tích board',
      description: truncateText(summary.description, 420) || 'AI đã phân tích tình trạng board dựa trên dữ liệu hiện tại.',
      healthScore,
      healthStatus,
      keyMetrics: {
        totalCards: Number(summary.keyMetrics?.totalCards) || sanitizedInput.dashboard.totalCards,
        overdueCards: Number(summary.keyMetrics?.overdueCards) || sanitizedInput.dashboard.overdueCardsCount,
        dueSoonCards: Number(summary.keyMetrics?.dueSoonCards) || sanitizedInput.dashboard.dueSoonCardsCount,
        highPriorityOpenCards: Number(summary.keyMetrics?.highPriorityOpenCards) || 0,
        averageChecklistProgress: Number(summary.keyMetrics?.averageChecklistProgress) || sanitizedInput.dashboard.averageChecklistProgress
      }
    },
    risks: safeArray(result?.risks).map(item => ({
      level: normalizeText(item?.level, 'medium'),
      title: truncateText(item?.title, 140) || 'Rủi ro cần xem xét',
      reason: truncateText(item?.reason, 420),
      relatedCardIds: normalizeStringArray(item?.relatedCardIds).slice(0, 8),
      suggestedAction: truncateText(item?.suggestedAction, 300)
    })).filter(item => item.title || item.reason).slice(0, 3),
    priorityRecommendations: safeArray(result?.priorityRecommendations).map(item => ({
      cardId: normalizeText(item?.cardId),
      title: truncateText(item?.title, 140) || 'Card cần ưu tiên',
      priority: item?.priority || null,
      status: item?.status || null,
      dueDate: item?.dueDate || null,
      assignees: normalizeStringArray(item?.assignees).slice(0, 6),
      reason: truncateText(item?.reason, 420),
      suggestedNextStep: truncateText(item?.suggestedNextStep, 300)
    })).filter(item => item.cardId || item.title).slice(0, 3),
    workloadInsights: safeArray(result?.workloadInsights).map(item => ({
      memberId: normalizeText(item?.memberId),
      displayName: truncateText(item?.displayName, 100) || 'Thành viên',
      totalCards: Number(item?.totalCards) || 0,
      riskLevel: normalizeText(item?.riskLevel, 'low'),
      reason: truncateText(item?.reason, 360),
      suggestedAction: truncateText(item?.suggestedAction, 260)
    })).slice(0, 3),
    nextActions: safeArray(result?.nextActions).map(item => ({
      label: truncateText(item?.label, 120) || 'Cập nhật board',
      reason: truncateText(item?.reason, 360),
      priority: normalizeText(item?.priority, 'medium')
    })).filter(item => item.label).slice(0, 3),
    analyzedCards: safeArray(result?.analyzedCards).map(item => ({
      cardId: normalizeText(item?.cardId),
      title: truncateText(item?.title, 120) || 'Untitled card',
      status: item?.status || null,
      priority: item?.priority || null,
      dueDate: item?.dueDate || null,
      lastActivityAt: item?.lastActivityAt || null,
      assignees: normalizeStringArray(item?.assignees).slice(0, 6),
      checklistProgress: item?.checklistProgress ?? null,
      checklistItems: Number(item?.checklistItems) || 0
    })).filter(item => item.cardId).slice(0, MAX_ANALYZED_CARDS),
    warnings: normalizeStringArray(result?.warnings).slice(0, 8)
  }
}

const normalizeChecklistSuggestionResponse = ({ result, card }) => {
  const now = Date.now()
  const items = safeArray(result?.items).map(item => ({
    title: truncateText(item?.title, 200),
    reason: truncateText(item?.reason, 260)
  })).filter(item => item.title).slice(0, 8)

  if (!items.length) {
    throw new Error('OpenAI checklist suggestion did not include valid items.')
  }

  return {
    mode: 'real',
    generatedAt: now,
    cardId: toId(card?._id),
    checklistTitle: truncateText(result?.checklistTitle, 100) || 'Checklist gợi ý bởi AI',
    items,
    confidence: normalizeText(result?.confidence, 'medium'),
    notes: normalizeStringArray(result?.notes).slice(0, 4)
  }
}

const boardInstructions = `
Bạn là AI Assistant của TaskFlow, một hệ thống quản lý công việc Kanban.
Hãy phân tích dữ liệu board bằng tiếng Việt, ngắn gọn, có tính hành động.
Không chỉ đọc lại số liệu dashboard. Hãy nêu rủi ro, lý do, card cần ưu tiên, workload và hành động tiếp theo.
Không bịa cardId/memberId ngoài dữ liệu đầu vào. Nếu thiếu dữ liệu, thêm cảnh báo phù hợp.
Giới hạn kết quả: risks tối đa 3, priorityRecommendations tối đa 3, workloadInsights tối đa 3, nextActions tối đa 3, analyzedCards tối đa 5.
Mỗi title/reason/action cần ngắn gọn, ưu tiên insight quan trọng nhất.
Chỉ trả về JSON đúng schema.
`

const checklistInstructions = `
Bạn là AI Assistant của TaskFlow.
Hãy gợi ý checklist bằng tiếng Việt cho card/task dựa trên title, description, status, priority, due date và checklist hiện có.
Sinh 5-8 checklist item cụ thể, ngắn, có thể áp dụng thật. Tránh trùng với checklist item hiện có.
Mỗi item phải có title và reason. Chỉ trả về JSON đúng schema.
`

const generateBoardAnalysis = async ({ board, dashboard, cards }) => {
  if (!assertCanUseOpenAI()) return null

  const input = sanitizeBoardInput({ board, dashboard, cards })
  const result = await callOpenAIJson({
    scope: 'BoardAnalysis',
    instructions: boardInstructions,
    input,
    schema: boardAnalysisSchema,
    schemaName: 'taskflow_board_analysis',
    maxOutputTokens: 1500
  })

  return normalizeBoardAnalysisResponse({ result, board, dashboard, cards })
}

const generateChecklistSuggestions = async ({ card }) => {
  if (!assertCanUseOpenAI()) return null

  const input = sanitizeChecklistInput({ card })
  const result = await callOpenAIJson({
    scope: 'ChecklistSuggestions',
    instructions: checklistInstructions,
    input,
    schema: checklistSuggestionSchema,
    schemaName: 'taskflow_checklist_suggestion',
    maxOutputTokens: 1400
  })

  return normalizeChecklistSuggestionResponse({ result, card })
}

export const aiProvider = {
  getMode,
  generateBoardAnalysis,
  generateChecklistSuggestions
}
