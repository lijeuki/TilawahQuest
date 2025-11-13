# TilawahQuest - Quran Recitation Learning App

An AI-powered web application that helps Muslims improve their Quran recitation through real-time voice recognition and instant feedback.

## Features

- 🎤 **Audio Recording**: Record your Quran recitation directly in the browser (up to 30 seconds)
- 🤖 **AI Recognition**: Automatically identify which ayah you're reciting using Web Speech API
- 📖 **Instant Feedback**: Get immediate results with the correct Arabic text and confidence scores
- 📊 **Progress Tracking**: Monitor your practice sessions and improvements over time
- 📱 **Mobile Responsive**: Works seamlessly on mobile browsers (Chrome, Safari)
- 🌐 **Offline-First**: Core functionality works without constant internet connection

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui + Efferd Pro
- **Backend**: Supabase (PostgreSQL + Storage + Edge Functions)
- **AI/ML**: Web Speech API (browser-based Arabic recognition)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Modern web browser with Web Speech API support (Chrome, Edge, Safari)

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd tilawah-quest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
EFFERD_REGISTRY_TOKEN=registry_5CJ40Qns84mDGIGRD6MYulFMkVQJjweQ
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration file to create the database schema:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL
3. Copy your project URL and API keys to `.env.local`

### 5. Add Quran Data

The app currently includes a limited set of surahs. To add complete Quran data:

1. Download Quran data from [Tarteel's Quranic Universal Library](https://github.com/TareefAzizi/quranic-universal-library) or [Tanzil.net](https://tanzil.net/download/)
2. Convert the data to match the `Ayah` interface in `src/types/quran.ts`
3. Add the JSON file to `src/data/quran.json`
4. Update `src/lib/quran/data.ts` to load the complete dataset

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tilawah-quest/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   └── practice/          # Practice page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── audio/             # Audio recording components
│   │   ├── quran/             # Quran display components
│   │   └── layout/            # Layout components
│   ├── lib/
│   │   ├── supabase/          # Supabase client & queries
│   │   ├── quran/             # Quran data & matching logic
│   │   └── audio/             # Audio processing utilities
│   ├── types/                 # TypeScript type definitions
│   └── data/                  # Quranic JSON data
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
└── components.json            # shadcn + Efferd Pro config
```

## Usage

### Recording a Recitation

1. Navigate to the Practice page
2. Click "Allow" when prompted for microphone permission
3. Click the microphone button to start recording
4. Recite any ayah from the Quran clearly
5. Click stop when finished (or wait for 30-second auto-stop)
6. View the results with identified ayah and confidence score

### Understanding Results

- **Confidence Score**: Percentage match between your recitation and the identified ayah
  - 90-100%: Excellent match
  - 70-89%: Good match
  - 50-69%: Fair match
  - Below 50%: May need to recite more clearly or try again

## Development

### Adding New Components

```bash
# shadcn/ui components
npx shadcn add <component-name>

# Efferd Pro components (requires EFFERD_REGISTRY_TOKEN)
npx shadcn add @efferd-pro/<component-name>
```

### Running Tests

```bash
# Run unit tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Roadmap

### Phase 1: MVP (Current)
- [x] Basic audio recording
- [x] Speech recognition integration
- [x] Ayah matching algorithm
- [x] Simple results display
- [ ] Complete Quran dataset integration

### Phase 2: Enhancement
- [ ] Progress tracking dashboard
- [ ] User authentication (optional)
- [ ] Audio playback with reference recitation
- [ ] Improved matching algorithm
- [ ] Multiple language support for UI

### Phase 3: Advanced Features
- [ ] Detailed pronunciation scoring
- [ ] Tajweed rules highlighting
- [ ] Memorization tools
- [ ] Social features
- [ ] Native mobile apps

## Troubleshooting

### Microphone Not Working
- Ensure browser has microphone permission
- Check browser compatibility (Chrome/Edge recommended)
- Try using HTTPS (required for microphone access)

### Low Recognition Accuracy
- Speak clearly and at a moderate pace
- Reduce background noise
- Try reciting longer portions (3+ words)
- Ensure proper Arabic pronunciation

### Supabase Connection Issues
- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are configured correctly

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [Tarteel.ai](https://tarteel.ai) for inspiration and Quranic libraries
- [Tanzil.net](https://tanzil.net) for Quran text data
- [EveryAyah.com](https://everyayah.com) for reference audio
- [Vercel](https://vercel.com) for hosting
- [Supabase](https://supabase.com) for backend infrastructure

## Support

For issues and questions:
- Open an issue on GitHub
- Email: support@tilawahquest.com (update with your email)

---

Built with ❤️ for the Muslim community
