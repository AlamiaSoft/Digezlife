<?php

namespace Alamia\Core\Journeys\Services;

use Alamia\Core\Journeys\Models\Journey;
use Alamia\Core\Journeys\Models\JourneyProgress;
use Illuminate\Database\Eloquent\Model;

class JourneyManager
{
    public function completeStep(string $journeyKey, string $stepKey, Model $context): void
    {
        $journey = Journey::where('key', $journeyKey)->firstOrFail();
        $step = $journey->steps()->where('key', $stepKey)->firstOrFail();

        JourneyProgress::updateOrCreate(
            [
                'journey_step_id' => $step->id,
                'context_type' => $context->getMorphClass(),
                'context_id' => $context->getKey(),
            ],
            [
                'journey_id' => $journey->id,
                'status' => 'completed',
                'completed_at' => now(),
            ]
        );
    }

    /**
     * Mark a journey step as failed for a given context.
     * Records the failure reason for observability and retry support.
     */
    public function failStep(string $journeyKey, string $stepKey, Model $context, string $reason = ''): void
    {
        $journey = Journey::where('key', $journeyKey)->first();

        if (! $journey) {
            return; // Journey not configured — skip silently, don't fail provisioning over tracking.
        }

        $step = $journey->steps()->where('key', $stepKey)->first();

        if (! $step) {
            return;
        }

        JourneyProgress::updateOrCreate(
            [
                'journey_step_id' => $step->id,
                'context_type' => $context->getMorphClass(),
                'context_id' => $context->getKey(),
            ],
            [
                'journey_id' => $journey->id,
                'status' => 'failed',
                'completed_at' => null,
            ]
        );
    }

    public function getProgress(string $journeyKey, Model $context): array
    {
        $journey = Journey::where('key', $journeyKey)->with('steps')->firstOrFail();

        $progress = JourneyProgress::where('journey_id', $journey->id)
            ->where('context_type', $context->getMorphClass())
            ->where('context_id', $context->getKey())
            ->get()
            ->keyBy('journey_step_id');

        $completedSteps = 0;
        $totalRequired = 0;

        $steps = $journey->steps->map(function ($step) use ($progress, &$completedSteps, &$totalRequired) {
            $status = $progress->has($step->id) ? $progress->get($step->id)->status : 'pending';

            if ($step->is_required) {
                $totalRequired++;
                if ($status === 'completed') {
                    $completedSteps++;
                }
            }

            return [
                'key' => $step->key,
                'title' => $step->title,
                'status' => $status,
                'is_required' => $step->is_required,
            ];
        });

        return [
            'journey' => $journey->name,
            'steps' => $steps,
            'percent' => $totalRequired > 0 ? round(($completedSteps / $totalRequired) * 100) : 100,
            'is_completed' => $completedSteps === $totalRequired,
        ];
    }
}
