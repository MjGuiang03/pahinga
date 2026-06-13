export const formatPrice = (n) => `₱${Number(n).toLocaleString('en-PH')}`
export const formatDate = (d) => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
export const formatShortDate = (d) => new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
export const statusBadgeClass = (s) => ({ pending: 'badge-moderate', confirmed: 'badge-easy', cancelled: 'badge-difficult', completed: 'badge-green' }[s] || 'badge-green')
