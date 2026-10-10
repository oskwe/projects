"""Run with Python 3.12+; no changes outside this project directory."""
import os
from pathlib import Path
import subprocess
import sys
import threading
import webbrowser

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
if sys.version_info < (3, 12):
    raise SystemExit('Python 3.12 or newer is required.')

def run(args):
    subprocess.run(args, cwd=ROOT, check=True)

python = ROOT / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
if not python.exists():
    run([sys.executable, '-m', 'venv', str(ROOT / '.venv')])
probe = subprocess.run([str(python), '-c', 'import django, psycopg; assert django.get_version() == "6.0.6"'], capture_output=True)
if probe.returncode:
    install = [str(python), '-m', 'pip', 'install', '-r', str(ROOT / 'requirements.txt')]
    # Included wheels cover Windows x64 with Python 3.13. Other platforms use PyPI.
    if os.name == 'nt' and sys.version_info[:2] == (3,13) and (ROOT / 'wheels').exists():
        install += ['--no-index', '--find-links', str(ROOT / 'wheels')]
    run(install)
run([str(python), 'manage.py', 'migrate', '--noinput'])
run([str(python), 'manage.py', 'check'])
run([str(python), 'manage.py', 'seed_demo', '--if-empty'])
print('Open http://127.0.0.1:8000/ ; Ctrl+C stops the server.', flush=True)
threading.Timer(2, lambda: webbrowser.open('http://127.0.0.1:8000/')).start()
try:
    run([str(python), 'manage.py', 'runserver', '127.0.0.1:8000', '--noreload'])
except KeyboardInterrupt:
    pass
