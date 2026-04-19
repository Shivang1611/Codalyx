import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api.js'
import { aggregateStats } from '../utils/aggregation.js'
import StatsHeader from '../components/dashboard/StatsHeader.jsx'
import ProfileCard from '../components/dashboard/ProfileCard.jsx'
import AddProfileModal from '../components/dashboard/AddProfileModal.jsx'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import { Plus, LayoutGrid, Info, Search } from 'lucide-react'
import ThemeToggle from '../components/layout/ThemeToggle.jsx'
import { toast } from 'sonner'

export default function Dashboard() {
  const [profiles, setProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const res = await api.get('/profiles')
      setProfiles(res.data)
    } catch (err) {
      toast.error('Failed to load profiles')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProfile = async (data) => {
    try {
      const res = await api.post('/profiles', data)
      setProfiles([...profiles, res.data])
      toast.success('Profile added successfully')
      handleRefreshProfile(res.data._id)
    } catch (err) {
      const msg = err.response?.data?.error || 'Profile creation failed'
      toast.error(msg)
      throw new Error(msg)
    }
  }

  const handleDeleteProfile = async (id) => {
    try {
      await api.delete(`/profiles/${id}`)
      setProfiles(profiles.filter(p => p._id !== id))
      toast.success('Profile removed')
    } catch (err) {
      toast.error('Failed to delete profile')
    }
  }

  const handleRefreshProfile = async (id) => {
    try {
      const res = await api.put(`/profiles/${id}/refresh`)
      setProfiles(profiles.map(p => p._id === id ? res.data : p))
      toast.success('Stats synced with platform')
    } catch (err) {
      toast.error('Failed to sync with platform. Check username.')
    }
  }

  const stats = aggregateStats(profiles)

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pt-4">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight mb-2">My Command Center</h1>
          <p className="text-[var(--text-secondary)] font-medium">Monitoring your path to technical mastery.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[var(--cyan)] text-white text-xs font-bold tracking-[0.2em] rounded-xl shadow-lg shadow-[var(--cyan-glow)] hover:bg-[var(--cyan-dark)] transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> CONNECT_ACCOUNT
        </button>
      </div>

      <StatsHeader stats={stats} />

      <div className="flex items-center gap-2 mb-6 text-[var(--text-muted)]">
        <LayoutGrid size={16} />
        <h2 className="text-xs font-bold uppercase tracking-widest">Connected Profiles</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 skeleton bg-[var(--bg-card)] rounded-2xl" />)}
        </div>
      ) : profiles.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {profiles.map(profile => (
              <ProfileCard 
                key={profile._id} 
                profile={profile} 
                onDelete={handleDeleteProfile}
                onRefresh={handleRefreshProfile}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[var(--bg-card)] border border-[var(--border)] border-dashed rounded-3xl p-20 flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 bg-[var(--bg-hover)] rounded-2xl flex items-center justify-center mb-6 text-[var(--text-muted)]">
            <Info size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No profiles connected</h3>
          <p className="text-[var(--text-secondary)] max-w-sm mb-8">Connect your LeetCode or Codeforces accounts to start analyzing your performance.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 bg-[var(--bg-hover)] hover:bg-[var(--cyan)] text-[var(--text-primary)] hover:text-white border border-[var(--border)] rounded-xl font-bold transition-all"
          >
            Connect Account Now
          </button>
        </motion.div>
      )}

      <AddProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddProfile}
      />
    </PageWrapper>
  )
}
