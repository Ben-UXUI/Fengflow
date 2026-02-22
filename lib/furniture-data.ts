import { FurnitureItem, Template } from './room-types';

export const TEMPLATES: Template[] = [
  { id: 'studio',   label: 'Studio Flat',        width: 400, height: 350 },
  { id: 'bedroom',  label: '1-Bed Bedroom',       width: 380, height: 420 },
  { id: 'living',   label: 'Living Room',         width: 500, height: 380 },
  { id: 'openplan', label: 'Open Plan Kitchen',   width: 560, height: 400 },
];

export const FURNITURE_ITEMS: FurnitureItem[] = [
  // ── BEDROOM ──────────────────────────────────────────────────────────────────
  { id: 'bed-king',    label: 'King Bed',          emoji: '🛏️', category: 'Bedroom', w: 100, h: 110, element: 'wood' },
  { id: 'bed-double',  label: 'Double Bed',         emoji: '🛏️', category: 'Bedroom', w: 80,  h: 100, element: 'wood' },
  { id: 'bed-single',  label: 'Single Bed',         emoji: '🛏️', category: 'Bedroom', w: 60,  h: 100, element: 'wood' },
  { id: 'bed-bunk',    label: 'Bunk Bed',           emoji: '🛏️', category: 'Bedroom', w: 60,  h: 110, element: 'wood' },
  { id: 'bed-crib',    label: 'Baby Crib',          emoji: '🛏️', category: 'Bedroom', w: 50,  h: 80,  element: 'wood' },
  { id: 'wardrobe',    label: 'Wardrobe',           emoji: '🚪', category: 'Bedroom', w: 100, h: 50,  element: 'wood' },
  { id: 'drawers',     label: 'Chest of Drawers',   emoji: '🗄️', category: 'Bedroom', w: 70,  h: 40,  element: 'wood' },
  { id: 'shoe-rack',   label: 'Shoe Rack',          emoji: '👟', category: 'Bedroom', w: 80,  h: 30,  element: 'wood' },
  { id: 'bedlamp',     label: 'Bedside Lamp',       emoji: '💡', category: 'Bedroom', w: 25,  h: 25,  element: 'fire' },
  { id: 'fullmirror',  label: 'Full Mirror',        emoji: '🪞', category: 'Bedroom', w: 40,  h: 100, element: 'water' },

  // ── LIVING ───────────────────────────────────────────────────────────────────
  { id: 'sofa',          label: 'Sofa',             emoji: '🛋️', category: 'Living', w: 120, h: 60,  element: 'earth' },
  { id: 'sofa-l',        label: 'L-Shape Sofa',     emoji: '🛋️', category: 'Living', w: 150, h: 80,  element: 'earth' },
  { id: 'armchair',      label: 'Armchair',         emoji: '💺', category: 'Living', w: 60,  h: 60,  element: 'earth' },
  { id: 'beanbag',       label: 'Bean Bag',         emoji: '🟤', category: 'Living', w: 50,  h: 50,  element: 'earth' },
  { id: 'coffee-table',  label: 'Coffee Table',     emoji: '⬜', category: 'Living', w: 70,  h: 50,  element: 'wood' },
  { id: 'tv-unit',       label: 'TV Unit',          emoji: '📺', category: 'Living', w: 100, h: 40,  element: 'metal' },
  { id: 'bookcase',      label: 'Bookcase',         emoji: '📚', category: 'Living', w: 90,  h: 30,  element: 'wood' },
  { id: 'display-cab',   label: 'Display Cabinet',  emoji: '🗄️', category: 'Living', w: 70,  h: 40,  element: 'metal' },
  { id: 'fireplace',     label: 'Fireplace',        emoji: '🔥', category: 'Living', w: 80,  h: 30,  element: 'fire' },
  { id: 'piano',         label: 'Piano',            emoji: '🎹', category: 'Living', w: 100, h: 55,  element: 'metal' },
  { id: 'yoga-mat',      label: 'Yoga Mat',         emoji: '🧘', category: 'Living', w: 60,  h: 25,  element: 'wood' },
  { id: 'exercise-bike', label: 'Exercise Bike',    emoji: '🚲', category: 'Living', w: 50,  h: 80,  element: 'metal' },
  { id: 'floor-plant',   label: 'Floor Plant',      emoji: '🪴', category: 'Living', w: 35,  h: 35,  element: 'wood' },

  // ── DINING ───────────────────────────────────────────────────────────────────
  { id: 'dining-table',       label: 'Dining Table',    emoji: '🍽️', category: 'Dining', w: 100, h: 70, element: 'wood' },
  { id: 'dining-table-round', label: 'Round Dining',    emoji: '🍽️', category: 'Dining', w: 80,  h: 80, element: 'wood' },
  { id: 'wine-rack',          label: 'Wine Rack',       emoji: '🍷', category: 'Dining', w: 40,  h: 60, element: 'metal' },
  { id: 'kitchen-island',     label: 'Kitchen Island',  emoji: '🍳', category: 'Dining', w: 100, h: 60, element: 'earth' },
  { id: 'fridge',             label: 'Fridge',          emoji: '🧊', category: 'Dining', w: 50,  h: 55, element: 'metal' },
  { id: 'oven',               label: 'Oven',            emoji: '🔥', category: 'Dining', w: 55,  h: 55, element: 'fire' },
  { id: 'sink-kitchen',       label: 'Sink',            emoji: '🚰', category: 'Dining', w: 55,  h: 45, element: 'water' },
  { id: 'dishwasher',         label: 'Dishwasher',      emoji: '📦', category: 'Dining', w: 50,  h: 55, element: 'water' },

  // ── BATHROOM ─────────────────────────────────────────────────────────────────
  { id: 'bath',       label: 'Bath',            emoji: '🛁', category: 'Bathroom', w: 70,  h: 140, element: 'water' },
  { id: 'shower',     label: 'Shower',          emoji: '🚿', category: 'Bathroom', w: 70,  h: 70,  element: 'water' },
  { id: 'toilet',     label: 'Toilet',          emoji: '🚽', category: 'Bathroom', w: 45,  h: 65,  element: 'water' },
  { id: 'sink-bath',  label: 'Bathroom Sink',   emoji: '🚰', category: 'Bathroom', w: 50,  h: 45,  element: 'water' },
  { id: 'towel-rail', label: 'Towel Rail',      emoji: '🧺', category: 'Bathroom', w: 60,  h: 15,  element: 'metal' },
  { id: 'bath-cab',   label: 'Bathroom Cabinet',emoji: '🗄️', category: 'Bathroom', w: 60,  h: 30,  element: 'metal' },

  // ── FENG SHUI ────────────────────────────────────────────────────────────────
  { id: 'plant',        label: 'Plant',          emoji: '🪴', category: 'Feng Shui', w: 30, h: 30, element: 'wood' },
  { id: 'jade-plant',   label: 'Jade Plant',     emoji: '🌿', category: 'Feng Shui', w: 30, h: 30, element: 'wood' },
  { id: 'bamboo',       label: 'Lucky Bamboo',   emoji: '🎋', category: 'Feng Shui', w: 25, h: 40, element: 'wood' },
  { id: 'mirror',       label: 'Mirror',         emoji: '🪞', category: 'Feng Shui', w: 40, h: 80, element: 'water' },
  { id: 'bagua-mirror', label: 'Bagua Mirror',   emoji: '🪞', category: 'Feng Shui', w: 30, h: 30, element: 'metal' },
  { id: 'water-feature',label: 'Water Feature',  emoji: '💧', category: 'Feng Shui', w: 30, h: 30, element: 'water' },
  { id: 'rose-quartz',  label: 'Rose Quartz',    emoji: '💎', category: 'Feng Shui', w: 20, h: 20, element: 'earth' },
  { id: 'amethyst',     label: 'Amethyst',       emoji: '💜', category: 'Feng Shui', w: 20, h: 20, element: 'earth' },
  { id: 'singing-bowl', label: 'Singing Bowl',   emoji: '🔔', category: 'Feng Shui', w: 25, h: 25, element: 'metal' },
  { id: 'dragon',       label: 'Dragon',         emoji: '🐉', category: 'Feng Shui', w: 30, h: 30, element: 'wood' },
  { id: 'money-frog',   label: 'Money Frog',     emoji: '🐸', category: 'Feng Shui', w: 20, h: 20, element: 'water' },
  { id: 'buddha',       label: 'Laughing Buddha',emoji: '😊', category: 'Feng Shui', w: 20, h: 25, element: 'earth' },
  { id: 'red-envelope', label: 'Red Envelope',   emoji: '🧧', category: 'Feng Shui', w: 20, h: 20, element: 'fire' },
  { id: 'wind-chime',   label: 'Wind Chime',     emoji: '🎐', category: 'Feng Shui', w: 20, h: 40, element: 'metal' },
  { id: 'salt-lamp',    label: 'Salt Lamp',      emoji: '🪔', category: 'Feng Shui', w: 20, h: 25, element: 'fire' },
  { id: 'copper-bowl',  label: 'Copper Bowl',    emoji: '🏺', category: 'Feng Shui', w: 25, h: 25, element: 'metal' },
  { id: 'celestial',    label: 'Celestial Globe',emoji: '🌐', category: 'Feng Shui', w: 25, h: 25, element: 'metal' },

  // ── WORK ─────────────────────────────────────────────────────────────────────
  { id: 'desk',          label: 'Desk',           emoji: '🖥️', category: 'Work', w: 80,  h: 50, element: 'wood' },
  { id: 'standing-desk', label: 'Standing Desk',  emoji: '🖥️', category: 'Work', w: 90,  h: 50, element: 'wood' },
  { id: 'monitor',       label: 'Monitor',        emoji: '🖥️', category: 'Work', w: 50,  h: 30, element: 'metal' },
  { id: 'bookshelf',     label: 'Bookshelf',      emoji: '📚', category: 'Work', w: 80,  h: 30, element: 'wood' },
  { id: 'whiteboard',    label: 'Whiteboard',     emoji: '📋', category: 'Work', w: 80,  h: 15, element: 'metal' },
  { id: 'conf-table',    label: 'Conf. Table',    emoji: '📋', category: 'Work', w: 120, h: 60, element: 'wood' },
  { id: 'projector',     label: 'Projector',      emoji: '📽️', category: 'Work', w: 30,  h: 25, element: 'metal' },
  { id: 'server-rack',   label: 'Server Rack',    emoji: '🗄️', category: 'Work', w: 60,  h: 40, element: 'metal' },
  { id: 'safe',          label: 'Safe',           emoji: '🔒', category: 'Work', w: 40,  h: 40, element: 'metal' },

  // ── OUTDOOR ──────────────────────────────────────────────────────────────────
  { id: 'garden-bench',   label: 'Garden Bench',  emoji: '🪑', category: 'Outdoor', w: 80,  h: 40, element: 'wood' },
  { id: 'bbq',            label: 'BBQ Grill',     emoji: '🔥', category: 'Outdoor', w: 60,  h: 50, element: 'fire' },
  { id: 'outdoor-table',  label: 'Outdoor Table', emoji: '🪑', category: 'Outdoor', w: 80,  h: 60, element: 'wood' },
  { id: 'pond',           label: 'Pond',          emoji: '💧', category: 'Outdoor', w: 80,  h: 80, element: 'water' },
  { id: 'garden-lantern', label: 'Garden Lantern',emoji: '🏮', category: 'Outdoor', w: 25,  h: 25, element: 'fire' },
  { id: 'stone-statue',   label: 'Stone Statue',  emoji: '🗿', category: 'Outdoor', w: 30,  h: 40, element: 'earth' },
  { id: 'water-fountain', label: 'Water Fountain',emoji: '⛲', category: 'Outdoor', w: 50,  h: 50, element: 'water' },
];

