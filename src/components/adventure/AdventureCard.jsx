import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Calendar, Users, Mountain } from 'lucide-react';
import Badge from '../common/Badge';
import { formatPrice, formatShortDate } from '@/utils/formatters';

export default function AdventureCard({ adventure }) {
  const id = adventure._id || adventure.id;
  const {
    title,
    location,
    difficulty,
    rating = 4.8,
    price,
    startDate,
    slotsRemaining = 10,
    agencyId,
    image,
  } = adventure;

  const agencyName = typeof agencyId === 'object' ? agencyId?.orgName : 'Pahinga Partner';
  const displayDate = startDate ? formatShortDate(startDate) : 'Flexible Dates';

  return (
    <Link href={`/adventure/${id}`} className="card card-hover flex flex-col overflow-hidden no-underline text-inherit group h-full">
      {/* Cover image / placeholder */}
      <div className="h-44 bg-green-50 dark:bg-dark-surface flex items-center justify-center relative select-none">
        {image ? (
          <span className="text-5xl">{image}</span>
        ) : (
          <Mountain className="w-12 h-12 text-green-200 dark:text-green-600" />
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={difficulty}>{difficulty}</Badge>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Agency name small caps */}
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">
          {agencyName}
        </div>

        {/* Adventure title */}
        <h3 className="text-base font-bold text-green-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {/* Date & Rating */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 mt-auto">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span>{displayDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-green-900 dark:text-green-100">{rating}</span>
          </div>
        </div>

        {/* Price & Slots Remaining */}
        <div className="flex items-center justify-between pt-3 border-t border-green-50 dark:border-dark-border">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" />
            <span>{slotsRemaining} slots left</span>
          </div>
          <span className="text-base font-extrabold text-green-600 dark:text-green-400">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
