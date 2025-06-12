import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import CreateQuiz from './pages/CreateQuiz'
import GenerateQuiz from './pages/GenerateQuiz'
import QuizList from './pages/QuizList'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "create",
        element: <CreateQuiz />
      },
      {
        path: "generate",
        element: <GenerateQuiz />
      },
      {
        path: "quizzes",
        element: <QuizList />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
)
