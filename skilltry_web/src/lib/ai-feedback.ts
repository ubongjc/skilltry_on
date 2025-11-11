import OpenAI from 'openai';
import type { Simulation, Attempt } from '@prisma/client';
import { logError } from './sentry';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FeedbackResult {
  feedback: string;
  rubricScores: Record<string, number>;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  trainingRecommendations: string[];
}

/**
 * Generate AI-powered feedback for a simulation attempt
 */
export async function generateFeedback(
  simulation: Simulation,
  attempt: Partial<Attempt> & { responses: any }
): Promise<FeedbackResult> {
  try {
    const rubric = simulation.rubric as any;
    const responses = attempt.responses;

    const prompt = createFeedbackPrompt(simulation, responses, rubric);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career coach and workplace skills assessor. Provide constructive, actionable feedback that helps job seekers improve their performance. Be encouraging but honest. Focus on specific behaviors and provide concrete suggestions for improvement.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Validate and structure the response
    const feedbackResult: FeedbackResult = {
      feedback: result.feedback || 'Thank you for completing this simulation.',
      rubricScores: result.rubricScores || {},
      overallScore: calculateOverallScore(result.rubricScores, rubric),
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      trainingRecommendations: result.trainingRecommendations || [],
    };

    return feedbackResult;
  } catch (error) {
    logError(error as Error, {
      context: 'AI Feedback Generation',
      simulationId: simulation.id,
    });

    // Return fallback feedback
    return generateFallbackFeedback(simulation);
  }
}

/**
 * Create prompt for OpenAI
 */
function createFeedbackPrompt(
  simulation: Simulation,
  responses: any,
  rubric: any
): string {
  const steps = simulation.steps as any[];
  const criteria = rubric.criteria || [];

  let prompt = `# Simulation: ${simulation.title}\n\n`;
  prompt += `## Scenario:\n${simulation.description}\n\n`;
  prompt += `## Sector: ${simulation.sector}\n\n`;

  prompt += `## User Responses:\n`;
  steps.forEach((step: any, index: number) => {
    const stepResponse = responses[step.id] || responses[`step${index + 1}`] || 'No response';
    prompt += `\n### Step ${index + 1}: ${step.title}\n`;
    prompt += `Question/Scenario: ${step.content}\n`;
    if (step.options) {
      prompt += `Options: ${step.options.join(', ')}\n`;
    }
    prompt += `User's Response: ${stepResponse}\n`;
  });

  prompt += `\n## Evaluation Criteria:\n`;
  criteria.forEach((criterion: any) => {
    prompt += `- **${criterion.name}** (Weight: ${criterion.weight}, Max Score: ${criterion.maxScore}): ${criterion.description}\n`;
  });

  prompt += `\n## Instructions:\n`;
  prompt += `Please evaluate the user's performance and provide feedback in the following JSON format:\n\n`;
  prompt += `{\n`;
  prompt += `  "feedback": "Overall narrative feedback (3-4 paragraphs)",\n`;
  prompt += `  "rubricScores": {\n`;
  criteria.forEach((criterion: any, index: number) => {
    prompt += `    "${criterion.name}": ${criterion.maxScore}${index < criteria.length - 1 ? ',' : ''} // Score out of ${criterion.maxScore}\n`;
  });
  prompt += `  },\n`;
  prompt += `  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],\n`;
  prompt += `  "improvements": ["Specific area for improvement 1", "Specific area for improvement 2", "Specific area for improvement 3"],\n`;
  prompt += `  "trainingRecommendations": ["Training recommendation 1 with link/resource", "Training recommendation 2 with link/resource"]\n`;
  prompt += `}\n\n`;
  prompt += `Make the feedback specific to their responses. Be constructive and encouraging while providing honest assessment.`;

  return prompt;
}

/**
 * Calculate weighted overall score from rubric scores
 */
