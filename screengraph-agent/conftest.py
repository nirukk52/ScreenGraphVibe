"""
Pytest configuration for screengraph-agent tests.
Adds project root to Python path.
"""
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
