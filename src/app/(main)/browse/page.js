'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Compass, Filter, RefreshCw, Star, MapPin, Calendar, ArrowUpDown } from 'lucide-react';
import AdventureCard from '@/components/adventure/AdventureCard';
import Spinner from '@/components/common/Spinner';

const fetcher = (url) => axios.get(url).then(res => res.data);

const activities = ['Hiking', 'Diving', 'Surfing', 'Camping', 'Canyoneering', 'Island Hopping'];
const difficulties = ['Easy', 'Moderate', 'Difficult'];
const regions = ['All regions', 'Luzon', 'Visayas', 'Mindanao'];

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All regions');
  const [sortBy, setSortBy] = useState('newest');
  
  // Set filters from query parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('search')) setSearchQuery(params.get('search'));
      if (params.get('type')) setSelectedType(params.get('type'));
      if (params.get('date')) setSelectedDate(params.get('date'));
      if (params.get('region')) setSelectedRegion(params.get('region'));
    }
  }, []);

  // Construct query string for API
  const getQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedType) params.set('type', selectedType);
    if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (selectedDate) params.set('date', selectedDate);
    if (selectedRegion && selectedRegion !== 'All regions') params.set('region', selectedRegion);
    return params.toString();
  };

  const { data, error, isLoading } = useSWR(`/api/adventures?${getQueryString()}`, fetcher);
  const adventures = data?.adventures || [];

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedDifficulty('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedDate('');
    setSelectedRegion('All regions');
    setSortBy('newest');
  };

  // Sort adventures
  const sortedAdventures = [...adventures].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="container-main py-10">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Sidebar Filter */}
        <aside className="w-full md:w-[280px] md:sticky md:top-20 bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border p-5 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-green-50 dark:border-dark-border pb-3">
            <h3 className="text-sm font-bold text-green-950 dark:text-green-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Filter adventures</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Search bar inside sidebar */}
          <div className="space-y-1.5">
            <label className="form-label block">Search keyword</label>
            <input
              type="text"
              placeholder="Summit, region, agency..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <label className="form-label block">Activity type</label>
            <div className="flex flex-wrap gap-1.5">
              {activities.map((act) => (
                <button
                  key={act}
                  onClick={() => setSelectedType(selectedType === act ? '' : act)}
                  className={`tag text-xs px-3 py-1 ${selectedType === act ? 'tag-active' : ''}`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="form-label block">Difficulty</label>
            <div className="flex gap-1.5">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? '' : diff)}
                  className={`tag text-xs px-3 py-1 flex-1 text-center justify-center ${
                    selectedDifficulty === diff ? 'tag-active' : ''
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="form-label block">Price range (₱)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min ₱"
                className="form-input text-xs"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max ₱"
                className="form-input text-xs"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="form-label block">Date</label>
            <input
              type="date"
              className="form-input text-xs"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Region */}
          <div className="space-y-1.5">
            <label className="form-label block">Location</label>
            <select
              className="form-select text-xs"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 w-full space-y-6">
          {/* Top Sort / Result Counter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border p-4 rounded-xl">
            <div className="text-sm font-semibold text-green-950 dark:text-green-100">
              {isLoading ? (
                <span>Searching adventures...</span>
              ) : (
                <span>{sortedAdventures.length} adventures found</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <select
                className="form-select py-1 px-3 text-xs w-full sm:w-[160px]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {/* Adventure List Grid */}
          {isLoading ? (
            <div className="py-20 text-center">
              <Spinner className="w-10 h-10 mx-auto" />
            </div>
          ) : sortedAdventures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAdventures.map((adv) => (
                <AdventureCard key={adv._id} adventure={adv} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-12 text-center">
              <Compass className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto mb-3" />
              <h4 className="text-base font-bold text-green-900 dark:text-green-100 mb-1">
                No adventures match your filters
              </h4>
              <p className="w-full min-w-0 text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                Try clearing some search settings or typing a different keyword to find an escape.
              </p>
              <button onClick={handleClearFilters} className="btn btn-primary btn-sm">
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

