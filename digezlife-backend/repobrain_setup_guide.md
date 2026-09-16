# AI Agent: RepoBrain Setup Guide

This guide provides instructions for an AI Developer Agent to set up the **RepoBrain** knowledge engine in any new project using a strictly local **Ollama** backend.

## 1. Installation

You must install both the lightweight CLI and the full multi-agent Engine from the original repository:

```bash
# Install the CLI first
pip install "git+https://github.com/study8677/repobrain.git#subdirectory=cli"

# Install the Engine (required for rb refresh)
pip install "git+https://github.com/study8677/repobrain.git#subdirectory=engine"
```

## 2. Configuration (Local Ollama)

Since we do not use third-party cloud APIs, you must configure the `.env` file to point directly to the local Ollama instance.

### Setting Up Ollama
1. **Install and run:** Download and launch Ollama so it serves the local API at `http://localhost:11434`.
2. **Pull a model:** Run `ollama pull qwen2.5-coder:1.5b` in your terminal.
3. **Verify service:** Ensure the local server responds and lists your downloaded models using `ollama list`.

### Configuring Repobrain
Create a `.env` file in the project root with the following variables:

```env
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_BASE=http://localhost:11434/v1
OPENAI_API_KEY=sk-dummy
OPENAI_MODEL=qwen2.5-coder:1.5b
RB_ASK_TIMEOUT_SECONDS=120
```

> [!IMPORTANT]
> The underlying `litellm` engine expects a valid-looking OpenAI key and `OPENAI_API_BASE` when validating the model endpoint. You MUST set `OPENAI_API_KEY=sk-dummy` (or another string starting with `sk-`) and set `OPENAI_API_BASE` alongside `OPENAI_BASE_URL` to bypass strict `litellm` credential validation errors ("No active credentials for provider").

*Note: Ensure `.env` is added to `.gitignore` to prevent committing the configuration.*

## 3. Initialization

Scaffold the necessary AI context files (e.g., `AGENTS.md`, `.repobrain/` folder, `.cursorrules`) into the project:

```bash
# Force UTF-8 encoding in Windows to prevent charmap errors during init
$env:PYTHONIOENCODING="utf-8"
rb init .
```

## 4. Indexing the Codebase

Once the engine is installed and configured, run the multi-agent cluster to scan the repository and build the knowledge index in `.repobrain/`:

```bash
$env:PYTHONIOENCODING="utf-8"
$env:OPENAI_API_KEY="sk-dummy"
$env:OPENAI_API_BASE="http://localhost:11434/v1"
rb refresh --workspace .
```

### 4a. Patching the engine to skip Laravel runtime dirs

The repobrain **engine does not read `.repobrainignore`** (verified on engine `0.3.2` / cli `2.0.1` and upstream `main` as of 2026-08). Skipping is driven by a hardcoded directory-name list inside the installed `repobrain-engine` package. Without a patch, `rb refresh` indexes Laravel junk:

- Compiled Blade view cache (`storage/framework/views/*.php` at the project root and in `examples/*`)
- `bootstrap/cache/packages.php` + `services.php`
- Composer `vendor/` directories (e.g. `packages/alamia-core/vendor`, `examples/workspace/vendor`)

`.repobrainignore` is the canonical *documented* list and must stay in sync with the patch. Run the idempotent patcher (safe to re-run, e.g. after `pip install -U`):

```powershell
powershell -ExecutionPolicy Bypass -File .\repobrain-patch.ps1
```

**Backup copies of the patched engine files** are kept in `repobrain-engine-patch/` (`_constants.py`, `scanner.py`, `module_grouping.py`). If a reinstall/upgrade of `repobrain-engine` overwrites the installed copies and the patcher script fails (e.g. the engine's source changed and the anchor text no longer matches), manually copy these files over their counterparts in the installed engine's `hub/` directory:

```powershell
$hubDir = python -c "import repobrain_engine.hub as h, os; print(os.path.dirname(h.__file__))"
Copy-Item .\repobrain-engine-patch\_constants.py $hubDir
Copy-Item .\repobrain-engine-patch\scanner.py $hubDir
Copy-Item .\repobrain-engine-patch\module_grouping.py $hubDir
```

> [!CAUTION]
> The backup copies are patched versions of a specific engine release (0.3.2). Only restore them onto the matching engine version — do not blindly copy over a newer release.

Verify quickly with:

```bash
python -c "from repobrain_engine.hub._constants import SKIP_DIRS; from repobrain_engine.hub.scanner import _MODULE_SKIP_DIRS; from repobrain_engine.hub.module_grouping import _ARTIFACT_DIRS; print('storage' in SKIP_DIRS, 'storage' in _MODULE_SKIP_DIRS, 'vendor' in _ARTIFACT_DIRS)"
# Expected: True True True
```

### 4b. Clean rebuild after module removal

`rb refresh` is incremental (merkle-hashed): modules whose file set is unchanged keep their previous agent docs, and **orphaned docs from removed modules are not deleted**. If a module disappears (e.g. the old `storage` module gone after the patch), stale docs stay behind and still get fed to the Map Agent. For a guaranteed clean index, delete `.repobrain/` (it is gitignored and fully regenerated) and run a full refresh:

```bash
Remove-Item -Recurse -Force .repobrain
$env:PYTHONIOENCODING="utf-8"
$env:OPENAI_API_KEY="sk-dummy"
$env:OPENAI_API_BASE="http://localhost:11434/v1"
rb refresh --workspace .
```

*Troubleshooting Tip:* If the `rb refresh` command hangs indefinitely during the `[1/3] Scanning project...` phase (common when `node_modules` is extremely large), cancel the task and run `rb refresh --quick` instead.

## 5. Usage

Once the index is built, you can query the project architecture and features using:

```bash
$env:PYTHONIOENCODING="utf-8"
$env:OPENAI_API_KEY="sk-dummy"
$env:OPENAI_API_BASE="http://localhost:11434/v1"
rb ask "How does the authentication flow work?" --workspace .
```
