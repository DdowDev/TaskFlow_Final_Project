import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import { analyzeBoardWithAIAPI, fetchBoardDashboardAPI } from '~/apis'
import AiAssistantPanel from './components/AiAssistantPanel'
import ChartsRow from './components/ChartsRow'
import DashboardHeader from './components/DashboardHeader'
import KpiRow from './components/KpiRow'
import WorkSection from './components/WorkSection'

const getNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0

function DashboardSkeleton() {
  return (
    <Grid container spacing={2}>
      {[1, 2, 3, 4, 5, 6].map(item => (
        <Grid key={item} item xs={12} sm={6} md={4} lg={2}>
          <Skeleton variant="rounded" height={112} />
        </Grid>
      ))}
      <Grid item xs={12} md={6}><Skeleton variant="rounded" height={360} /></Grid>
      <Grid item xs={12} md={6}><Skeleton variant="rounded" height={360} /></Grid>
      <Grid item xs={12} md={6}><Skeleton variant="rounded" height={260} /></Grid>
      <Grid item xs={12} md={6}><Skeleton variant="rounded" height={260} /></Grid>
    </Grid>
  )
}

function BoardDashboard({ boardId, isActive, onDrillDown = () => {} }) {
  const [dashboard, setDashboard] = useState(null)
  const [dashboardUpdatedAt, setDashboardUpdatedAt] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiExpanded, setAiExpanded] = useState(false)
  const [activeAiTab, setActiveAiTab] = useState('risks')

  const fetchDashboard = useMemo(() => async () => {
    if (!boardId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchBoardDashboardAPI(boardId)
      setDashboard(data)
      setDashboardUpdatedAt(Date.now())
    } catch (err) {
      setError(err?.message || 'Could not load board dashboard.')
    } finally {
      setIsLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    if (!boardId || !isActive) return

    fetchDashboard()
  }, [boardId, fetchDashboard, isActive])

  useEffect(() => {
    setAiAnalysis(null)
    setAiError(null)
    setIsAiLoading(false)
    setAiExpanded(false)
    setActiveAiTab('risks')
  }, [boardId])

  const handleAnalyzeBoardWithAI = async () => {
    if (!boardId || isAiLoading) return

    setIsAiLoading(true)
    setAiError(null)

    try {
      const result = await analyzeBoardWithAIAPI(boardId)
      setAiAnalysis(result)
      setAiExpanded(false)
      setActiveAiTab('risks')
    } catch (err) {
      setAiError(err?.response?.data?.message || err?.message || 'Could not analyze board with AI.')
    } finally {
      setIsAiLoading(false)
    }
  }

  const totalCards = getNumber(dashboard?.totalCards)

  return (
    <Box sx={{
      height: (theme) => theme.trello.boardContentHeight,
      overflowY: 'auto',
      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#34495e' : '#f4f6f8',
      p: { xs: 1.5, md: 2 }
    }}>
      <Stack spacing={2}>
        <DashboardHeader
          healthScore={aiAnalysis?.summary?.healthScore}
          healthStatus={aiAnalysis?.summary?.healthStatus}
          updatedAt={dashboardUpdatedAt}
          loading={isLoading}
          onRefresh={fetchDashboard}
        />

        {isLoading && <DashboardSkeleton />}

        {!isLoading && error &&
          <Alert severity="error">{error}</Alert>
        }

        {!isLoading && !error && dashboard &&
          <>
            {totalCards === 0 &&
              <Alert severity="info">This board does not have active cards yet.</Alert>
            }

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <KpiRow data={dashboard} onDrillDown={onDrillDown} />
              </Grid>

              <Grid item xs={12}>
                <AiAssistantPanel
                  analysis={aiAnalysis}
                  loading={isAiLoading}
                  error={aiError}
                  expanded={aiExpanded}
                  activeTab={activeAiTab}
                  onAnalyze={handleAnalyzeBoardWithAI}
                  onToggleExpanded={() => setAiExpanded(prev => !prev)}
                  onChangeTab={setActiveAiTab}
                  onDrillDown={onDrillDown}
                />
              </Grid>

              <Grid item xs={12}>
                <ChartsRow data={dashboard} onDrillDown={onDrillDown} />
              </Grid>

              <Grid item xs={12}>
                <WorkSection
                  overdueCards={dashboard.overdueCards || []}
                  dueSoonCards={dashboard.dueSoonCards || []}
                  memberWorkload={dashboard.memberWorkload || []}
                  onDrillDown={onDrillDown}
                />
              </Grid>
            </Grid>
          </>
        }
      </Stack>
    </Box>
  )
}

export default BoardDashboard
