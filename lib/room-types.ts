export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type Wall = 'top' | 'right' | 'bottom' | 'left';

export interface Template {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface FurnitureItem {
  id: string;
  label: string;
  emoji: string;
  category: string;
  w: number;
  h: number;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
}

export interface PlacedFurniture {
  id: string;
  itemId: string;
  label: string;
  emoji: string;
  element: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;    // degrees (0–359), default 0
  scaleX?: number;      // size multiplier (0.5–2.0), default 1
  scaleY?: number;      // size multiplier (0.5–2.0), default 1
}

export interface WindowItem {
  id: string;
  wall: Wall;
  offset: number;   // percentage along the wall (10–90)
}

export interface CanvasState {
  template: Template;
  northWall?: Wall;
  furniture: PlacedFurniture[];
  doorPosition: {
    wall: Wall;
    offset: number;
  };
}

export interface LayoutData {
  room: {
    type: string;
    widthMetres: number;
    heightMetres: number;
    facingDirection: string;
  };
  door: {
    wall: string;
    positionPercent: number;
  };
  windows?: Array<{
    id: string;
    wall: string;
    positionPercent: number;
  }>;
  furniture: Array<{
    id: string;
    label: string;
    element: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
    rotation?: number;
  }>;
}

export interface FengShuiAnalysis {
  overall_score: number;
  overall_summary: string;
  harmony_level: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  element_balance: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
    assessment: string;
  };
  issues: Array<{
    severity: 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    affected_zone: string;
  }>;
  zone_analysis: Array<{
    zone: string;
    life_area: string;
    element: string;
    status: 'Good' | 'Attention' | 'Issue';
    note: string;
  }>;
  recommendations: Array<{
    priority: number;
    title: string;
    action: string;
    reason: string;
    effort: 'Easy' | 'Medium' | 'Effort';
  }>;
  auspicious_features: string[];
}
