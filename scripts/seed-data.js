import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) return;
  const key = trimmed.slice(0, eqIndex).trim();
  const val = trimmed.slice(eqIndex + 1).trim();
  if (!process.env[key]) process.env[key] = val;
});

const { default: mongoose } = await import('mongoose');
const { default: bcrypt } = await import('bcryptjs');

await mongoose.connect(process.env.MONGODB_URI);

// Import models
const User = (await import('../src/backend/models/User.js')).default;
const Agency = (await import('../src/backend/models/Agency.js')).default;
const Adventure = (await import('../src/backend/models/Adventure.js')).default;
const Booking = (await import('../src/backend/models/Booking.js')).default;
const Driver = (await import('../src/backend/models/Driver.js')).default;
const Vehicle = (await import('../src/backend/models/Vehicle.js')).default;
const Review = (await import('../src/backend/models/Review.js')).default;
const Notification = (await import('../src/backend/models/Notification.js')).default;

console.log('Clearing database...');
await User.deleteMany({});
await Agency.deleteMany({});
await Adventure.deleteMany({});
await Booking.deleteMany({});
await Driver.deleteMany({});
await Vehicle.deleteMany({});
await Review.deleteMany({});
await Notification.deleteMany({});

console.log('Seeding users...');
const adminPassword = await bcrypt.hash('admin123', 12);
const hikerPassword = await bcrypt.hash('hiker123', 12);
const agencyPassword = await bcrypt.hash('agency123', 12);
const driverPassword = await bcrypt.hash('driver123', 12);

// Admin
const admin = await User.create({
  name: 'Platform Admin',
  email: 'admin@pahinga.com',
  password: adminPassword,
  role: 'admin',
});

// Hikers
const hiker1 = await User.create({
  name: 'Juan dela Cruz',
  email: 'hiker@pahinga.com',
  password: hikerPassword,
  role: 'hiker',
  phone: '09171234567',
});

const hiker2 = await User.create({
  name: 'Maria Clara',
  email: 'hiker2@pahinga.com',
  password: hikerPassword,
  role: 'hiker',
  phone: '09187654321',
});

// Agencies (Users & Profiles)
const agency1User = await User.create({
  name: 'Lito Lapid',
  email: 'trailseekers@pahinga.com',
  password: agencyPassword,
  role: 'agency',
  phone: '09191112222',
});

const agency1 = await Agency.create({
  userId: agency1User._id,
  orgName: 'Trail Seekers PH',
  contactPerson: 'Lito Lapid',
  description: 'Your premier guide to northern Luzon mountains. Specializing in Cordillera summits.',
  status: 'approved',
  approvedAt: new Date(),
});

const agency2User = await User.create({
  name: 'Darna Stone',
  email: 'seatosummit@pahinga.com',
  password: agencyPassword,
  role: 'agency',
  phone: '09193334444',
});

const agency2 = await Agency.create({
  userId: agency2User._id,
  orgName: 'Sea To Summit PH',
  contactPerson: 'Darna Stone',
  description: 'Connecting Philippine seas and summits. Expert guided dives and multi-day treks.',
  status: 'approved',
  approvedAt: new Date(),
});

const agency3User = await User.create({
  name: 'Captain Barbell',
  email: 'peakescapes@pahinga.com',
  password: agencyPassword,
  role: 'agency',
  phone: '09195556666',
});

const agency3 = await Agency.create({
  userId: agency3User._id,
  orgName: 'Peak Escapes Co.',
  contactPerson: 'Captain Barbell',
  description: 'Adventure and eco-escapes in southern Luzon and Visayas.',
  status: 'pending',
});

// Drivers (Users & Profiles)
const driver1User = await User.create({
  name: 'Mang Tomas',
  email: 'driver1@pahinga.com',
  password: driverPassword,
  role: 'driver',
  phone: '09228889999',
});

const driver1 = await Driver.create({
  agencyId: agency1._id,
  name: 'Mang Tomas',
  licenseNumber: 'N01-12-345678',
  phone: '09228889999',
  userId: driver1User._id,
  status: 'available',
});

const driver2User = await User.create({
  name: 'Kuya Jobert',
  email: 'driver2@pahinga.com',
  password: driverPassword,
  role: 'driver',
  phone: '09227778888',
});

const driver2 = await Driver.create({
  agencyId: agency2._id,
  name: 'Kuya Jobert',
  licenseNumber: 'N01-87-654321',
  phone: '09227778888',
  userId: driver2User._id,
  status: 'available',
});

// Vehicles
const vehicle1 = await Vehicle.create({
  agencyId: agency1._id,
  plateNumber: 'NDD 8910',
  type: 'Van',
  capacity: 12,
  status: 'available',
});

const vehicle2 = await Vehicle.create({
  agencyId: agency2._id,
  plateNumber: 'AAA 1234',
  type: 'SUV',
  capacity: 7,
  status: 'available',
});

