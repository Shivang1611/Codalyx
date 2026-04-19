import React from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 text-center bg-[var(--bg-base)] rounded-3xl border border-[var(--border)] border-dashed m-6">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-[var(--red)]/10 text-[var(--red)] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-['Space_Grotesk'] tracking-tight">
              Something went wrong.
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-8">
              We encountered an unexpected error while rendering this component. Our agents are investigating.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-8 py-3 bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] text-white rounded-xl font-bold shadow-lg shadow-[var(--cyan-glow)] flex items-center justify-center gap-2 mx-auto transition-all"
            >
              <RefreshCcw size={18} />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