export interface Master {
  id: number;
  name: string;
  title: string;
  location: string;
  languages: string[];
  experience: number;
  specialities: string[];
  pricePerSession: number;
  rating: number;
  reviewCount: number;
  bio: string;
  availability: string;
  avatar: string;
}

export const MASTERS: Master[] = [
  {
    id: 1,
    name: "Master Li Wei",
    title: "Classical Feng Shui Consultant",
    location: "London, UK",
    languages: ["English", "Mandarin", "Cantonese"],
    experience: 22,
    specialities: ["Residential", "Bagua Analysis", "Five Elements"],
    pricePerSession: 120,
    rating: 4.9,
    reviewCount: 147,
    bio: "Trained in Hong Kong under Grand Master Chen, Li Wei has practiced classical Feng Shui for over two decades. Specialises in residential spaces across London and the South East.",
    availability: "Next available: Mon 24 Feb",
    avatar: "🧙"
  },
  {
    id: 2,
    name: "Master Sarah Huang",
    title: "Contemporary Feng Shui Practitioner",
    location: "Manchester, UK",
    languages: ["English", "Mandarin"],
    experience: 14,
    specialities: ["Modern Interiors", "Wealth & Career", "New Homes"],
    pricePerSession: 85,
    rating: 4.8,
    reviewCount: 89,
    bio: "Sarah bridges classical Feng Shui wisdom with contemporary British interior design sensibilities. Based in Manchester, available online UK-wide.",
    availability: "Next available: Wed 26 Feb",
    avatar: "👩‍🏫"
  },
  {
    id: 3,
    name: "Master David Lam",
    title: "Hong Kong School Feng Shui Expert",
    location: "Edinburgh, UK",
    languages: ["English", "Cantonese"],
    experience: 18,
    specialities: ["Flying Stars", "Period 9 Analysis", "New Builds"],
    pricePerSession: 150,
    rating: 5.0,
    reviewCount: 63,
    bio: "A specialist in Flying Stars (Xuan Kong) Feng Shui and Period 9 analysis, David is one of the UK's most sought-after classical practitioners.",
    availability: "Next available: Fri 28 Feb",
    avatar: "👨‍💼"
  },
  {
    id: 4,
    name: "Master Priya Chen",
    title: "Feng Shui & Space Clearing Specialist",
    location: "Bristol, UK",
    languages: ["English"],
    experience: 9,
    specialities: ["Space Clearing", "Relationships Zone", "Colour & Element Therapy"],
    pricePerSession: 70,
    rating: 4.7,
    reviewCount: 112,
    bio: "Priya combines classical Feng Shui with space clearing ceremonies and element therapy. Particularly popular for relationship and family zone consultations.",
    availability: "Next available: Tomorrow",
    avatar: "🌿"
  }
];
