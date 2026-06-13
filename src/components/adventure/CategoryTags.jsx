'use client';

import React from 'react';
import Tag from '../common/Tag';
import { ADVENTURE_TYPES } from '@/utils/constants';

export default function CategoryTags({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2.5 mb-8 overflow-x-auto pb-2">
      <Tag 
        active={!activeCategory} 
        onClick={() => onCategoryChange && onCategoryChange(null)}
      >
        All Adventures
      </Tag>
      {ADVENTURE_TYPES.map((cat) => (
        <Tag
          key={cat.id}
          active={activeCategory === cat.id}
          onClick={() => onCategoryChange && onCategoryChange(cat.id)}
        >
          {cat.label}
        </Tag>
      ))}
    </div>
  );
}