console.log('Seeding adventures...');
const adv1 = await Adventure.create({
  agencyId: agency1._id,
  title: 'Mt. Pulag Sea of Clouds Hike',
  mountain: 'Mt. Pulag',
  adventureType: ['Hiking', 'Camping'],
  difficulty: 'moderate',
  startDate: new Date('2026-06-25T04:00:00Z'),
  endDate: new Date('2026-06-26T18:00:00Z'),
  price: 2999,
  maxSlots: 15,
  slotsRemaining: 12,
  inclusions: 'Roundtrip van transfers from Manila, Local guide fees, Environmental permits, Camping meals, Camping tent sharing, Peak coordination, Tour coordinator.',
  itinerary: 'Day 1:\n01:00 AM - Departure from Manila\n08:00 AM - Arrival in Bokod, Benguet (Breakfast)\n10:00 AM - Orientation at DENR Station\n12:00 PM - Proceed to Ranger Station (Homestay check-in)\n06:00 PM - Dinner and Socials\n\nDay 2:\n01:00 AM - Wake-up call & light breakfast\n02:00 AM - Start trek to Peak 3\n05:30 AM - Arrival at Summit, Sunrise viewing & Sea of Clouds\n07:30 AM - Descent back to Ranger Station\n11:00 AM - Early lunch, check-out\n02:00 PM - Side trip in Baguio City\n10:00 PM - Arrival in Manila',
  location: 'Kabayan, Benguet',
  region: 'Luzon',
  rating: 4.8,
  reviewCount: 1,
});

const adv2 = await Adventure.create({
  agencyId: agency1._id,
  title: 'Mt. Batulao Day Hike Tour',
  mountain: 'Mt. Batulao',
  adventureType: ['Hiking'],
  difficulty: 'easy',
  startDate: new Date('2026-06-28T05:00:00Z'),
  endDate: new Date('2026-06-28T17:00:00Z'),
  price: 1200,
  maxSlots: 20,
  slotsRemaining: 19,
  inclusions: 'Roundtrip transfers from Manila, Registration fees, Guide fees, Pahinga bag tag, Personalized climb coordinator.',
  itinerary: '03:00 AM - Assembly in Manila\n03:30 AM - ETD to Nasugbu, Batangas\n06:00 AM - ETA Evercrest (Jump-off point, register, final prep)\n06:30 AM - Start trek via New Trail\n09:30 AM - ETA Summit (Photo ops, rest)\n11:00 AM - Start descent via Old Trail\n01:30 PM - Back to jump-off (Lunch, wash-up)\n03:30 PM - ETD to Manila\n07:00 PM - ETA Manila',
  location: 'Nasugbu, Batangas',
  region: 'Luzon',
  rating: 0,
  reviewCount: 0,
});

const adv3 = await Adventure.create({
  agencyId: agency2._id,
  title: 'Mt. Apo Peak Challenge',
  mountain: 'Mt. Apo',
  adventureType: ['Hiking', 'Camping'],
  difficulty: 'difficult',
  startDate: new Date('2026-07-05T06:00:00Z'),
  endDate: new Date('2026-07-07T18:00:00Z'),
  price: 6500,
  maxSlots: 8,
  slotsRemaining: 7,
  inclusions: 'Climb permits, Guide fees, Porter service for common gears, Base camp meals, Certificate of completion, Event jersey.',
  itinerary: 'Day 1:\n05:00 AM - Meetup at Davao City\n08:00 AM - ETA Kapatagan (Jump-off), Registration\n09:00 AM - Start trek\n04:00 PM - ETA Camp 1 (Pitch tents, dinner)\n\nDay 2:\n03:00 AM - Assault trek to Summit via Boulders\n07:00 AM - ETA Mt. Apo Summit (2,954 MASL)\n10:00 AM - Start descent to Camp 2\n04:00 PM - ETA Camp 2\n\nDay 3:\n07:00 AM - Final descent to Kidapawan Trail\n02:00 PM - Jump-off point (Wash-up, awarding)\n05:00 PM - ETD to Davao City',
  location: 'Davao City',
  region: 'Mindanao',
  rating: 4.0,
  reviewCount: 1,
});

const adv4 = await Adventure.create({
  agencyId: agency2._id,
  title: 'Coron Coron Island Reef Diving',
  mountain: 'Coron Reefs',
  adventureType: ['Diving'],
  difficulty: 'moderate',
  startDate: new Date('2026-06-20T08:00:00Z'),
  endDate: new Date('2026-06-20T17:00:00Z'),
  price: 4500,
  maxSlots: 10,
  slotsRemaining: 7,
  inclusions: 'Licensed dive master, Full scuba gear rental, Boat transfers, Picnic buffet lunch, Marine park sanctuary fees.',
  itinerary: '08:00 AM - Meetup at Coron Town Harbor\n08:30 AM - Boat departure to Barracuda Lake\n09:00 AM - First Dive: Barracuda Lake (Thermocline experience)\n11:00 AM - Second Dive: Skeleton Wreck (WWII shipwreck)\n12:30 PM - Beach picnic lunch at Banol Beach\n02:30 PM - Third Dive: Siete Pecados Marine Park\n04:30 PM - Return to town harbor',
  location: 'Coron, Palawan',
  region: 'Visayas',
  rating: 5.0,
  reviewCount: 1,
});

