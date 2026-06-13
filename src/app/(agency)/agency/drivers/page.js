'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Plus, Edit2, Trash2, Users, Phone, Award, Mail, ShieldAlert } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AgencyDriversPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [driverStatus, setDriverStatus] = useState('available');

  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Drivers list
  const { data, error, isLoading: driversLoading, mutate } = useSWR(
    user ? '/api/drivers' : null,
    fetcher
  );

  useEffect(() => {
    if (editingDriver) {
      setName(editingDriver.name || '');
      setLicenseNumber(editingDriver.licenseNumber || '');
      setPhone(editingDriver.phone || '');
      setEmail(editingDriver.userId?.email || '');
      setDriverStatus(editingDriver.status || 'available');
    } else {
      setName('');
      setLicenseNumber('');
      setPhone('');
      setEmail('');
      setDriverStatus('available');
    }
  }, [editingDriver]);

  if (authLoading || driversLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const drivers = data?.drivers || [];

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (drv) => {
    setEditingDriver(drv);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingDriver(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !licenseNumber.trim() || !phone.trim()) {
      toast.error('Please fill in name, license number, and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingDriver) {
        // Edit Mode
        await axios.put(`/api/drivers/${editingDriver._id}`, {
          name,
          licenseNumber,
          phone,
          status: driverStatus,
        });
        toast.success('Driver updated successfully.');
      } else {
        // Create Mode
        await axios.post('/api/drivers', {
          name,
          licenseNumber,
          phone,
          email,
        });
        toast.success('Driver added successfully.');
      }
      mutate();
      handleCloseModal();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to save driver.';
      toast.error(errMsg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSubmitting(true);
    try {
      await axios.delete(`/api/drivers/${deleteId}`);
      toast.success('Driver removed successfully.');
      mutate();
      setDeleteId(null);
    } catch (err) {
      toast.error('Failed to remove driver.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'available') return 'badge-easy';
    if (status === 'on_trip') return 'badge-moderate';
    return 'badge-outline';
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-green-950 dark:text-green-100">Drivers Roster</h1>
          <p className="text-xs text-gray-500">Manage drivers and link driver user accounts for scheduled assignments.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary gap-1.5 py-2.5">
          <Plus className="w-4 h-4" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Grid */}
      {drivers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((drv) => (
            <div key={drv._id} className="card p-5 border border-green-100 dark:border-dark-border space-y-4 hover:border-green-200 dark:hover:border-green-600 transition-all flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-green-50 dark:bg-green-400 dark:text-dark-bg flex items-center justify-center font-bold text-sm select-none">
                    {drv.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-green-950 dark:text-green-100">{drv.name}</h3>
                    <span className={`badge ${getStatusBadge(drv.status)} text-[9px] uppercase font-bold mt-1 inline-block`}>
                      {drv.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1.5">
                  <button onClick={() => handleOpenEdit(drv)} className="btn btn-ghost p-1.5 hover:text-green-600 rounded">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(drv._id)} className="btn btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 border-t border-green-50 dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span>License: <strong className="text-green-950 dark:text-green-200">{drv.licenseNumber}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span>Phone: <strong className="text-green-950 dark:text-green-200">{drv.phone}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  {drv.userId ? (
                    <span className="truncate">Linked: <strong className="text-green-950 dark:text-green-200">{drv.userId.email}</strong></span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">Unlinked (Local driver profile)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-16 text-center max-w-md mx-auto space-y-4">
          <Users className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
          <h3 className="text-lg font-bold text-green-950 dark:text-green-100">No drivers registered yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Link and manage drivers in your roster to allocate them to active hiker transport routes.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary px-6 py-2.5">
            Add First Driver
          </button>
        </div>
      )}

      {/* Modal - Add / Edit Driver */}
      {showAddModal && (
        <div className="modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 w-full max-w-md space-y-6 shadow-modal">
            <div>
              <h2 className="text-base font-black text-green-950 dark:text-green-100">
                {editingDriver ? 'Edit Driver Details' : 'Add New Driver'}
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Provide driver contact details and licensing info.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="form-label block">Driver Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mang Tomas"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="form-label block">License Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. N01-12-345678"
                  className="form-input font-mono"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="form-label block">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09228889999"
                  className="form-input font-mono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {!editingDriver && (
                <div className="space-y-1.5">
                  <label className="form-label block">Link Driver Account Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="driver@pahinga.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400">If the driver already registered a driver account, enter their email to link them so they can view and update trips in their own phone/dashboard.</p>
                </div>
              )}

              {editingDriver && (
                <div className="space-y-1.5">
                  <label className="form-label block">Driver Status</label>
                  <select
                    className="form-select"
                    value={driverStatus}
                    onChange={(e) => setDriverStatus(e.target.value)}
                  >
                    <option value="available">Available (Roster)</option>
                    <option value="on_trip">On Trip</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary flex-1 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1 py-2.5"
                >
                  {submitting ? <Spinner className="w-5 h-5 mx-auto" /> : <span>Save Driver</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Remove Driver"
          message="Are you sure you want to remove this driver from your agency roster? Active trip assignments will still hold driver reference but status could be altered."
          confirmText="Yes, Remove Driver"
          cancelText="No, Keep Roster"
          loading={submitting}
        />
      )}
    </div>
  );
}
