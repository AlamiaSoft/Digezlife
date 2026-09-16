<#
.SYNOPSIS
Applies Alamia's repobrain engine patches so `rb refresh` skips Laravel
runtime directories (compiled Blade view cache, bootstrap cache, composer
vendor dirs).

Idempotent: safe to re-run any time, including after upgrading the
repobrain-engine pip package (which would otherwise revert these edits).

.USAGE
    powershell -ExecutionPolicy Bypass -File .\repobrain-patch.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

function Get-EngineHubDir {
    $out = & python -c "import repobrain_engine.hub as h, os; print(os.path.dirname(h.__file__))" 2>$null
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($out)) {
        Write-Error "repobrain-engine is not installed. Run: pip install `"git+https://github.com/study8677/repobrain.git#subdirectory=engine`""
    }
    return ($out | Select-Object -Last 1).Trim()
}

function Invoke-IdempotentPatch {
    param(
        [string]$Path,
        [string]$Marker,
        [string]$OldText,
        [string]$NewText
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        Write-Warning "Missing file (engine upgraded or path changed?): $Path"
        return
    }

    $content = [System.IO.File]::ReadAllText($Path)

    if ($content.Contains($Marker)) {
        Write-Host "SKIP (already patched): $Path"
        return
    }

    if (-not $content.Contains($OldText)) {
        Write-Error "Patch anchor not found in $Path -- the engine version may have changed; update this script to match."
    }

    $content = $content.Replace($OldText, $NewText)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $content, $utf8NoBom)
    Write-Host "PATCHED: $Path"
}

$hubDir = Get-EngineHubDir

$constantsPath = Join-Path $hubDir '_constants.py'
Invoke-IdempotentPatch -Path $constantsPath -Marker '# Alamia: Laravel runtime dirs' -OldText @'
    "target",
    "vendor",
    ".repobrain",
    "artifacts",
})
'@ -NewText @'
    "target",
    "vendor",
    ".repobrain",
    "artifacts",
    # Alamia: Laravel runtime dirs (applied by repobrain-patch.ps1)
    "storage",
    "cache",
})
'@

$scannerPath = Join-Path $hubDir 'scanner.py'
Invoke-IdempotentPatch -Path $scannerPath -Marker '# Alamia: Laravel runtime dirs' -OldText @'
    ".next", ".nuxt", "target", "vendor", ".repobrain", ".context",
    "artifacts", ".github", ".agent", ".agents",
})
'@ -NewText @'
    ".next", ".nuxt", "target", "vendor", ".repobrain", ".context",
    "artifacts", ".github", ".agent", ".agents",
    # Alamia: Laravel runtime dirs (applied by repobrain-patch.ps1)
    "storage", "cache",
})
'@

$groupingPath = Join-Path $hubDir 'module_grouping.py'
Invoke-IdempotentPatch -Path $groupingPath -Marker '# Alamia: composer deps + Laravel runtime' -OldText @'
    # Dependencies
    "node_modules", "bower_components",
'@ -NewText @'
    # Dependencies
    "node_modules", "bower_components",
    # Alamia: composer deps + Laravel runtime (applied by repobrain-patch.ps1)
    "vendor", "storage", "cache",
'@

Write-Host ""
Write-Host "Done. Verify with: python -c `"from repobrain_engine.hub._constants import SKIP_DIRS; from repobrain_engine.hub.scanner import _MODULE_SKIP_DIRS; from repobrain_engine.hub.module_grouping import _ARTIFACT_DIRS; print('storage' in SKIP_DIRS, 'storage' in _MODULE_SKIP_DIRS, 'vendor' in _ARTIFACT_DIRS)`""
