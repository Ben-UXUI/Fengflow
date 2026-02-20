# FengFlow

An AI-powered Feng Shui room planner and master consultation marketplace. Built as a hackathon MVP in Next.js 14.

## Features

- 🏠 **Room Editor**: Drag-and-drop furniture placement with room templates
- ✨ **AI Analysis**: Classical Feng Shui analysis powered by Claude AI
- 📊 **Detailed Results**: Comprehensive analysis with Bagua zone mapping, element balance, and personalized recommendations
- 👨‍🏫 **Master Directory**: Browse and book consultations with certified Feng Shui masters
- 🎨 **Beautiful UI**: Premium wellness-focused design with smooth animations

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui components
- **Animations**: Framer Motion
- **Canvas**: React-Konva
- **AI**: Anthropic Claude API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "feat: initial FengFlow scaffold"
   # Create a repo on GitHub and push
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable: `ANTHROPIC_API_KEY` with your API key
   - Click "Deploy"

## Project Structure

```
fengflow/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Landing page
│   ├── editor/            # Room editor page
│   ├── results/           # Analysis results page
│   ├── masters/           # Master directory page
│   └── api/               # API routes
├── components/            # React components
│   ├── layout/           # Navbar, Footer
│   ├── landing/          # Landing page components
│   ├── editor/           # Room editor components
│   ├── results/          # Results page components
│   ├── masters/          # Master directory components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and data
│   ├── room-types.ts     # TypeScript types
│   ├── furniture-data.ts # Furniture and master data
│   └── feng-shui-prompt.ts # AI system prompt
└── public/               # Static assets
```

## Usage

1. **Landing Page**: Learn about FengFlow and how it works
2. **Room Editor**: 
   - Select a room template
   - Set which wall faces North
   - Drag and drop furniture items
   - Click "Analyse with Feng Shui AI"
3. **Results Page**: View your comprehensive Feng Shui analysis
4. **Masters Page**: Browse and book consultations with certified masters

## Design System

The app uses a carefully crafted color palette inspired by traditional Feng Shui principles:
- Warm ivory backgrounds
- Deep green primary colors
- Gold accents
- Serif display font (Cormorant Garamond) for headings
- Clean sans-serif (DM Sans) for body text

## Notes

- The room editor works best on desktop screens
- Analysis results are fully mobile-optimized
- No authentication required for MVP - results are stored in sessionStorage
- The AI analysis uses Claude Sonnet 4 with a comprehensive Feng Shui system prompt

## License

Built for hackathon purposes.
