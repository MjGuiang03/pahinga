'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Check, Plus, Trash2, Clock, X } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const activitiesList = ['Hiking', 'Diving', 'Surfing', 'Camping', 'Canyoneering', 'Island Hopping'];
const difficultyList  = ['Easy', 'Moderate', 'Difficult'];
const regionList      = ['Luzon', 'Visayas', 'Mindanao'];

// ── Helpers: serialize / parse itinerary ──────────────────────────────────────
function serializeItinerary(days) {
  return days
    .map((day, i) => {
      const lines = day.slots
        .filter(s => s.time || s.activity)
        .map(s => `${s.time || '00:00 AM'} - ${s.activity || ''}`)
        .join('\n');
      return `Day ${i + 1}:\n${lines}`;
    })
    .join('\n\n');
}

function parseItinerary(raw = '') {
  if (!raw.trim()) return [{ slots: [{ time: '', activity: '' }] }];
  const dayBlocks = raw.split(/\n\n+/);
  return dayBlocks.map(block => {
    const lines = block.split('\n').filter(l => !l.match(/^Day \d+:/));
    const slots = lines.map(line => {
      const match = line.match(/^(.+?) - (.+)$/);
      return match ? { time: match[1].trim(), activity: match[2].trim() } : { time: '', activity: line.trim() };
    });
    return { slots: slots.length ? slots : [{ time: '', activity: '' }] };
  });
}

// ── Helpers: inclusions as array ──────────────────────────────────────────────
function serializeInclusions(arr) {
  return arr.join(', ');
}

