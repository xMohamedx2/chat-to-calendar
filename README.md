# 📅 Chat to Calendar

> **Transform natural language into structured Apple Calendar events with AI**

A production-quality Next.js application that converts conversational schedule requests into exportable calendar events using OpenAI's Structured Outputs API. Built for recruiters to evaluate modern full-stack engineering skills.

<img width="1173" height="650" alt="Screenshot 2026-02-07 at 9 55 10 PM" src="https://github.com/user-attachments/assets/00d58a1a-167f-4e51-a750-74d0cb820b0f" />

---

## 🎯 Problem & Solution

**Problem**: Creating calendar events manually is tedious. Users often describe schedules in natural language ("gym every Monday, Wednesday, Friday at 7am") but must translate this into individual calendar entries.

**Solution**: A single-shot AI-powered scheduler that:
- Accepts natural language input
- Generates structured, conflict-free calendar events
- Exports to Apple Calendar via iCloud links and .ics files
- Requires no authentication or database

---

## ✨ Features

- 🤖 **AI-Powered Parsing** - Uses OpenAI GPT-4o with Structured Outputs for deterministic JSON responses
- 🍎 **Apple Calendar Integration** - One-click iCloud calendar links for each event
- 📥 **ICS Export** - RFC 5545 compliant .ics files for universal calendar import
- ⚡ **Single-Shot Experience** - One message → complete schedule (no multi-turn editing)
- 🎨 **Premium UI** - Clean, Apple-esque design with gradients and micro-animations
- ✅ **Conflict Detection** - Validates event timing and prevents overlaps
- 🔒 **Secure** - API key stays server-side only

---

## 🏗️ Technical Highlights

### Why OpenAI Structured Outputs?

Traditional prompt engineering returns unpredictable text. With **Structured Outputs**, we enforce a JSON schema, guaranteeing:
- ✅ Type-safe responses (no parsing failures)
- ✅ Machine-readable data (eliminates hallucinations)
- ✅ Deterministic output format (production-ready)

```typescript
response_format: {
  type: 'json_schema',
  json_schema: {
    name: 'schedule_response',
    strict: true,
    schema: scheduleResponseSchema,
  },
}
```

### Architecture Decisions

**No Database by Design**  
This is a stateless, single-shot tool. Adding persistence would introduce unnecessary complexity without user accounts.

**Custom ICS Generator**  
Built our own RFC 5545 compliant generator instead of using a library for:
- Full control over line folding (75-char limit)
- Proper UTC conversion
- Zero external dependencies

**Client-Side .ics Generation**  
Reduces server load and enables instant downloads without API round-trips.

### Security

- ✅ OpenAI API key stored server-side only (never exposed to client bundle)
- ✅ Input sanitization on API routes
- ✅ CORS properly configured via Next.js defaults
- ⚠️ Production deployments should add rate limiting

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **AI** | OpenAI API (GPT-4o with Structured Outputs) |
| **Deployment** | Vercel-ready |

**Why This Stack?**
- Next.js App Router for modern React with server components
- TypeScript for type safety across client/server boundary
- Tailwind for rapid, consistent styling
- OpenAI for state-of-the-art natural language understanding

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chat-to-calendar.git
cd chat-to-calendar

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Add your OpenAI API key to .env.local
# OPENAI_API_KEY=sk-proj-...

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Usage

1. **Enter a schedule request** in natural language:
   - _"Create a study schedule for next week, 2 hours per day"_
   - _"Plan gym sessions Monday, Wednesday, Friday at 7am"_
   - _"Schedule team meetings every Tuesday at 2pm for March"_

2. **View generated events** in the right panel

3. **Export to Apple Calendar**:
   - Click **"Open in Calendar"** to add individual events via iCloud
   - Click **"Download .ics"** to import all events at once

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# OPENAI_API_KEY = your-key-here
```

Or use the [Vercel GitHub integration](https://vercel.com/docs/git) for automatic deployments.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes |

---

## 📂 Project Structure

```
chat-to-calendar/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── schedule/
│   │   │       └── route.ts       # OpenAI API integration
│   │   ├── layout.tsx             # Root layout with metadata
│   │   ├── page.tsx               # Main UI (two-column layout)
│   │   └── globals.css            # Tailwind base styles
│   └── lib/
│       ├── schema.ts               # TypeScript types & JSON schema
│       ├── appleLink.ts           # iCloud calendar link generator
│       └── ics.ts                 # RFC 5545 .ics file generator
├── .env.example                    # Environment template
├── .env.local                      # Your local environment (gitignored)
├── README.md                       # This file
├── package.json
├── tsconfig.json
└── next.config.ts
```

### Key Files

- **`schema.ts`** - Defines the structure enforced by OpenAI Structured Outputs
- **`route.ts`** - Server-side API route that calls OpenAI with strict schema
- **`appleLink.ts`** - Generates `https://www.icloud.com/calendar/event?...` URLs
- **`ics.ts`** - Creates RFC-compliant .ics files with proper line folding

---

## 🧪 Example Prompts

| Prompt | Expected Behavior |
|--------|-------------------|
| "Study plan for next week, 2 hours daily" | 7 events starting next Monday |
| "Gym Monday/Wed/Fri 7am" | 3 recurring weekly events |
| "Team meetings every Tuesday 2pm" | Weekly recurring meetings |
| "Book club on the 15th at 6pm" | Single event on the 15th |

---

## 🔮 Future Enhancements

- [ ] **Google Calendar Support** - Add Google Calendar quick-add links
- [ ] **Multi-Turn Editing** - Allow users to refine schedules iteratively
- [ ] **Event Persistence** - Optional user accounts to save schedules
- [ ] **Recurring Events** - Native support for RRULE in .ics files
- [ ] **Custom Timezones** - UI selector for user timezone preferences
- [ ] **Calendar Previews** - Visual calendar grid before export

---

## 📄 License

MIT License - feel free to use this project for your portfolio.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**Built by [Your Name]** | [GitHub](https://github.com/yourusername) | [LinkedIn](https://linkedin.com/in/yourprofile)

> This project demonstrates proficiency in full-stack development, API integration, TypeScript, and modern web design patterns. Created as a portfolio piece for software engineering roles.
