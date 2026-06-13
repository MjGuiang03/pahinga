import React from 'react';
import AdventureCard from './AdventureCard';

export default function AdventureGrid({ adventures = [] }) {
  if (adventures.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No adventures found matching criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {adventures.map((adventure) => (
        <AdventureCard key={adventure.id} adventure={adventure} />
      ))}
    </div>
  );
}
