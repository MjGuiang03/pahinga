import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/db';
import Adventure from '@/backend/models/Adventure';
import Agency from '@/backend/models/Agency';

// GET /api/seed — inserts dummy adventures for visualization
// Only runs if fewer than 5 adventures exist (idempotent)
export async function GET() {
  try {
    await dbConnect();

    const existing = await Adventure.countDocuments({});
    if (existing >= 5) {
      return NextResponse.json({ message: `Skipped — ${existing} adventures already exist. Delete them or raise the threshold to re-seed.` });
    }

    // Use the first available agency
    const agency = await Agency.findOne({}).lean();
    if (!agency) {
      return NextResponse.json(
        { error: 'No agency found. Register an agency account first.' },
        { status: 400 }
      );
    }

    const agencyId = agency._id;

    // Helper — same-day date offset
    const dayOffset = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      d.setHours(5, 0, 0, 0);
      return d;
    };
    const endOfDay = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      d.setHours(18, 0, 0, 0);
      return d;
    };
    const multiEnd = (start, extra) => {
      const d = new Date();
      d.setDate(d.getDate() + start + extra);
      d.setHours(14, 0, 0, 0);
      return d;
    };

    const seeds = [
      // ── DAY HIKES ──
      {
        agencyId,
        title: 'Mt. Batulao Day Hike Tour',
        mountain: 'Mt. Batulao',
        difficulty: 'easy',
        adventureType: ['Hiking'],
        startDate: dayOffset(3),
        endDate: endOfDay(3),
        price: 1200,
        maxSlots: 20,
        slotsRemaining: 18,
        location: 'Nasugbu, Batangas',
        region: 'Luzon',
        image: '⛰️',
        rating: 4.6,
        reviewCount: 34,
        status: 'active',
        inclusions: 'Trail guide, Registration fee, Certificate of ascent',
        itinerary: '05:00 AM - Assembly at jump-off\n06:30 AM - Start trek\n09:00 AM - Summit\n11:00 AM - Descent\n01:00 PM - Back at base',
      },
      {
        agencyId,
        title: 'Mt. Ulap Mossy Forest Day Hike',
        mountain: 'Mt. Ulap',
        difficulty: 'moderate',
        adventureType: ['Hiking'],
        startDate: dayOffset(5),
        endDate: endOfDay(5),
        price: 1800,
        maxSlots: 15,
        slotsRemaining: 12,
        location: 'Itogon, Benguet',
        region: 'Luzon',
        image: '🌲',
        rating: 4.8,
        reviewCount: 61,
        status: 'active',
        inclusions: 'Guide fee, Environmental fee, Lunch pack',
        itinerary: '04:00 AM - Departure from Baguio\n06:00 AM - Jump-off\n09:30 AM - Summit\n12:00 PM - Descent\n03:00 PM - Return',
      },
      {
        agencyId,
        title: 'Pico de Loro Day Hike Adventure',
        mountain: 'Pico de Loro',
        difficulty: 'moderate',
        adventureType: ['Hiking'],
        startDate: dayOffset(7),
        endDate: endOfDay(7),
        price: 1500,
        maxSlots: 18,
        slotsRemaining: 9,
        location: 'Ternate, Cavite',
        region: 'Luzon',
        image: '🏔️',
        rating: 4.5,
        reviewCount: 48,
        status: 'active',
        inclusions: 'Certified guide, DENR registration, Water refill station',
        itinerary: '05:00 AM - Trailhead assembly\n08:30 AM - Summit\n10:00 AM - Rock formation viewpoint\n01:00 PM - Back at base',
      },
      {
        agencyId,
        title: 'Mt. Talamitam Easy Summit',
        mountain: 'Mt. Talamitam',
        difficulty: 'easy',
        adventureType: ['Hiking'],
        startDate: dayOffset(4),
        endDate: endOfDay(4),
        price: 950,
        maxSlots: 25,
        slotsRemaining: 22,
        location: 'Nasugbu, Batangas',
        region: 'Luzon',
        image: '🌄',
        rating: 4.3,
        reviewCount: 27,
        status: 'active',
        inclusions: 'Local guide, Basic first aid kit',
        itinerary: '06:00 AM - Start trek\n08:30 AM - Summit\n10:30 AM - Descent\n12:00 PM - End of tour',
      },
      // ── MULTI-DAY ──
      {
        agencyId,
        title: 'Mt. Pulag Sea of Clouds Expedition',
        mountain: 'Mt. Pulag',
        difficulty: 'moderate',
        adventureType: ['Hiking', 'Camping'],
        startDate: dayOffset(10),
        endDate: multiEnd(10, 2),
        price: 4500,
        maxSlots: 12,
        slotsRemaining: 7,
        location: 'Kabayan, Benguet',
        region: 'Luzon',
        image: '🏕️',
        rating: 4.9,
        reviewCount: 112,
        status: 'active',
        inclusions: 'Round trip van, Guide & porter, Camping gear, All meals, DENR permit',
        itinerary: 'Day 1: Manila → Base camp\nDay 2: 02:00 AM - Summit assault, 05:30 AM - Sea of clouds sunrise\nDay 3: Descent & return',
      },
      {
        agencyId,
        title: 'Mt. Apo Summit Challenge',
        mountain: 'Mt. Apo',
        difficulty: 'difficult',
        adventureType: ['Hiking', 'Camping'],
        startDate: dayOffset(20),
        endDate: multiEnd(20, 3),
        price: 8500,
        maxSlots: 8,
        slotsRemaining: 4,
        location: 'Kidapawan, Cotabato',
        region: 'Mindanao',
        image: '🗻',
        rating: 5.0,
        reviewCount: 89,
        status: 'active',
        inclusions: 'Flight allowance, Guide & porter, Camping equipment, All meals, PAMB permit',
        itinerary: 'Day 1: Trailhead → Lake Venado camp\nDay 2: Summit day\nDay 3: Crater lake visit\nDay 4: Descent',
      },
      // ── DIVING ──
      {
        agencyId,
        title: 'Coron Island Reef Diving Package',
        mountain: '',
        difficulty: 'easy',
        adventureType: ['Diving', 'Island Hopping'],
        startDate: dayOffset(6),
        endDate: endOfDay(6),
        price: 4500,
        maxSlots: 10,
        slotsRemaining: 6,
        location: 'Coron, Palawan',
        region: 'Luzon',
        image: '🤿',
        rating: 4.9,
        reviewCount: 75,
        status: 'active',
        inclusions: 'Boat transfer, Dive equipment, Dive master, Lunch, Marine park fee',
        itinerary: '07:00 AM - Boat departure\n09:00 AM - Dive site 1 (wreck)\n11:00 AM - Dive site 2 (coral garden)\n01:00 PM - Island picnic\n04:00 PM - Return',
      },
      // ── SURFING ──
      {
        agencyId,
        title: 'Baler Surfing Clinic & Lessons',
        mountain: '',
        difficulty: 'easy',
        adventureType: ['Surfing'],
        startDate: dayOffset(8),
        endDate: endOfDay(8),
        price: 1800,
        maxSlots: 12,
        slotsRemaining: 10,
        location: 'Baler, Aurora',
        region: 'Luzon',
        image: '🏄',
        rating: 4.7,
        reviewCount: 43,
        status: 'active',
        inclusions: 'Board & leash rental, Rash guard, Surf instructor, Video clips',
        itinerary: '07:00 AM - Beach orientation\n08:00 AM - Beginner lessons\n10:00 AM - Free surf\n12:00 PM - End of session',
      },
      // ── CAMPING ──
      {
        agencyId,
        title: 'Lake Holon Camping Retreat',
        mountain: 'Mt. Melibengoy',
        difficulty: 'moderate',
        adventureType: ['Camping', 'Hiking'],
        startDate: dayOffset(14),
        endDate: multiEnd(14, 1),
        price: 3200,
        maxSlots: 15,
        slotsRemaining: 11,
        location: "T'boli, South Cotabato",
        region: 'Mindanao',
        image: '⛺',
        rating: 4.8,
        reviewCount: 56,
        status: 'active',
        inclusions: 'Tent, Sleeping bag, Guide, All meals, Tribal permit',
        itinerary: 'Day 1: Trek 4–5 hrs to lake, set up camp, sunset view\nDay 2: Morning swim, pack up, descent',
      },
    ];

    await Adventure.insertMany(seeds);

    return NextResponse.json({
      message: `✅ Seeded ${seeds.length} adventures successfully.`,
      count: seeds.length,
    });
  } catch (err) {
    console.error('Seed error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
