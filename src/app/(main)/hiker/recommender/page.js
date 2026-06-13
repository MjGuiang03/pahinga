'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { Compass, Sparkles, RefreshCw, ArrowRight, ArrowLeft, Check, Flame } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import AdventureCard from '@/components/adventure/AdventureCard';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function TripRecommenderPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Difficulty, 2: Region, 3: Budget, 4: Results

  // Quiz Choices
  const [difficulty, setDifficulty] = useState('Moderate');
  const [region, setRegion] = useState('Anywhere');
  const [budget, setBudget] = useState('mid'); // budget, mid, premium

  // Fetch all active adventures
  const { data, isLoading } = useSWR('/api/adventures', fetcher);

  const resetQuiz = () => {
    setDifficulty('Moderate');
    setRegion('Anywhere');
    setBudget('mid');
    setStep(1);
  };

  const getFilteredRecommendations = () => {
    if (!data?.adventures) return [];

    return data.adventures
      .map((adv) => {
        let score = 0;

        // Difficulty Match (33 points)
        if (adv.difficulty?.toLowerCase() === difficulty.toLowerCase()) {
          score += 34;
        }

        // Region Match (33 points)
        if (region === 'Anywhere' || adv.region?.toLowerCase() === region.toLowerCase()) {
          score += 33;
        }

        // Budget Match (33 points)
        // budget: < 1500, mid: 1500-3000, premium: > 3000
        const price = adv.price;
        if (budget === 'budget' && price <= 1500) {
          score += 33;
        } else if (budget === 'mid' && price > 1500 && price <= 3000) {
          score += 33;
        } else if (budget === 'premium' && price > 3000) {
          score += 33;
        }

        return { ...adv, matchScore: score };
      })
      .filter(adv => adv.matchScore > 30) // Only show if at least one match
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const recommendations = getFilteredRecommendations();

  return (
    <div className="container-main py-12 max-w-4xl mx-auto flex-1 flex flex-col justify-center">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-dark-surface text-green-700 dark:text-green-400 text-xs font-bold select-none">
          <Sparkles className="w-3.5 h-3.5 fill-green-600 dark:fill-green-400" />
          <span>Smart Match Finder</span>
        </div>
        <h1 className="text-2xl font-black text-green-950 dark:text-green-100">Find your perfect Pahinga escape</h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">Answer three quick preferences and let our recommendation engine matching algorithm find your ideal getaway.</p>
      </div>

      {/* STEP 1: Difficulty */}
      {step === 1 && (
        <div className="card border border-green-100 dark:border-dark-border p-8 space-y-6 max-w-xl mx-auto w-full">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Question 1 of 3</span>
            <h2 className="text-base font-bold text-green-950 dark:text-green-100">What is your hiking skill level?</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'Easy', label: 'Easy (Beginner Trails)', desc: 'Gentle slopes, suitable for casual hikers and children.' },
              { id: 'Moderate', label: 'Moderate (Standard Climbs)', desc: 'Requires decent stamina, some steep ridge lines.' },
              { id: 'Difficult', label: 'Difficult (Major Peaks)', desc: 'Strenuous multi-day trails for experienced mountaineers.' },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setDifficulty(opt.id)}
                className={`card p-4 border cursor-pointer select-none transition-all flex items-start gap-4 ${
                  difficulty === opt.id
                    ? 'border-green-600 bg-green-50/10 dark:border-green-400'
                    : 'border-green-100 dark:border-dark-border hover:border-green-200'
                }`}
              >
                <div className="w-5 h-5 rounded-full border border-green-300 dark:border-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {difficulty === opt.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-green-600 dark:bg-green-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-green-950 dark:text-green-100">{opt.label}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setStep(2)} className="btn btn-primary w-full py-3 gap-2">
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Region */}
      {step === 2 && (
        <div className="card border border-green-100 dark:border-dark-border p-8 space-y-6 max-w-xl mx-auto w-full">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Question 2 of 3</span>
            <h2 className="text-base font-bold text-green-950 dark:text-green-100">Where do you want to explore?</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'Luzon', label: 'Luzon Island', icon: '🏔️' },
              { id: 'Visayas', label: 'Visayas Peaks', icon: '🏝️' },
              { id: 'Mindanao', label: 'Mindanao Highlands', icon: '🌲' },
              { id: 'Anywhere', label: 'Anywhere is fine', icon: '🗺️' },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setRegion(opt.id)}
                className={`card p-4 border cursor-pointer select-none transition-all text-center space-y-2 flex flex-col items-center ${
                  region === opt.id
                    ? 'border-green-600 bg-green-50/10 dark:border-green-400'
                    : 'border-green-100 dark:border-dark-border hover:border-green-200'
                }`}
              >
                <span className="text-3xl">{opt.icon}</span>
                <h4 className="text-xs font-bold text-green-950 dark:text-green-100">{opt.label}</h4>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="btn btn-secondary flex-1 py-3 gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary flex-1 py-3 gap-2">
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Budget */}
      {step === 3 && (
        <div className="card border border-green-100 dark:border-dark-border p-8 space-y-6 max-w-xl mx-auto w-full">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Question 3 of 3</span>
            <h2 className="text-base font-bold text-green-950 dark:text-green-100">What is your target budget?</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'budget', label: 'Budget (Under ₱1,500)', desc: 'Affordable day tours and accessible hikes.' },
              { id: 'mid', label: 'Mid-range (₱1,500 - ₱3,000)', desc: 'Standard package inclusive of van transport and local fees.' },
              { id: 'premium', label: 'Premium (Above ₱3,000)', desc: 'Major multi-day summits or comprehensive packages.' },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setBudget(opt.id)}
                className={`card p-4 border cursor-pointer select-none transition-all flex items-start gap-4 ${
                  budget === opt.id
                    ? 'border-green-600 bg-green-50/10 dark:border-green-400'
                    : 'border-green-100 dark:border-dark-border hover:border-green-200'
                }`}
              >
                <div className="w-5 h-5 rounded-full border border-green-300 dark:border-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {budget === opt.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-green-600 dark:bg-green-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-green-950 dark:text-green-100">{opt.label}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="btn btn-secondary flex-1 py-3 gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button onClick={() => setStep(4)} className="btn btn-primary flex-1 py-3 gap-2">
              <span>View Matches</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Results */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Quick choices summary */}
          <div className="card p-4 border border-green-100 dark:border-dark-border flex flex-wrap items-center justify-between gap-4 bg-green-50/10">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="badge badge-green">Difficulty: {difficulty}</span>
              <span className="badge badge-green">Region: {region}</span>
              <span className="badge badge-green">Budget: {budget === 'budget' ? '< ₱1.5k' : budget === 'mid' ? '₱1.5k - ₱3k' : '> ₱3k'}</span>
            </div>
            <button
              onClick={resetQuiz}
              className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 hover:underline border-none bg-transparent cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Start over</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="w-10 h-10" />
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((adv) => (
                <div key={adv._id} className="relative">
                  {/* Match Score Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow">
                    <Flame className="w-3 h-3 fill-white" />
                    <span>{adv.matchScore}% Match</span>
                  </div>
                  <AdventureCard adventure={adv} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-16 text-center max-w-md mx-auto space-y-4">
              <Compass className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
              <h3 className="text-lg font-bold text-green-950 dark:text-green-100 font-bold">No exact matches</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We couldn&apos;t find any adventure matching all your specifications. Try loosening your budget or choosing &ldquo;Anywhere&rdquo; region.
              </p>
              <button onClick={resetQuiz} className="btn btn-primary px-6 py-2.5">
                Adjust Preferences
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