const adv5 = await Adventure.create({
  agencyId: agency1._id,
  title: 'Mt. Ulap Eco-Trail Hike',
  mountain: 'Mt. Ulap',
  adventureType: ['Hiking'],
  difficulty: 'easy',
  startDate: new Date('2026-06-30T04:00:00Z'),
  endDate: new Date('2026-06-30T16:00:00Z'),
  price: 1800,
  maxSlots: 25,
  slotsRemaining: 25,
  inclusions: 'Manila-Benguet roundtrip transfers, local registration, guide fees, coordinator.',
  itinerary: '02:00 AM - departure Manila\n07:00 AM - arrival Itogon, Benguet\n08:00 AM - start trek Gungal Rock\n12:00 PM - summit lunch\n03:00 PM - descent jump-off\n09:00 PM - return Manila',
  location: 'Itogon, Benguet',
  region: 'Luzon',
  rating: 0,
  reviewCount: 0,
});

console.log('Seeding bookings...');
// Booking 1: Juan booking Mt. Pulag, 2 pax, pending
await Booking.create({
  referenceNumber: 'PH-2026-0001',
  hikerId: hiker1._id,
  adventureId: adv1._id,
  agencyId: agency1._id,
  paxCount: 2,
  totalAmount: 5998,
  pickupNeeded: true,
  pickupAddress: 'Quezon City Circle, Manila',
  status: 'pending',
  paymentMethod: 'gcash',
  paymentStatus: 'paid',
  gcashReference: '992817264882',
});

// Booking 2: Juan booking Mt. Batulao, 1 pax, confirmed with assigned driver
await Booking.create({
  referenceNumber: 'PH-2026-0002',
  hikerId: hiker1._id,
  adventureId: adv2._id,
  agencyId: agency1._id,
  paxCount: 1,
  totalAmount: 1200,
  pickupNeeded: true,
  pickupAddress: 'MOA Arena Main Entrance, Pasay',
  status: 'confirmed',
  paymentMethod: 'card',
  paymentStatus: 'paid',
  cardNumber: '4111',
  driverId: driver1._id,
  vehicleId: vehicle1._id,
  transportStatus: 'assigned',
  pickupTime: new Date('2026-06-28T03:00:00Z'),
});

// Booking 3: Maria booking Apo Peak, 1 pax, completed
await Booking.create({
  referenceNumber: 'PH-2026-0003',
  hikerId: hiker2._id,
  adventureId: adv3._id,
  agencyId: agency2._id,
  paxCount: 1,
  totalAmount: 6500,
  pickupNeeded: false,
  status: 'completed',
  paymentMethod: 'gcash',
  paymentStatus: 'paid',
  gcashReference: '883920192837',
  driverId: driver2._id,
  vehicleId: vehicle2._id,
  transportStatus: 'dropped_off',
  reviewLeft: true,
});

// Booking 4: Juan booking Coron Reef, 1 pax, completed (review left)
const book4 = await Booking.create({
  referenceNumber: 'PH-2026-0004',
  hikerId: hiker1._id,
  adventureId: adv4._id,
  agencyId: agency2._id,
  paxCount: 1,
  totalAmount: 4500,
  pickupNeeded: false,
  status: 'completed',
  paymentMethod: 'card',
  paymentStatus: 'paid',
  cardNumber: '5524',
  reviewLeft: true,
});

console.log('Seeding reviews...');
await Review.create({
  hikerId: hiker1._id,
  adventureId: adv4._id,
  agencyId: agency2._id,
  rating: 5,
  comment: 'Amazing dive! The reef was full of life and the guides were super professional. Will book again!',
});

await Review.create({
  hikerId: hiker2._id,
  adventureId: adv3._id,
  agencyId: agency2._id,
  rating: 4,
  comment: 'Tough climb but the summit view was absolutely breathtaking. Porter service was extremely helpful.',
});

console.log('Database seeded successfully.');
console.log('Admin: admin@pahinga.com / admin123');
console.log('Hiker 1: hiker@pahinga.com / hiker123');
console.log('Hiker 2: hiker2@pahinga.com / hiker123');
console.log('Agency 1: trailseekers@pahinga.com / agency123');
console.log('Agency 2: seatosummit@pahinga.com / agency123');
console.log('Driver 1: driver1@pahinga.com / driver123');
console.log('Driver 2: driver2@pahinga.com / driver123');
process.exit(0);
