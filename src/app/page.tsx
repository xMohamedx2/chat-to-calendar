'use client';

/**
 * Chat to Calendar - Modern Bento Grid Layout
 * 
 * A production-quality AI scheduler with Apple Calendar integration
 */

import { useState } from 'react';
import { Copy, ExternalLink, Download, Sparkles } from 'lucide-react';
import { ScheduleResponse, Event } from '@/lib/schema';
import { generateAppleCalendarLink } from '@/lib/appleLink';
import { downloadICS } from '@/lib/ics';
import { BentoCard } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Example prompts for user guidance
  const examplePrompts = [
    "Create a study schedule for next week, 2 hours per day",
    "Plan a workout routine: gym sessions Monday, Wednesday, Friday at 7am",
    "Schedule team meetings every Tuesday and Thursday at 2pm for the next month",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError(null);
    setSchedule(null);

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate schedule');
      }

      setSchedule(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setMessage(example);
  };

  const handleCopyLink = async (event: Event, index: number) => {
    const link = generateAppleCalendarLink(event, schedule?.timezone || 'America/New_York');

    try {
      await navigator.clipboard.writeText(link);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenLink = (event: Event) => {
    const link = generateAppleCalendarLink(event, schedule?.timezone || 'America/New_York');
    window.open(link, '_blank');
  };

  const handleDownloadICS = () => {
    if (schedule) {
      downloadICS(schedule);
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            📅 Chat to Calendar
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Transform natural language into Apple Calendar events instantly
          </p>
        </div>
      </header>

      {/* Main Content - Bento Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Chat Input Panel */}
          <div className="lg:col-span-5">
            <BentoCard height="h-full">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                Describe Your Schedule
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Example: Create a workout plan for next week with gym sessions at 7am on Monday, Wednesday, and Friday..."
                    className="w-full h-40 px-4 py-3 border border-border-primary rounded-xl bg-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-text-primary placeholder-text-tertiary transition-all"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Generate Schedule
                    </span>
                  )}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {schedule && !loading && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800 font-medium">
                    ✅ Generated {schedule.events.length} event{schedule.events.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Example Prompts */}
              <div className="mt-6 pt-6 border-t border-border-primary">
                <h3 className="text-sm font-semibold text-text-primary mb-3">
                  💡 Try these examples
                </h3>
                <div className="space-y-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg text-xs text-text-secondary transition-colors border border-border-primary/50 hover:border-blue-200"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
            {!schedule && !loading && (
              <BentoCard height="h-full">
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="text-6xl mb-4">📆</div>
                  <h3 className="text-2xl font-semibold text-text-primary mb-2">
                    Your Schedule Will Appear Here
                  </h3>
                  <p className="text-text-secondary max-w-sm">
                    Enter a message on the left to generate your calendar events with AI
                  </p>
                </div>
              </BentoCard>
            )}

            {schedule && (
              <div className="space-y-4">
                {/* Schedule Header Card */}
                <BentoCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-text-primary">
                        Your Schedule
                      </h2>
                      <p className="text-sm text-text-secondary mt-1">
                        {schedule.events.length} event{schedule.events.length !== 1 ? 's' : ''} • {schedule.timezone}
                      </p>
                    </div>
                    <Button
                      onClick={handleDownloadICS}
                      variant="outline"
                      size="lg"
                      className="gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Download .ics
                    </Button>
                  </div>
                </BentoCard>

                {/* Event Cards */}
                {schedule.events.map((event, index) => (
                  <BentoCard key={index}>
                    <h3 className="text-xl font-bold text-text-primary mb-3">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-text-secondary">
                        <span className="font-semibold">🕐 Start:</span> {formatDateTime(event.start_local)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        <span className="font-semibold">🕐 End:</span> {formatDateTime(event.end_local)}
                      </p>
                      {event.description && (
                        <p className="text-sm text-text-primary mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                          <span className="font-semibold">📝 </span>{event.description}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-sm text-text-primary">
                          <span className="font-semibold">📍 </span>{event.location}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopyLink(event, index)}
                        variant="outline"
                        className="flex-1 gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copiedIndex === index ? 'Copied!' : 'Copy Link'}
                      </Button>
                      <Button
                        onClick={() => handleOpenLink(event)}
                        className="flex-1 gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in Calendar
                      </Button>
                    </div>
                  </BentoCard>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center text-sm text-text-tertiary border-t border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <p>Built with Next.js, TypeScript, and OpenAI • Ready for Apple Calendar</p>
        </div>
      </footer>
    </div>
  );
}