function parseInclusions(raw = '') {
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// ── Day-by-day itinerary builder ──────────────────────────────────────────────
function ItineraryBuilder({ days, setDays }) {
  const addDay = () => setDays(d => [...d, { slots: [{ time: '', activity: '' }] }]);
  const removeDay = (di) => setDays(d => d.filter((_, i) => i !== di));

  const addSlot = (di) =>
    setDays(d => d.map((day, i) =>
      i === di ? { ...day, slots: [...day.slots, { time: '', activity: '' }] } : day
    ));

  const removeSlot = (di, si) =>
    setDays(d => d.map((day, i) =>
      i === di ? { ...day, slots: day.slots.filter((_, j) => j !== si) } : day
    ));

  const updateSlot = (di, si, field, val) =>
    setDays(d => d.map((day, i) =>
      i === di
        ? { ...day, slots: day.slots.map((s, j) => j === si ? { ...s, [field]: val } : s) }
        : day
    ));

  return (
    <div className="space-y-3">
      {days.map((day, di) => (
        <div key={di} className="rounded-xl border border-green-100 dark:border-dark-border bg-green-50/20 dark:bg-dark-surface/30 overflow-hidden">
          {/* Day header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border">
            <span className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest">
              Day {di + 1}
            </span>
            {days.length > 1 && (
              <button
                type="button"
                onClick={() => removeDay(di)}
                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer border-none bg-transparent"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Slots */}
          <div className="p-3 space-y-2">
            {day.slots.map((slot, si) => (
              <div key={si} className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="08:00 AM"
                  value={slot.time}
                  onChange={e => updateSlot(di, si, 'time', e.target.value)}
                  className="form-input py-1.5 w-28 text-xs shrink-0"
                />
                <span className="text-gray-400 text-xs shrink-0">—</span>
                <input
                  type="text"
                  placeholder="e.g. Assembly at jump-off point"
                  value={slot.activity}
                  onChange={e => updateSlot(di, si, 'activity', e.target.value)}
                  className="form-input py-1.5 text-xs flex-1"
                />
                {day.slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(di, si)}
                    className="p-1 text-gray-300 hover:text-red-400 rounded transition-colors cursor-pointer border-none bg-transparent shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addSlot(di)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-400 hover:underline mt-1 cursor-pointer border-none bg-transparent"
            >
              <Plus className="w-3 h-3" /> Add time slot
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDay}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-green-300 dark:border-green-700 text-xs font-bold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors w-full justify-center cursor-pointer bg-transparent"
      >
        <Plus className="w-4 h-4" /> Add Day
      </button>
    </div>
  );
}

// ── Inclusions chip input ─────────────────────────────────────────────────────
function InclusionsInput({ inclusions, setInclusions }) {
  const [input, setInput] = useState('');

  const addItem = () => {
    const val = input.trim();
    if (val && !inclusions.includes(val)) {
      setInclusions([...inclusions, val]);
    }
    setInput('');
  };

  const removeItem = (item) => setInclusions(inclusions.filter(i => i !== item));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. Roundtrip transfers"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
          className="form-input py-1.5 text-xs flex-1"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors cursor-pointer border-none"
        >
          Add
        </button>
      </div>
      {inclusions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {inclusions.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-[11px] font-semibold">
              <Check className="w-3 h-3" />
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="text-green-500 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent p-0 leading-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-gray-400">Press Enter or click Add after each item.</p>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
function CreateOrEditListingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  const [title, setTitle]               = useState('');
  const [mountain, setMountain]         = useState('');
  const [difficulty, setDifficulty]     = useState('Easy');
  const [adventureTypes, setAdventureTypes] = useState([]);
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');
  const [price, setPrice]               = useState('');
  const [maxSlots, setMaxSlots]         = useState('');
  const [inclusions, setInclusions]     = useState([]); // array of strings
  const [itineraryDays, setItineraryDays] = useState([{ slots: [{ time: '', activity: '' }] }]);
  const [image, setImage]               = useState('🏔️');
  const [location, setLocation]         = useState('');
  const [region, setRegion]             = useState('Luzon');
  const [status, setStatus]             = useState('active');

  // Load existing data when editing
  useEffect(() => {
    if (editId && user) {
      setFetchingData(true);
      axios.get(`/api/adventures/${editId}`)
        .then((res) => {
          const adv = res.data.adventure;
          if (adv) {
            setTitle(adv.title || '');
            setMountain(adv.mountain || '');
            setDifficulty(adv.difficulty ? adv.difficulty.charAt(0).toUpperCase() + adv.difficulty.slice(1) : 'Easy');
            setAdventureTypes(adv.adventureType || []);
            setStartDate(adv.startDate ? new Date(adv.startDate).toISOString().split('T')[0] : '');
            setEndDate(adv.endDate ? new Date(adv.endDate).toISOString().split('T')[0] : '');
            setPrice(adv.price ? String(adv.price) : '');
            setMaxSlots(adv.maxSlots ? String(adv.maxSlots) : '');
            setInclusions(parseInclusions(adv.inclusions));
            setItineraryDays(parseItinerary(adv.itinerary));
            setImage(adv.image || '🏔️');
            setLocation(adv.location || '');
            setRegion(adv.region || 'Luzon');
            setStatus(adv.status || 'active');
          }
        })
        .catch(() => toast.error('Failed to load listing for edit.'))
        .finally(() => setFetchingData(false));
    }
  }, [editId, user]);

  const handleTypeToggle = (type) => {
    setAdventureTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be earlier than start date.'); return;
    }
    if (Number(price) < 0) {
      toast.error('Price cannot be negative.'); return;
    }
    if (Number(maxSlots) < 1) {
      toast.error('Slots must be at least 1.'); return;
    }
    if (adventureTypes.length === 0) {
      toast.error('Please select at least one adventure type.'); return;
    }

    setLoading(true);
    try {
      const payload = {
        title, mountain, difficulty,
        adventureType: adventureTypes,
        startDate, endDate,
        price: Number(price),
        maxSlots: Number(maxSlots),
        inclusions: serializeInclusions(inclusions),
        itinerary: serializeItinerary(itineraryDays),
        image, location, region, status,
      };

      if (editId) {
        await axios.put(`/api/adventures/${editId}`, payload);
        toast.success('Listing updated successfully!');
      } else {
        await axios.post('/api/adventures', payload);
        toast.success('Listing published successfully!');
      }
      router.push('/agency/listings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save listing.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Title */}
      <div className="space-y-1.5">
        <label className="form-label block">Adventure Title</label>
        <input
          type="text" required
          placeholder="e.g. Mt. Pulag Sea of Clouds Expedition"
          className="form-input"
          value={title} onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* Mountain & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="form-label block">Mountain / Hike Spot</label>
          <input type="text" placeholder="e.g. Mt. Pulag" className="form-input"
            value={mountain} onChange={e => setMountain(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="form-label block">Complete Location (City/Province)</label>
          <input type="text" required placeholder="e.g. Kabayan, Benguet" className="form-input"
            value={location} onChange={e => setLocation(e.target.value)} />
        </div>
      </div>

      {/* Region, Difficulty, Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="form-label block">Region</label>
          <select className="form-select" value={region} onChange={e => setRegion(e.target.value)}>
            {regionList.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="form-label block">Difficulty</label>
          <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            {difficultyList.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="form-label block">Listing Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="active">Active (Visible)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="form-label block">Start Date</label>
          <input type="date" required className="form-input text-xs"
            value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="form-label block">End Date</label>
          <input type="date" required className="form-input text-xs"
            value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* Price & Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="form-label block">Price per Participant (₱)</label>
          <input type="number" required min="0" placeholder="e.g. 2999" className="form-input"
            value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="form-label block">Maximum Slots (Pax)</label>
          <input type="number" required min="1" placeholder="e.g. 15" className="form-input"
            value={maxSlots} onChange={e => setMaxSlots(e.target.value)} />
        </div>
      </div>

      {/* Adventure Types */}
      <div className="space-y-2">
        <label className="form-label block">Adventure Types (Select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {activitiesList.map((type) => {
            const active = adventureTypes.includes(type);
            return (
              <button type="button" key={type} onClick={() => handleTypeToggle(type)}
                className={`tag ${active ? 'tag-active' : ''}`}>
                {active && <Check className="w-3.5 h-3.5 mr-1" />}
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inclusions */}
      <div className="space-y-2">
        <label className="form-label block">What&apos;s Included</label>
        <InclusionsInput inclusions={inclusions} setInclusions={setInclusions} />
      </div>

      {/* Itinerary */}
      <div className="space-y-2">
        <label className="form-label block">Day-by-day Itinerary</label>
        <ItineraryBuilder days={itineraryDays} setDays={setItineraryDays} />
      </div>

      {/* Submit */}
      <button
        type="submit" disabled={loading}
        className="btn btn-primary w-full py-3.5 text-center flex items-center justify-center"
      >
        {loading ? <Spinner className="w-5 h-5" /> : (
          <span>{editId ? 'Save Changes' : 'Publish Listing'}</span>
        )}
      </button>
    </form>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export default function CreateOrEditListingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'agency')) {
      router.push('/login?redirect=/agency/listings/create');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Spinner className="w-12 h-12" /></div>;
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <button onClick={() => router.push('/agency/listings')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-green-600 border-none bg-transparent cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Listings</span>
      </button>

      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-green-100">
          {/* editId resolved client-side inside Suspense */}
          Create / Edit Listing
        </h1>
        <p className="text-xs text-gray-500">Provide trip schedules, prices, and itineraries to publish.</p>
      </div>

      <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>}>
        <CreateOrEditListingForm />
      </Suspense>
    </div>
  );
}
