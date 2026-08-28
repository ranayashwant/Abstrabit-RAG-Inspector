import { z } from 'zod';

/**
 * Zod Schema for AI Investigation Output
 * Ensures all AI outputs strictly conform to the expected structured format.
 */
export const AIInvestigationSchema = z.object({
  summary: z.string().min(1, 'Summary cannot be empty'),
  rootCause: z.string().min(1, 'Root cause cannot be empty'),
  evidence: z.array(
    z.object({
      eventId: z.string(),
      explanation: z.string(),
    })
  ).min(1, 'Must include at least one evidence item'),
  recommendedAction: z.string().min(1, 'Recommended action cannot be empty'),
  confidence: z.enum(['low', 'medium', 'high']),
});

export type AIInvestigationParsed = z.infer<typeof AIInvestigationSchema>;

/**
 * Schema for Run API request
 */
export const CreateRunRequestSchema = z.object({
  query: z.string().optional().default("What is the company's parental leave policy?"),
  scenario: z.string().optional().default('retrieval-failure'),
});

export type CreateRunRequest = z.infer<typeof CreateRunRequestSchema>;
