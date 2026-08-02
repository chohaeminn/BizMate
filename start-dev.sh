#!/usr/bin/env bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
backend_dir="$project_root/back/db"
frontend_dir="$project_root/front"

if [[ ! -f "$backend_dir/app/main.py" ]]; then
  echo "Backend entrypoint not found: $backend_dir/app/main.py" >&2
  exit 1
fi

if [[ ! -f "$frontend_dir/package.json" ]]; then
  echo "Frontend package.json not found: $frontend_dir/package.json" >&2
  exit 1
fi

if [[ -x "$backend_dir/.venv/bin/python" ]]; then
  python_command="$backend_dir/.venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  python_command="python3"
elif command -v python >/dev/null 2>&1; then
  python_command="python"
else
  echo "Python was not found. Install Python 3 first." >&2
  exit 1
fi

if ! "$python_command" -c "import uvicorn" >/dev/null 2>&1; then
  echo "Backend dependencies are not installed." >&2
  echo "Run: $python_command -m pip install -r $backend_dir/requirements.txt" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found. Install Node.js first." >&2
  exit 1
fi

backend_pid=""
frontend_pid=""

cleanup() {
  trap - INT TERM EXIT
  [[ -n "$backend_pid" ]] && kill "$backend_pid" 2>/dev/null || true
  [[ -n "$frontend_pid" ]] && kill "$frontend_pid" 2>/dev/null || true
  wait 2>/dev/null || true
}

trap cleanup INT TERM EXIT

(
  cd "$backend_dir"
  exec "$python_command" -m uvicorn app.main:app --reload --port 8000
) &
backend_pid=$!

(
  cd "$frontend_dir"
  exec npm run dev
) &
frontend_pid=$!

echo "BizMate dev servers are starting."
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop both servers."

while kill -0 "$backend_pid" 2>/dev/null && kill -0 "$frontend_pid" 2>/dev/null; do
  sleep 1
done
