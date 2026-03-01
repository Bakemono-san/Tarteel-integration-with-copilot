# Quran Recitation App - Frontend

A modern Next.js application for practicing Quran recitation with real-time Tajweed feedback.

## Features

- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Real-time Recording**: Capture recitation using MediaRecorder API
- **WebSocket Communication**: Live connection to backend for instant analysis
- **Arabic Text Display**: Proper RTL rendering with tashkeel
- **Interactive Feedback**: Visual score display with detailed Tajweed analysis
- **Surah Selection**: Easy selection of any Surah and Ayah

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Beautiful icon library
- **WebSocket API**: Real-time communication

## Getting Started

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   └── recitation/
│       └── page.tsx         # Recitation practice page
├── components/
│   ├── SurahSelector.tsx    # Surah/Ayah selection component
│   ├── RecitationInterface.tsx  # Main recitation interface
│   ├── AyahDisplay.tsx      # Ayah text display
│   └── FeedbackPanel.tsx    # Analysis feedback display
├── lib/
│   └── useRecitationWebSocket.ts  # WebSocket hook
├── public/                  # Static assets
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Components

### SurahSelector
Allows users to select which Surah and Ayah they want to practice.

### RecitationInterface
Main component that handles:
- Microphone recording
- WebSocket connection
- Audio processing
- Displaying results

### AyahDisplay
Shows:
- Original Ayah text with tashkeel
- User's transcribed recitation
- Quick tips for recitation

### FeedbackPanel
Displays:
- Overall score
- Accuracy percentage
- Detected errors
- Tajweed rules found
- Corrections and suggestions

## WebSocket Integration

The app connects to the backend WebSocket endpoint at `ws://localhost:8000/ws/recitation`.

### Message Format

**Sending audio:**
```typescript
{
  type: "audio",
  audio: "<base64_encoded_audio>",
  surahNumber: 1,
  ayahNumber: 1
}
```

**Receiving analysis:**
```typescript
{
  type: "analysis",
  transcription: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  confidence: 0.95,
  tajweed: {
    accuracy: 0.98,
    errors: [...],
    tajweed_rules: [...],
    feedback: "Excellent!",
    score: 98
  }
}
```

## Styling

The app uses custom Tailwind configuration with:
- Arabic fonts (Amiri)
- Tajweed color coding
- Recording animations
- Responsive design

## Browser Compatibility

Requires a modern browser with support for:
- MediaRecorder API
- WebSocket API
- ES2017+

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Adding New Features

1. **New Components**: Add to `components/` directory
2. **New Pages**: Add to `app/` directory
3. **Utilities**: Add to `lib/` directory
4. **Styles**: Extend `tailwind.config.ts` or `globals.css`

### Environment Variables

Create `.env.local` for custom configuration:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Build for Production

```bash
npm run build
npm run start
```

## License

MIT