function calculateOverallScore(
  rubricScores: Record<string, number>,
  rubric: any
): number {
  const criteria = rubric.criteria || [];

  if (criteria.length === 0) {
    return 0;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  criteria.forEach((criterion: any) => {
    const score = rubricScores[criterion.name] || 0;
    const normalizedScore = (score / criterion.maxScore) * 100;
    const weight = criterion.weight || 1 / criteria.length;

    totalWeightedScore += normalizedScore * weight;
    totalWeight += weight;
  });

  return Math.round((totalWeightedScore / totalWeight) * 100) / 100;
}

/**
 * Generate fallback feedback if AI fails
 */
function generateFallbackFeedback(simulation: Simulation): FeedbackResult {
  const rubric = simulation.rubric as any;
  const criteria = rubric.criteria || [];

  const fallbackScores: Record<string, number> = {};
  criteria.forEach((criterion: any) => {
    fallbackScores[criterion.name] = Math.ceil(criterion.maxScore * 0.7);
  });

  return {
    feedback: `Thank you for completing the "${simulation.title}" simulation. We appreciate your participation. Due to a temporary issue, we're unable to provide detailed feedback at this moment. Please try again later or contact support if the issue persists. Your responses have been saved.`,
    rubricScores: fallbackScores,
    overallScore: 70,
    strengths: [
      'Completed the simulation',
      'Engaged with all steps',
      'Provided thoughtful responses',
    ],
    improvements: [
      'Review the scenario details carefully',
      'Consider multiple perspectives',
      'Practice similar scenarios',
    ],
    trainingRecommendations: [
      `Additional training in ${simulation.sector}`,
      'Communication skills workshops',
      'Problem-solving courses',
    ],
  };
}

/**
 * Generate personalized training recommendations based on performance
 */
export async function generateTrainingRecommendations(
  simulation: Simulation,
  rubricScores: Record<string, number>
): Promise<string[]> {
  try {
    const weakAreas = Object.entries(rubricScores)
      .filter(([_, score]) => score < 7)
      .map(([area, _]) => area);

    if (weakAreas.length === 0) {
      return [
        'You're performing well! Consider advancing to more challenging scenarios.',
      ];
    }

    const prompt = `Given that a job seeker struggled with ${weakAreas.join(', ')} in a ${simulation.sector} simulation, recommend 3 specific, actionable training resources or courses they should pursue. Include both free and paid options when possible.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a career advisor recommending specific training resources.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const recommendations = completion.choices[0].message.content
      ?.split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 5);

    return recommendations || [];
  } catch (error) {
    logError(error as Error, {
      context: 'Training Recommendations',
    });

    return [
      'LinkedIn Learning courses in your field',
      'Coursera professional certificates',
      'Local community college workshops',
    ];
  }
}

/**
 * Batch process feedback for multiple attempts
 */
export async function batchGenerateFeedback(
  simulationAttemptPairs: Array<{
    simulation: Simulation;
    attempt: Partial<Attempt> & { responses: any };
  }>
): Promise<FeedbackResult[]> {
  const results = await Promise.allSettled(
    simulationAttemptPairs.map(({ simulation, attempt }) =>
      generateFeedback(simulation, attempt)
    )
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return generateFallbackFeedback(simulationAttemptPairs[index].simulation);
    }
  });
}

/**
 * Analyze trends across multiple attempts for continuous improvement insights
 */
export async function analyzeProgressTrends(
  attempts: Array<Attempt & { simulation: Simulation }>
): Promise<{
  trend: 'improving' | 'declining' | 'stable';
  insights: string[];
  recommendations: string[];
}> {
  if (attempts.length < 2) {
    return {
      trend: 'stable',
      insights: ['Complete more simulations to see progress trends'],
      recommendations: ['Try different scenarios to build diverse skills'],
    };
  }

  const scores = attempts.map(a => a.overallScore).sort((a, b) => a - b);
  const recentScores = scores.slice(-3);
  const earlierScores = scores.slice(0, Math.min(3, scores.length - 3));

  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const earlierAvg = earlierScores.length > 0
    ? earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length
    : recentAvg;

  let trend: 'improving' | 'declining' | 'stable';
  if (recentAvg > earlierAvg + 5) {
    trend = 'improving';
  } else if (recentAvg < earlierAvg - 5) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  return {
    trend,
    insights: [
      trend === 'improving'
        ? 'Your performance has improved over time'
        : trend === 'declining'
        ? 'Your recent scores are lower than before'
        : 'Your performance has been consistent',
    ],
    recommendations: [
      'Continue practicing regularly',
      'Focus on your weakest areas',
      'Challenge yourself with harder scenarios',
    ],
  };
}
