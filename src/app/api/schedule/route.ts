/**
 * Schedule Generation API Route
 * 
 * POST /api/schedule
 * 
 * Accepts a natural language message and returns a structured schedule
 * using OpenAI's Responses API with Structured Outputs
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { scheduleResponseSchema, ScheduleResponse, validateSchedule } from '@/lib/schema';

// Initialize OpenAI client
// API key is stored server-side only and never exposed to the client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * System prompt that instructs the AI on how to generate schedules
 */
const SYSTEM_PROMPT = `You are a schedule generator. Given a user's natural language request, generate a structured calendar schedule.

Rules:
1. If no specific start date is provided, assume the schedule starts next Monday
2. Use realistic event durations (e.g., workouts: 1-2 hours, study sessions: 1-3 hours, meetings: 0.5-2 hours)
3. Ensure NO overlapping events - events must not conflict with each other
4. The end_local time MUST be after the start_local time for every event
5. Use the format YYYY-MM-DDTHH:mm for all datetime fields (example: 2026-02-10T09:00)
6. Default timezone is America/New_York unless the user specifies otherwise
7. Be realistic about scheduling - don't pack events too tightly, allow for breaks
8. Include helpful descriptions when appropriate (e.g., "Upper body workout" for a gym session)

Return ONLY valid JSON matching the schema. Do not include any explanatory text.`;

/**
 * POST handler for schedule generation
 */
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { message } = body;

        // Validate input
        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: message is required and must be a string' },
                { status: 400 }
            );
        }

        if (message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Invalid request: message cannot be empty' },
                { status: 400 }
            );
        }

        // Check for API key
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not set');
            return NextResponse.json(
                { error: 'Server configuration error: OpenAI API key not configured' },
                { status: 500 }
            );
        }

        // Call OpenAI API with Structured Outputs
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-2024-08-06', // Model that supports Structured Outputs
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: message }
            ],
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'schedule_response',
                    strict: true,
                    schema: scheduleResponseSchema,
                },
            },
            temperature: 0.7, // Some creativity for variety, but still structured
        });

        // Extract the response
        const responseContent = completion.choices[0]?.message?.content;

        if (!responseContent) {
            return NextResponse.json(
                { error: 'No response from OpenAI' },
                { status: 500 }
            );
        }

        // Parse the JSON response
        let schedule: ScheduleResponse;
        try {
            schedule = JSON.parse(responseContent);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', parseError);
            return NextResponse.json(
                { error: 'Failed to parse schedule response' },
                { status: 500 }
            );
        }

        // Validate the schedule
        const validation = validateSchedule(schedule);
        if (!validation.isValid) {
            console.warn('Schedule validation failed:', validation.errors);
            // Return the schedule anyway with warnings, as OpenAI should follow schema
            return NextResponse.json({
                ...schedule,
                warnings: validation.errors,
            });
        }

        // Return the valid schedule
        return NextResponse.json(schedule);

    } catch (error: any) {
        console.error('Error in schedule API:', error);

        // Handle OpenAI-specific errors
        if (error?.status === 401) {
            return NextResponse.json(
                { error: 'Invalid OpenAI API key' },
                { status: 500 }
            );
        }

        if (error?.status === 429) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again in a moment.' },
                { status: 429 }
            );
        }

        // Generic error response
        return NextResponse.json(
            {
                error: 'Failed to generate schedule',
                details: error?.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
