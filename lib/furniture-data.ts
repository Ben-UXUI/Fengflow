import { FurnitureItem, Template } from './room-types';

export const TEMPLATES: Template[] = [
  { id: 'studio', label: 'Studio Flat', width: 400, height: 350 },
  { id: 'bedroom', label: '1-Bed Bedroom', width: 380, height: 420 },
  { id: 'living', label: 'Living Room', width: 500, height: 380 },
  { id: 'openplan', label: 'Open Plan Kitchen', width: 560, height: 400 },
];

export const FURNITURE_ITEMS: FurnitureItem[] = [
  // Bedroom
  { id: 'bed-double', label: 'Double Bed', emoji: '🛏️', category: 'Bedroom', w: 80, h: 100, element: 'wood' },
  { id: 'bed-single', label: 'Single Bed', emoji: '🛏️', category: 'Bedroom', w: 60, h: 100, element: 'wood' },
  { id: 'wardrobe', label: 'Wardrobe', emoji: '🚪', category: 'Bedroom', w: 100, h: 50, element: 'wood' },
  { id: 'desk', label: 'Desk', emoji: '🖥️', category: 'Work', w: 80, h: 50, element: 'wood' },
  // Living
  { id: 'sofa', label: 'Sofa', emoji: '🛋️', category: 'Living', w: 120, h: 60, element: 'earth' },
  { id: 'armchair', label: 'Armchair', emoji: '💺', category: 'Living', w: 60, h: 60, element: 'earth' },
  { id: 'coffee-table', label: 'Coffee Table', emoji: '⬜', category: 'Living', w: 70, h: 50, element: 'wood' },
  { id: 'tv-unit', label: 'TV Unit', emoji: '📺', category: 'Living', w: 100, h: 40, element: 'metal' },
  // Dining
  { id: 'dining-table', label: 'Dining Table', emoji: '🍽️', category: 'Dining', w: 100, h: 70, element: 'wood' },
  // Decor / Feng Shui
  { id: 'plant', label: 'Plant', emoji: '🪴', category: 'Feng Shui', w: 30, h: 30, element: 'wood' },
  { id: 'mirror', label: 'Mirror', emoji: '🪞', category: 'Feng Shui', w: 40, h: 80, element: 'water' },
  { id: 'water-feature', label: 'Water Feature', emoji: '💧', category: 'Feng Shui', w: 30, h: 30, element: 'water' },
  { id: 'bookshelf', label: 'Bookshelf', emoji: '📚', category: 'Work', w: 80, h: 30, element: 'wood' },
  { id: 'fireplace', label: 'Fireplace', emoji: '🔥', category: 'Living', w: 80, h: 30, element: 'fire' },
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
