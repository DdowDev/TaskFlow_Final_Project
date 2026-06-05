import { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Pagination from '@mui/material/Pagination'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import { alpha } from '@mui/material/styles'

import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { fetchCardActivitiesAPI } from '~/apis'

const ACTIVITY_TAB = {
  COMMENTS: 'comments',
  SYSTEM_LOG: 'systemLog'
}

const COMMENTS_PER_PAGE = 5
const SYSTEM_LOGS_PER_PAGE = 5

const ACTIVITY_ACTIONS = {
  CARD_CREATED: 'CARD_CREATED',
  CARD_MOVED: 'CARD_MOVED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  DATES_CHANGED: 'DATES_CHANGED',
  COMMENT_CREATED: 'COMMENT_CREATED',
  COVER_UPDATED: 'COVER_UPDATED',
  CHECKLIST_CREATED: 'CHECKLIST_CREATED',
  CHECKLIST_RENAMED: 'CHECKLIST_RENAMED',
  CHECKLIST_DELETED: 'CHECKLIST_DELETED',
  CHECKLIST_ITEM_CREATED: 'CHECKLIST_ITEM_CREATED',
  CHECKLIST_ITEM_RENAMED: 'CHECKLIST_ITEM_RENAMED',
  CHECKLIST_ITEM_COMPLETED: 'CHECKLIST_ITEM_COMPLETED',
  CHECKLIST_ITEM_UNCOMPLETED: 'CHECKLIST_ITEM_UNCOMPLETED',
  CHECKLIST_ITEM_DELETED: 'CHECKLIST_ITEM_DELETED',
  MEMBER_JOINED: 'MEMBER_JOINED',
  MEMBER_LEFT: 'MEMBER_LEFT'
}

const formatDateValue = (value) => {
  if (!value) return 'none'
  return moment(value).format('ll')
}

const formatActivityMessage = (action, metadata = {}) => {
  switch (action) {
  case ACTIVITY_ACTIONS.CARD_CREATED:
    return `created this card${metadata?.cardTitle ? ` "${metadata.cardTitle}"` : ''}`
  case ACTIVITY_ACTIONS.CARD_MOVED:
    return `moved this card from ${metadata?.fromColumnTitle || 'a column'} to ${metadata?.toColumnTitle || 'another column'}`
  case ACTIVITY_ACTIONS.STATUS_CHANGED:
    return `changed status from ${metadata?.from || 'none'} to ${metadata?.to || 'none'}`
  case ACTIVITY_ACTIONS.PRIORITY_CHANGED:
    return `changed priority from ${metadata?.from || 'none'} to ${metadata?.to || 'none'}`
  case ACTIVITY_ACTIONS.DATES_CHANGED:
    return `changed dates from ${formatDateValue(metadata?.startDate?.from)} - ${formatDateValue(metadata?.dueDate?.from)} to ${formatDateValue(metadata?.startDate?.to)} - ${formatDateValue(metadata?.dueDate?.to)}`
  case ACTIVITY_ACTIONS.COVER_UPDATED:
    return metadata?.hasCover ? 'updated the cover' : 'removed the cover'
  case ACTIVITY_ACTIONS.CHECKLIST_CREATED:
    return `created checklist "${metadata?.checklistTitle || 'Untitled checklist'}"`
  case ACTIVITY_ACTIONS.CHECKLIST_RENAMED:
    return `renamed checklist from "${metadata?.fromTitle || 'Untitled checklist'}" to "${metadata?.toTitle || 'Untitled checklist'}"`
  case ACTIVITY_ACTIONS.CHECKLIST_DELETED:
    return `deleted checklist "${metadata?.checklistTitle || 'Untitled checklist'}"`
  case ACTIVITY_ACTIONS.CHECKLIST_ITEM_CREATED:
    return `added checklist item "${metadata?.itemTitle || 'Untitled item'}"`
  case ACTIVITY_ACTIONS.CHECKLIST_ITEM_RENAMED:
    return `renamed checklist item from "${metadata?.fromTitle || 'Untitled item'}" to "${metadata?.toTitle || 'Untitled item'}"`
  case ACTIVITY_ACTIONS.CHECKLIST_ITEM_COMPLETED:
    return `completed checklist item "${metadata?.itemTitle || 'Untitled item'}"`
  case ACTIVITY_ACTIONS.CHECKLIST_ITEM_UNCOMPLETED:
    return `marked checklist item "${metadata?.itemTitle || 'Untitled item'}" incomplete`
  case ACTIVITY_ACTIONS.CHECKLIST_ITEM_DELETED:
    return `deleted checklist item "${metadata?.itemTitle || 'Untitled item'}"`
  case ACTIVITY_ACTIONS.MEMBER_JOINED:
    return `added ${metadata?.memberDisplayName || metadata?.memberEmail || 'a member'} to this card`
  case ACTIVITY_ACTIONS.MEMBER_LEFT:
    return `removed ${metadata?.memberDisplayName || metadata?.memberEmail || 'a member'} from this card`
  default:
    return 'performed an action'
  }
}

const getSystemLogs = (activityLogs = []) => {
  return activityLogs.filter(log => log?.action !== ACTIVITY_ACTIONS.COMMENT_CREATED)
}

const getActivityIcon = (action) => {
  if (action === ACTIVITY_ACTIONS.STATUS_CHANGED || action === ACTIVITY_ACTIONS.PRIORITY_CHANGED) return TuneOutlinedIcon
  if (action === ACTIVITY_ACTIONS.DATES_CHANGED) return EventOutlinedIcon
  if (action?.includes('CHECKLIST')) return TaskAltOutlinedIcon
  if (action?.includes('MEMBER')) return GroupOutlinedIcon
  if (action === ACTIVITY_ACTIONS.CARD_MOVED) return CompareArrowsOutlinedIcon
  if (action === ACTIVITY_ACTIONS.COVER_UPDATED) return ImageOutlinedIcon
  return HistoryOutlinedIcon
}

const getActivityVisual = (theme, action) => {
  if (action === ACTIVITY_ACTIONS.STATUS_CHANGED || action === ACTIVITY_ACTIONS.PRIORITY_CHANGED) {
    return {
      color: theme.palette.info.main,
      backgroundColor: alpha(theme.palette.info.main, 0.08)
    }
  }

  if (action === ACTIVITY_ACTIONS.DATES_CHANGED) {
    return {
      color: theme.palette.secondary.main,
      backgroundColor: alpha(theme.palette.secondary.main, 0.08)
    }
  }

  if (action?.includes('CHECKLIST')) {
    return {
      color: theme.palette.warning.main,
      backgroundColor: alpha(theme.palette.warning.main, 0.08)
    }
  }

  if (action?.includes('MEMBER')) {
    return {
      color: theme.palette.success.main,
      backgroundColor: alpha(theme.palette.success.main, 0.08)
    }
  }

  if (action === ACTIVITY_ACTIONS.CARD_MOVED) {
    return {
      color: theme.palette.info.main,
      backgroundColor: alpha(theme.palette.info.main, 0.08)
    }
  }

  if (action === ACTIVITY_ACTIONS.COVER_UPDATED) {
    return {
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.action.hover
    }
  }

  return {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.action.hover
  }
}

function CardActivitySection({ cardId, cardComments = [], onAddCardComment }) {
  const currentUser = useSelector(selectCurrentUser)
  const [activeTab, setActiveTab] = useState(ACTIVITY_TAB.COMMENTS)
  const [commentPage, setCommentPage] = useState(1)
  const [activityPage, setActivityPage] = useState(1)
  const [activityLogsByPage, setActivityLogsByPage] = useState({})
  const [totalActivities, setTotalActivities] = useState(null)
  const [hasFetchedActivities, setHasFetchedActivities] = useState(false)
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [activityError, setActivityError] = useState(null)

  const commentPageCount = Math.max(Math.ceil(cardComments.length / COMMENTS_PER_PAGE), 1)
  const paginatedComments = useMemo(() => {
    const startIndex = (commentPage - 1) * COMMENTS_PER_PAGE
    return cardComments.slice(startIndex, startIndex + COMMENTS_PER_PAGE)
  }, [cardComments, commentPage])

  const currentActivityLogs = useMemo(() => activityLogsByPage[activityPage] || [], [activityLogsByPage, activityPage])
  const systemLogs = useMemo(() => getSystemLogs(currentActivityLogs), [currentActivityLogs])
  const systemLogCountLabel = totalActivities === null ? '-' : totalActivities
  const systemLogPageCount = Math.max(Math.ceil((totalActivities || 0) / SYSTEM_LOGS_PER_PAGE), 1)

  useEffect(() => {
    setActiveTab(ACTIVITY_TAB.COMMENTS)
    setCommentPage(1)
    setActivityPage(1)
    setActivityLogsByPage({})
    setTotalActivities(null)
    setHasFetchedActivities(false)
    setIsLoadingActivities(false)
    setActivityError(null)
  }, [cardId])

  useEffect(() => {
    if (!cardId) return

    let isCancelled = false

    const fetchActivityCount = async () => {
      try {
        const result = await fetchCardActivitiesAPI(cardId, '?page=1&itemsPerPage=1&excludeCommentCreated=true')
        if (!isCancelled) {
          setTotalActivities(typeof result?.totalActivities === 'number' ? result.totalActivities : 0)
        }
      } catch (error) {
        if (!isCancelled) setTotalActivities(null)
      }
    }

    fetchActivityCount()

    return () => {
      isCancelled = true
    }
  }, [cardId])

  useEffect(() => {
    if (commentPage > commentPageCount) setCommentPage(commentPageCount)
  }, [commentPage, commentPageCount])

  const loadActivities = async (page = activityPage) => {
    if (!cardId || activityLogsByPage[page] || isLoadingActivities) return

    setIsLoadingActivities(true)
    setActivityError(null)
    try {
      const result = await fetchCardActivitiesAPI(cardId, `?page=${page}&itemsPerPage=${SYSTEM_LOGS_PER_PAGE}&excludeCommentCreated=true`)
      const logs = Array.isArray(result?.activities) ? result.activities : []
      setActivityLogsByPage(prev => ({ ...prev, [page]: logs }))
      setTotalActivities(typeof result?.totalActivities === 'number' ? result.totalActivities : logs.length)
      setHasFetchedActivities(true)
    } catch (error) {
      setActivityError('Could not load system logs.')
    } finally {
      setIsLoadingActivities(false)
    }
  }

  const handleTabChange = async (event, nextTab) => {
    setActiveTab(nextTab)
    if (nextTab === ACTIVITY_TAB.SYSTEM_LOG) await loadActivities(activityPage)
  }

  const handleCommentPageChange = (event, page) => {
    setCommentPage(page)
  }

  const handleActivityPageChange = async (event, page) => {
    setActivityPage(page)
    await loadActivities(page)
  }

  const handleAddCardComment = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!event.target?.value) return

      const commentToAdd = {
        userAvatar: currentUser?.avatar,
        userDisplayName: currentUser?.displayName,
        content: event.target.value.trim()
      }

      onAddCardComment(commentToAdd).then(() => {
        event.target.value = ''
        setCommentPage(1)
      })
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar
          sx={{ width: 36, height: 36, cursor: 'pointer' }}
          alt={currentUser?.displayName}
          src={currentUser?.avatar}
        />
        <TextField
          fullWidth
          placeholder="Write a comment..."
          type="text"
          variant="outlined"
          multiline
          onKeyDown={handleAddCardComment}
        />
      </Box>

      <Box sx={{ pl: '45px', mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons={false}
          sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 700 } }}
        >
          <Tab value={ACTIVITY_TAB.COMMENTS} label={`Comments (${cardComments.length})`} />
          <Tab value={ACTIVITY_TAB.SYSTEM_LOG} label={`System Log (${systemLogCountLabel})`} />
        </Tabs>
      </Box>

      {activeTab === ACTIVITY_TAB.COMMENTS &&
        <Box>
          {cardComments.length === 0 &&
            <Typography sx={{ pl: '45px', fontSize: '14px', fontWeight: '500', color: 'text.secondary' }}>
              No comments yet.
            </Typography>
          }

          {paginatedComments.map((comment, index) =>
            <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 1.5 }} key={comment._id || index}>
              <Tooltip title={comment.userDisplayName || 'User'}>
                <Avatar
                  sx={{ width: 36, height: 36, cursor: 'pointer' }}
                  alt={comment.userDisplayName || 'User'}
                  src={comment.userAvatar}
                />
              </Tooltip>
              <Box sx={{ width: 'inherit' }}>
                <Typography variant="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                  {comment.userDisplayName || 'User'}
                </Typography>

                <Typography variant="span" sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  {moment(comment.commentedAt).format('llll')}
                </Typography>

                <Box sx={{
                  display: 'block',
                  color: 'text.primary',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.08) : theme.palette.background.paper,
                  p: '8px 12px',
                  mt: '4px',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: '4px',
                  wordBreak: 'break-word',
                  boxShadow: (theme) => theme.palette.mode === 'dark' ? 'none' : '0 1px 2px rgba(9, 30, 66, 0.12)'
                }}>
                  {comment.content}
                </Box>
              </Box>
            </Box>
          )}

          {cardComments.length > COMMENTS_PER_PAGE &&
            <Box sx={{ pl: '45px', display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Pagination
                size="small"
                color="primary"
                page={commentPage}
                count={commentPageCount}
                onChange={handleCommentPageChange}
              />
            </Box>
          }
        </Box>
      }

      {activeTab === ACTIVITY_TAB.SYSTEM_LOG &&
        <Box sx={{ pl: '45px' }}>
          {isLoadingActivities &&
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">Loading system logs...</Typography>
            </Box>
          }

          {activityError &&
            <Typography sx={{ fontSize: '14px', fontWeight: '500', color: 'warning.main', mb: 1.5 }}>
              {activityError}
            </Typography>
          }

          {!isLoadingActivities && !activityError && systemLogs.length === 0 &&
            <Typography sx={{ fontSize: '14px', fontWeight: '500', color: 'text.secondary' }}>
              No activity logs yet.
            </Typography>
          }

          <Stack spacing={1}>
            {systemLogs.map(log =>
              <Box
                key={log._id}
                sx={(theme) => {
                  const visual = getActivityVisual(theme, log.action)

                  return {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    p: 1,
                    borderRadius: '6px',
                    bgcolor: visual.backgroundColor,
                    color: 'text.primary',
                    border: 1,
                    borderColor: 'divider',
                    '& .activity-icon': { color: visual.color }
                  }
                }}
              >
                <Box sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.72)
                }}>
                  {(() => {
                    const Icon = getActivityIcon(log.action)
                    return <Icon className="activity-icon" fontSize="small" />
                  })()}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {log.actorDisplayName || 'User'}
                    </Typography>
                    <Typography variant="body2">
                      {formatActivityMessage(log.action, log.metadata)}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {moment(log.createdAt).format('llll')}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={log.action || 'ACTION'}
                  variant="outlined"
                  sx={{ display: { xs: 'none', md: 'inline-flex' }, maxWidth: 160, fontSize: '0.68rem' }}
                />
              </Box>
            )}
          </Stack>

          {hasFetchedActivities && totalActivities > SYSTEM_LOGS_PER_PAGE &&
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
              <Pagination
                size="small"
                color="primary"
                page={activityPage}
                count={systemLogPageCount}
                onChange={handleActivityPageChange}
                disabled={isLoadingActivities}
              />
            </Box>
          }
        </Box>
      }
    </Box>
  )
}

export default CardActivitySection
