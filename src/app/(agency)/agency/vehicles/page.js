'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Plus, Edit2, Trash2, Car, Users, Calendar, ShieldCheck } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AgencyVehiclesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form states
  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType] = useState('Van');
  const [capacity, setCapacity] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState('available');

  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Vehicles list
  const { data, error, isLoading: vehiclesLoading, mutate } = useSWR(
    user ? '/api/vehicles' : null,
    fetcher
  );

  useEffect(() => {
    if (editingVehicle) {
      setPlateNumber(editingVehicle.plateNumber || '');
      setType(editingVehicle.type || 'Van');
      setCapacity(editingVehicle.capacity ? String(editingVehicle.capacity) : '');
      setVehicleStatus(editingVehicle.status || 'available');
    } else {
      setPlateNumber('');
      setType('Van');
      setCapacity('');
      setVehicleStatus('available');
    }
  }, [editingVehicle]);

  if (authLoading || vehiclesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const vehicles = data?.vehicles || [];

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (veh) => {
    setEditingVehicle(veh);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingVehicle(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!plateNumber.trim() || !type.trim() || !capacity.trim()) {
      toast.error('Please fill in plate number, type, and seating capacity.');
      return;
    }
    if (Number(capacity) < 1) {
      toast.error('Capacity must be at least 1 seat.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingVehicle) {
        // Edit Mode
        await axios.put(`/api/vehicles/${editingVehicle._id}`, {
          plateNumber,
          type,
          capacity: Number(capacity),
          status: vehicleStatus,
        });
        toast.success('Vehicle details updated.');
      } else {
        // Create Mode
        await axios.post('/api/vehicles', {
          plateNumber,
          type,
          capacity: Number(capacity),
        });
        toast.success('Vehicle registered successfully.');
      }
      mutate();
      handleCloseModal();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to save vehicle details.';
      toast.error(errMsg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSubmitting(true);
    try {
      await axios.delete(`/api/vehicles/${deleteId}`);
      toast.success('Vehicle removed successfully.');
      mutate();
      setDeleteId(null);
    } catch (err) {
      toast.error('Failed to remove vehicle.');
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
    <div className="w-full min-w-0 p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-green-950 dark:text-green-100">Transportation Fleet</h1>
          <p className="text-xs text-gray-500">Register vans, SUVs, or buses and track trip status allocations.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary gap-1.5 py-2.5">
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Grid */}
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((veh) => (
            <div key={veh._id} className="card p-5 border border-green-100 dark:border-dark-border space-y-4 hover:border-green-200 dark:hover:border-green-600 transition-all flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-dark-surface flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-green-950 dark:text-green-100 font-mono tracking-wide">{veh.plateNumber}</h3>
                    <span className={`badge ${getStatusBadge(veh.status)} text-[9px] uppercase font-bold mt-1 inline-block`}>
                      {veh.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button onClick={() => handleOpenEdit(veh)} className="btn btn-ghost p-1.5 hover:text-green-600 rounded">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(veh._id)} className="btn btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 border-t border-green-50 dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span>Type: <strong className="text-green-950 dark:text-green-200">{veh.type}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span>Seating Capacity: <strong className="text-green-950 dark:text-green-200">{veh.capacity} Seats</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full min-w-0 bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 sm:p-10 md:p-16 text-center max-w-md mx-auto space-y-4">
          <Car className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
          <h3 className="text-lg font-bold text-green-950 dark:text-green-100">No vehicles registered yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Register your transport fleet vehicles to assign driver routes for incoming hikers.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary px-6 py-2.5">
            Add First Vehicle
          </button>
        </div>
      )}

      {/* Modal - Add / Edit Vehicle */}
      {showAddModal && (
        <div className="modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 w-full max-w-md space-y-6 shadow-modal">
            <div>
              <h2 className="text-base font-black text-green-950 dark:text-green-100">
                {editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle'}
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Specify vehicle details, type, and seating capacity.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="form-label block">Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NDD 8910"
                  className="form-input font-mono uppercase"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-1.5">
                <label className="form-label block">Vehicle Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Van">Van (e.g. Toyota Hiace)</option>
                  <option value="SUV">SUV (e.g. Montero Sport)</option>
                  <option value="AUV">AUV (e.g. Toyota Innova)</option>
                  <option value="Bus">Coaster / Bus</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="form-label block">Seating Capacity (Pax)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 12"
                  className="form-input"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>

              {editingVehicle && (
                <div className="space-y-1.5">
                  <label className="form-label block">Vehicle Status</label>
                  <select
                    className="form-select"
                    value={vehicleStatus}
                    onChange={(e) => setVehicleStatus(e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="maintenance">Maintenance</option>
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
                  {submitting ? <Spinner className="w-5 h-5 mx-auto" /> : <span>Save Vehicle</span>}
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
          title="Remove Vehicle"
          message="Are you sure you want to remove this vehicle from your roster? Action will delete vehicle fleet references."
          confirmText="Yes, Remove Vehicle"
          cancelText="No, Keep Fleet"
          loading={submitting}
        />
      )}
    </div>
  );
}


