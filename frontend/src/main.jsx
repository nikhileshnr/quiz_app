import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import CreateQuiz from './pages/CreateQuiz'
import GenerateQuiz from './pages/GenerateQuiz'
import QuizPreview from './pages/QuizPreview'
import QuizList from './pages/QuizList'
import TestGemini from './pages/TestGemini'
import QuizDetail from './pages/QuizDetail'
import InvitationsPage from './pages/InvitationsPage'
import ProtectedRoute from './components/ProtectedRoute'
import QuizResults from './pages/QuizResults'
import InviteStudents from './pages/InviteStudents'

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
        path: "login",
        element: <Login />
      },
      {
        path: "create",
        element: (
          <ProtectedRoute requiredRole="teacher">
            <CreateQuiz />
          </ProtectedRoute>
        )
      },
      {
        path: "generate",
        element: (
          <ProtectedRoute requiredRole="teacher">
            <GenerateQuiz />
          </ProtectedRoute>
        )
      },
      {
        path: "quiz-preview",
        element: (
          <ProtectedRoute requiredRole="teacher">
            <QuizPreview />
          </ProtectedRoute>
        )
      },
      {
        path: "quizzes",
        element: (
          <ProtectedRoute>
            <QuizList />
          </ProtectedRoute>
        )
      },
      {
        path: "quiz/:id",
        element: (
          <ProtectedRoute>
            <QuizDetail />
          </ProtectedRoute>
        )
      },
      {
        path: "quiz/:id/edit",
        element: (
          <ProtectedRoute requiredRole="teacher">
            <CreateQuiz />
          </ProtectedRoute>
        )
      },
      {
        path: "quiz/:id/results",
        element: (
          <ProtectedRoute requiredRole="teacher">
            <QuizResults />
          </ProtectedRoute>
        )
      },
      {
        path: "quiz/:id/invite",
        element: (
          <ProtectedRoute requiredRole="teacher">
            <InviteStudents />
          </ProtectedRoute>
        )
      },
      {
        path: "invitations",
        element: (
          <ProtectedRoute requiredRole="student">
            <InvitationsPage />
          </ProtectedRoute>
        )
      },
      {
        path: "test-gemini",
        element: <TestGemini />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
