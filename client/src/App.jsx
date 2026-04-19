import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ProtectedRoute from './router/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Analyzer from './pages/Analyzer.jsx'
import QuestionIntelligence from './pages/QuestionIntelligence.jsx'
import RevisionTracker from './pages/RevisionTracker.jsx'
import Profile from './pages/Profile.jsx'
import Support from './pages/Support.jsx'
import ConceptDetail from './pages/ConceptDetail.jsx'
import Sheets from './pages/Sheets.jsx'
import SheetDetail from './pages/SheetDetail.jsx'
import Resources from './pages/Resources.jsx'
import Contests from './pages/Contests.jsx'
import { Toaster } from 'sonner'
import Navbar from './components/shared/Navbar.jsx'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/resources" element={
              <ProtectedRoute><Resources /></ProtectedRoute>
            } />
            <Route path="/sheets" element={
              <ProtectedRoute><Sheets /></ProtectedRoute>
            } />
            <Route path="/sheets/:id" element={
              <ProtectedRoute><SheetDetail /></ProtectedRoute>
            } />
            <Route path="/analysis/:profileId" element={
              <ProtectedRoute><Analyzer /></ProtectedRoute>
            } />
            <Route path="/analysis/:profileId/question/:questionId" element={
              <ProtectedRoute><QuestionIntelligence /></ProtectedRoute>
            } />
            <Route path="/analysis/:profileId/revision" element={
              <ProtectedRoute><RevisionTracker /></ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute><Support /></ProtectedRoute>
            } />
            <Route path="/roadmap/concept/:title" element={
              <ProtectedRoute><ConceptDetail /></ProtectedRoute>
            } />
            <Route path="/contests" element={
              <ProtectedRoute><Navbar /><Contests /></ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors />
      </ThemeProvider>
    </AuthProvider>
  )
}
