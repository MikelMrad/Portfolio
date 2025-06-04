import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#444444',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#444444',
    },    
    text: {
      primary: '#ffffff',
    },
  },
  typography: {
    fontFamily: `'Urbanist', sans-serif`,
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 300,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
})

export default theme
