<?php

namespace Alamia\Core\Audit\Services;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Facades\Activity;

class AuditService
{
    /**
     * Log a custom activity.
     */
    public function log(string $description, ?Model $performedOn = null, ?Model $causedBy = null, array $properties = []): void
    {
        $logger = activity();

        if ($performedOn) {
            $logger->performedOn($performedOn);
        }

        if ($causedBy) {
            $logger->causedBy($causedBy);
        }

        if (! empty($properties)) {
            $logger->withProperties($properties);
        }

        $logger->log($description);
    }
}
