import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '50px'
const COLUMN_FOOTER_HEIGHT = '56px'

// ── Brand & accent tokens ──────────────────────────────────────────
const BRAND = '#6366f1' // indigo-500
const BRAND_LIGHT = '#818cf8' // indigo-400
const BRAND_DARK = '#4f46e5' // indigo-600

// Dark surface layers
const BG_BASE = '#0d0f14'
const BG_SURFACE = '#13161e'
// const BG_ELEVATED = '#1a1e2a'
// const BG_CARD = '#1f2436'

// ── Theme ──────────────────────────────────────────────────────────
const theme = extendTheme({
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columnFooterHeight: COLUMN_FOOTER_HEIGHT
  },

  colorSchemes: {
    // ── DARK ────────────────────────────────────────────────────────
    dark: {
      palette: {
        primary: {
          main: BRAND,
          light: BRAND_LIGHT,
          dark: BRAND_DARK,
          contrastText: '#ffffff'
        },
        secondary: {
          main: '#a855f7',
          light: '#c084fc',
          dark: '#9333ea'
        },
        success: {
          main: '#10b981',
          light: '#34d399',
          dark: '#059669'
        },
        warning: {
          main: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706'
        },
        error: {
          main: '#ef4444',
          light: '#f87171',
          dark: '#dc2626'
        },
        info: {
          main: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb'
        },
        background: {
          default: BG_BASE,
          paper: BG_SURFACE
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          disabled: '#475569'
        },
        divider: 'rgba(255,255,255,0.07)'
      }
    },

    // ── LIGHT ────────────────────────────────────────────────────────
    light: {
      palette: {
        primary: {
          main: BRAND,
          light: BRAND_LIGHT,
          dark: BRAND_DARK
        },
        secondary: { main: '#a855f7' },
        success: { main: '#10b981' },
        warning: { main: '#f59e0b' },
        error: { main: '#ef4444' },
        background: {
          default: '#f0f2f8',
          paper: '#ffffff'
        }
      }
    }
  },

  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif'
    ].join(','),
    fontSize: 13,
    fontWeightMedium: 500,
    fontWeightSemiBold: 600,
    h6: { fontWeight: 700, fontSize: '1rem' },
    body1: { fontSize: '0.8125rem' },
    body2: { fontSize: '0.75rem' },
    caption: { fontSize: '0.6875rem' }
  },

  shape: { borderRadius: 8 },

  components: {
    // ── Global baseline ────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Inter, sans-serif',
          '*::-webkit-scrollbar': {
            width: '6px',
            height: '8px'
          },
          '*::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.08)',
            borderRadius: '4px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderRadius: '4px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0,0,0,0.45)'
          }
        }
      }
    },

    // ── Button ─────────────────────────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.8125rem',
          borderWidth: '1px',
          borderRadius: '8px',
          '&:hover': { borderWidth: '1px' }
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${BRAND}, #8b5cf6)`,
          boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          '&:hover': {
            background: `linear-gradient(135deg, ${BRAND_LIGHT}, #a78bfa)`,
            boxShadow: '0 4px 20px rgba(99,102,241,0.45)'
          }
        }
      }
    },

    // ── Card (MUI) ───────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '12px',
          transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1), border-color 0.22s'
        }
      }
    },

    // ── Chip ──────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.6875rem',
          letterSpacing: '0.2px'
        }
      }
    },

    // ── Input / TextField ─────────────────────────────────────────
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem' }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiTypography-body1': { fontSize: '0.8125rem' }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: '8px',
          '& fieldset': { borderWidth: '1px !important' },
          '&:hover fieldset': { borderWidth: '1px !important' },
          '&.Mui-focused fieldset': { borderWidth: '1px !important' }
        }
      }
    },

    // ── Tooltip ───────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: '6px',
          padding: '5px 10px'
        }
      }
    },

    // ── Paper ─────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },

    // ── LinearProgress ────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.07)'
        },
        bar: {
          borderRadius: '4px'
        }
      }
    }
  }
})

export default theme
