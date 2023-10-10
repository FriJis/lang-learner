import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import reportWebVitals from './reportWebVitals'
import './assets/fa/css/all.css'
import './i18n/index'
import { AppContextProvider } from './ctx/app'
import { Container } from '@mui/material'
// const store = configureStore({counter: counter.reducer})

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
    <React.StrictMode>
        <AppContextProvider>
            <Container>
                <App />
            </Container>
        </AppContextProvider>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
