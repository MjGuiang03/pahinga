'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, Users, Phone, Award, Mail,
  Car, ShieldCheck, Hash,
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

// ── status helpers ────────────────────────────────────────────────────────────
const driverStatusBadge = (s) => {
  if (s === 'available') return 'badge-easy';
  if (s === 'on_trip')   return 'badge-moderate';
  return 'badge-outline';
};
const vehicleStatusBadge = (s) => {
  if (s === 'available')   return 'badge-easy';
  if (s === 'on_trip')     return 'badge-moderate';
  return 'badge-outline';
};

// ── Driver section ────────────────────────────────────────────────────────────
function DriversSection() {
  const { user } = useAuth();
  const { data, isLoading, mutate } = useSWR(user ? '/api/drivers' : null, fetcher);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName]               = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone]             = useState('');
  const [email, setEmail]             = useState('');
  const [role, setRole]               = useState('driver');
  const [driverStatus, setDriverStatus] = useState('available');

  useEffect(() => {
    if (editing) {
      setName(editing.name || '');
      setLicenseNumber(editing.licenseNumber || '');
      setPhone(editing.phone || '');
      setEmail(editing.userId?.email || '');
      setRole(editing.role || 'driver');
      setDriverStatus(editing.status || 'available');
    } else {
      setName(''); setLicenseNumber(''); setPhone(''); setEmail(''); setRole('driver'); setDriverStatus('available');
    }
  }, [editing]);

  const openAdd  = () => { setEditing(null); setShowModal(true); };
  const openEdit = (d) => { setEditing(d); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || (!editing && !email.trim()) || (role === 'driver' && !licenseNumber.trim())) {
      toast.error(`Name, phone, and email are required. ${role === 'driver' ? 'Drivers must provide a license number.' : ''}`);
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await axios.put(`/api/drivers/${editing._id}`, { name, licenseNumber, phone, role, status: driverStatus });
        toast.success('Member updated.');
      } else {
        await axios.post('/api/drivers', { name, licenseNumber, phone, email, role });
        toast.success('Member added.');
      }
      mutate(); closeModal();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save driver.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axios.delete(`/api/drivers/${deleteId}`);
      toast.success('Driver removed.'); mutate(); setDeleteId(null);
    } catch { toast.error('Failed to remove driver.'); }
    finally { setSubmitting(false); }
  };

  const drivers = data?.drivers || [];

  if (isLoading) return <div className="flex justify-center py-16"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-green-950 dark:text-white">Coordinators & Drivers</p>
          <p className="text-xs text-gray-400 mt-0.5">{drivers.length} member{drivers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary gap-1.5 py-2">
          <Plus className="w-3.5 h-3.5" /> Add Member
        </button>
      </div>

      {drivers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {drivers.map((d) => (
            <div key={d._id} className="card p-5 border border-green-100 dark:border-dark-border space-y-4 hover:border-green-300 dark:hover:border-green-600 transition-all flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-black text-sm select-none shrink-0">
                    {d.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-green-950 dark:text-white">{d.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="badge badge-outline text-[9px] uppercase font-bold">
                        {d.role || 'driver'}
                      </span>
                      <span className={`badge ${driverStatusBadge(d.status)} text-[9px] uppercase font-bold`}>
                        {d.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(d)} className="btn btn-ghost p-1.5 hover:text-green-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteId(d._id)} className="btn btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-green-50 dark:border-dark-border mt-auto">
                {d.role !== 'coordinator' && (
                  <div className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" /><span>License: <strong className="text-green-950 dark:text-green-200">{d.licenseNumber || '—'}</strong></span></div>
                )}
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" /><span>{d.phone}</span></div>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                  {d.userId ? <span className="truncate">Linked: <strong className="text-green-950 dark:text-green-200">{d.userId.email}</strong></span>
                            : <span className="text-gray-400 italic">No linked account</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 sm:p-10 md:p-16 text-center space-y-4">
          <Users className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
          <p className="text-sm font-bold text-green-950 dark:text-white">No coordinators or drivers yet</p>
          <p className="text-xs text-gray-400">Add members to your team roster to manage trips.</p>
          <button onClick={openAdd} className="btn btn-primary px-6 py-2.5">Add First Member</button>
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 w-full max-w-md space-y-5 shadow-modal">
            <div>
              <h2 className="text-base font-black text-green-950 dark:text-white">{editing ? 'Edit Member' : 'Add New Member'}</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Fill in the coordinator/driver contact and licensing details.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5"><label className="form-label block">Full Name</label><input type="text" required placeholder="e.g. Mang Tomas" className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="space-y-1.5">
                <label className="form-label block">Role</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="driver">Driver</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
              {role === 'driver' && (
                <div className="space-y-1.5"><label className="form-label block">License Number</label><input type="text" required placeholder="e.g. N01-12-345678" className="form-input font-mono" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} /></div>
              )}
              <div className="space-y-1.5"><label className="form-label block">Phone Number</label><input type="text" required placeholder="09xxxxxxxxx" className="form-input font-mono" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              {!editing && (
                <div className="space-y-1.5">
                  <label className="form-label block">Link Account Email</label>
                  <input type="email" required placeholder="member@pahinga.com" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
                  <p className="text-[10px] text-gray-400">The member must have a registered Pahinga account. Enter their email to link them to your agency.</p>
                </div>
              )}
              {editing && (
                <div className="space-y-1.5">
                  <label className="form-label block">Status</label>
                  <select className="form-select" value={driverStatus} onChange={e => setDriverStatus(e.target.value)}>
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary flex-1 py-2.5">{submitting ? <Spinner className="w-5 h-5 mx-auto" /> : 'Save Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Remove Member" message="Remove this member from your roster?" confirmText="Yes, Remove" cancelText="Cancel" loading={submitting} />
    </div>
  );
}

// ── Vehicles section ──────────────────────────────────────────────────────────
function VehiclesSection() {
  const { user } = useAuth();
  const { data, isLoading, mutate } = useSWR(user ? '/api/vehicles' : null, fetcher);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType]               = useState('Van');
  const [capacity, setCapacity]       = useState('');
  const [vehicleStatus, setVehicleStatus] = useState('available');

  useEffect(() => {
    if (editing) {
      setPlateNumber(editing.plateNumber || '');
      setType(editing.type || 'Van');
      setCapacity(editing.capacity ? String(editing.capacity) : '');
      setVehicleStatus(editing.status || 'available');
    } else {
      setPlateNumber(''); setType('Van'); setCapacity(''); setVehicleStatus('available');
    }
  }, [editing]);

  const openAdd  = () => { setEditing(null); setShowModal(true); };
  const openEdit = (v) => { setEditing(v); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plateNumber.trim() || !capacity) { toast.error('Plate number and capacity are required.'); return; }
    setSubmitting(true);
    try {
      if (editing) {
        await axios.put(`/api/vehicles/${editing._id}`, { plateNumber, type, capacity: Number(capacity), status: vehicleStatus });
        toast.success('Vehicle updated.');
      } else {
        await axios.post('/api/vehicles', { plateNumber, type, capacity: Number(capacity) });
        toast.success('Vehicle registered.');
      }
      mutate(); closeModal();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save vehicle.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axios.delete(`/api/vehicles/${deleteId}`);
      toast.success('Vehicle removed.'); mutate(); setDeleteId(null);
    } catch { toast.error('Failed to remove vehicle.'); }
    finally { setSubmitting(false); }
  };

  const vehicles = data?.vehicles || [];

  if (isLoading) return <div className="flex justify-center py-16"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-green-950 dark:text-white">Fleet Vehicles</p>
          <p className="text-xs text-gray-400 mt-0.5">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary gap-1.5 py-2">
          <Plus className="w-3.5 h-3.5" /> Add Vehicle
        </button>
      </div>

      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <div key={v._id} className="card p-5 border border-green-100 dark:border-dark-border space-y-4 hover:border-green-300 dark:hover:border-green-600 transition-all flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-dark-surface flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-green-950 dark:text-white font-mono tracking-wide">{v.plateNumber}</p>
                    <span className={`badge ${vehicleStatusBadge(v.status)} text-[9px] uppercase font-bold mt-0.5 inline-block`}>
                      {v.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(v)} className="btn btn-ghost p-1.5 hover:text-green-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteId(v._id)} className="btn btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-green-50 dark:border-dark-border mt-auto">
                <div className="flex items-center gap-2"><Car className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" /><span>Type: <strong className="text-green-950 dark:text-green-200">{v.type}</strong></span></div>
                <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" /><span>Capacity: <strong className="text-green-950 dark:text-green-200">{v.capacity} seats</strong></span></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 sm:p-10 md:p-16 text-center space-y-4">
          <Car className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
          <p className="text-sm font-bold text-green-950 dark:text-white">No vehicles yet</p>
          <p className="text-xs text-gray-400">Register your transport fleet vehicles.</p>
          <button onClick={openAdd} className="btn btn-primary px-6 py-2.5">Add First Vehicle</button>
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 w-full max-w-md space-y-5 shadow-modal">
            <div>
              <h2 className="text-base font-black text-green-950 dark:text-white">{editing ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Specify vehicle details, type, and seating capacity.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5"><label className="form-label block">Plate Number</label><input type="text" required placeholder="e.g. NDD 8910" className="form-input font-mono uppercase" value={plateNumber} onChange={e => setPlateNumber(e.target.value.toUpperCase())} /></div>
              <div className="space-y-1.5">
                <label className="form-label block">Vehicle Type</label>
                <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="Van">Van (e.g. Toyota Hiace)</option>
                  <option value="SUV">SUV (e.g. Montero Sport)</option>
                  <option value="AUV">AUV (e.g. Toyota Innova)</option>
                  <option value="Bus">Coaster / Bus</option>
                </select>
              </div>
              <div className="space-y-1.5"><label className="form-label block">Seating Capacity</label><input type="number" required min="1" placeholder="e.g. 12" className="form-input" value={capacity} onChange={e => setCapacity(e.target.value)} /></div>
              {editing && (
                <div className="space-y-1.5">
                  <label className="form-label block">Status</label>
                  <select className="form-select" value={vehicleStatus} onChange={e => setVehicleStatus(e.target.value)}>
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary flex-1 py-2.5">{submitting ? <Spinner className="w-5 h-5 mx-auto" /> : 'Save Vehicle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Remove Vehicle" message="Remove this vehicle from your fleet?" confirmText="Yes, Remove" cancelText="Cancel" loading={submitting} />
    </div>
  );
}

// ── Main Team page ─────────────────────────────────────────────────────────────
const TABS = [
  { key: 'drivers',  label: 'Coordinators & Drivers',  icon: Users, count: null },
  { key: 'vehicles', label: 'Vehicles', icon: Car,   count: null },
];

export default function AgencyTeamPage() {
  const [activeTab, setActiveTab] = useState('drivers');
  const { user } = useAuth();
  const { data: driversData }  = useSWR(user ? '/api/drivers'  : null, fetcher);
  const { data: vehiclesData } = useSWR(user ? '/api/vehicles' : null, fetcher);

  const counts = {
    drivers:  driversData?.drivers?.length  ?? '…',
    vehicles: vehiclesData?.vehicles?.length ?? '…',
  };

  return (
    <div className="w-full min-w-0 p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-white">Team & Fleet</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage your drivers roster and transportation fleet in one place.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-green-100 dark:border-dark-border">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent -mb-px ${
                active
                  ? 'border-green-600 dark:border-green-400 text-green-700 dark:text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                active ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-dark-surface text-gray-400'
              }`}>
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'drivers'  && <DriversSection />}
      {activeTab === 'vehicles' && <VehiclesSection />}
    </div>
  );
}


