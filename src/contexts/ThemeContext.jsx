import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('xbesh-cms-theme')
    
    // If theme is stored, use it
    if (savedTheme) {
      return savedTheme
    }
    
    // Otherwise, check user's system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    // Default to light theme
    return 'light'
  })

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    localStorage.setItem('xbesh-cms-theme', theme)
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
