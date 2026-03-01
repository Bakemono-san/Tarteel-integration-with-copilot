# Contributing Guide

Thank you for your interest in contributing to the Quran Recitation App! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Focus on what is best for the community
- Show empathy towards other community members
- This is a religious educational tool - maintain appropriate conduct

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create a detailed issue** with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Python/Node versions)

### Suggesting Enhancements

1. **Check existing issues** for similar suggestions
2. **Create an enhancement issue** with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach
   - Any relevant examples or mockups

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**: `git commit -m 'Add some AmazingFeature'`
6. **Push to your fork**: `git push origin feature/AmazingFeature`
7. **Open a Pull Request**

## Development Setup

See [QUICKSTART.md](QUICKSTART.md) for initial setup.

### Development Workflow

1. **Backend Development**:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

2. **Frontend Development**:
```bash
cd frontend
npm run dev
```

3. **Make changes and test**

4. **Run linting** (if applicable)

## Project Structure

Understanding the codebase:

```
quran-recitation-app/
├── backend/                    # Python/FastAPI backend
│   ├── main.py                # Application entry point
│   ├── models/                # AI model wrappers
│   │   └── tarteel_model.py  # Tarteel ASR integration
│   ├── services/              # Business logic
│   │   ├── tajweed_analyzer.py
│   │   └── quran_service.py
│   └── requirements.txt
│
├── frontend/                   # Next.js frontend
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   └── recitation/       # Recitation pages
│   ├── components/           # React components
│   │   ├── SurahSelector.tsx
│   │   ├── RecitationInterface.tsx
│   │   ├── AyahDisplay.tsx
│   │   └── FeedbackPanel.tsx
│   ├── lib/                  # Utilities and hooks
│   │   └── useRecitationWebSocket.ts
│   └── package.json
│
└── docs/                      # Documentation
```

## Adding New Features

### Adding a New Tajweed Rule

1. **Update the analyzer** (`backend/services/tajweed_analyzer.py`):

```python
class TajweedAnalyzer:
    def __init__(self):
        self.rules = {
            # ...existing rules...
            "new_rule": ["letter1", "letter2"],
        }
    
    def _check_tajweed_rules(self, transcribed, expected):
        checks = []
        # ...existing checks...
        
        # Add your new rule
        if "condition" in expected:
            checks.append({
                "rule": "New Rule Name",
                "letter": "ر",
                "status": "detected",
                "description": "Description of the rule"
            })
        
        return checks
```

2. **Update the frontend** to display the new rule in `components/FeedbackPanel.tsx`.

3. **Test thoroughly** with various Ayahs.

### Adding More Surahs

1. **Option A: Static data** (`backend/services/quran_service.py`):

```python
def _load_quran_data(self):
    return {
        "113": {  # Surah Al-Falaq
            "1": "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
            "2": "مِن شَرِّ مَا خَلَقَ",
            # ... more ayahs
        }
    }
```

2. **Option B: Load from JSON file**:

```python
import json

def _load_quran_data(self):
    with open('data/quran.json', 'r', encoding='utf-8') as f:
        return json.load(f)
```

3. **Option C: Use external API**:

```python
import requests

def get_surah(self, surah_number):
    response = requests.get(
        f'https://api.alquran.cloud/v1/surah/{surah_number}'
    )
    return response.json()
```

### Adding a New AI Model

1. **Create model wrapper** in `backend/models/`:

```python
# backend/models/custom_model.py
import torch
from transformers import AutoModel, AutoProcessor

class CustomModel:
    def __init__(self):
        self.model = AutoModel.from_pretrained("model-name")
        self.processor = AutoProcessor.from_pretrained("model-name")
    
    async def transcribe_audio(self, audio_bytes):
        # Your transcription logic
        return {
            "text": "transcribed text",
            "confidence": 0.95,
            "phonemes": []
        }
```

2. **Integrate in main.py**:

```python
from models.custom_model import CustomModel

custom_model = CustomModel()

@app.websocket("/ws/custom")
async def custom_endpoint(websocket: WebSocket):
    # Use your custom model
    result = await custom_model.transcribe_audio(audio_data)
```

### Adding User Authentication

1. **Install dependencies**:
```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

2. **Create auth service** (`backend/services/auth_service.py`):

```python
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    # Add expiration, encode JWT
    return encoded_jwt
```

3. **Add authentication endpoints**:

```python
@app.post("/api/auth/register")
async def register(username: str, password: str):
    # Registration logic
    pass

@app.post("/api/auth/login")
async def login(username: str, password: str):
    # Login logic
    return {"access_token": token}
```

4. **Protect endpoints**:

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(credentials = Depends(security)):
    # Verify JWT token
    if not valid:
        raise HTTPException(status_code=401)
    return user

@app.get("/api/protected")
async def protected_route(user = Depends(verify_token)):
    return {"message": "Authenticated user"}
```

### Adding Progress Tracking

1. **Create database models** (use SQLAlchemy or similar):

```python
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class RecitationHistory(Base):
    __tablename__ = "recitation_history"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    surah_number = Column(Integer)
    ayah_number = Column(Integer)
    score = Column(Float)
    accuracy = Column(Float)
    timestamp = Column(DateTime)
```

2. **Save recitation results**:

```python
@app.websocket("/ws/recitation")
async def websocket_recitation(websocket: WebSocket):
    # ... existing code ...
    
    # After analysis
    save_recitation_history(
        user_id=user.id,
        surah_number=surah_num,
        ayah_number=ayah_num,
        score=tajweed_analysis["score"],
        accuracy=tajweed_analysis["accuracy"]
    )
```

3. **Create statistics endpoint**:

```python
@app.get("/api/user/stats")
async def get_user_stats(user_id: int):
    # Query database for user statistics
    return {
        "total_recitations": 100,
        "average_score": 85.5,
        "best_surah": 1,
        "improvement_trend": [...]
    }
```

## Code Style Guidelines

### Python (Backend)

- Follow **PEP 8** style guide
- Use **type hints** where possible
- Write **docstrings** for functions and classes
- Maximum line length: **88 characters** (Black formatter)

Example:
```python
from typing import Dict, List

async def analyze_recitation(
    audio_data: bytes,
    surah_number: int,
    ayah_number: int
) -> Dict[str, any]:
    """
    Analyze a Quranic recitation.
    
    Args:
        audio_data: Raw audio bytes
        surah_number: The Surah being recited
        ayah_number: The Ayah being recited
    
    Returns:
        Dictionary containing analysis results
    """
    # Implementation
    pass
```

### TypeScript (Frontend)

- Use **TypeScript** (not plain JavaScript)
- Follow **ESLint** rules
- Use **functional components** with hooks
- Prefer **named exports** over default exports

Example:
```typescript
interface RecitationProps {
  surahNumber: number;
  ayahNumber: number;
  onComplete: (score: number) => void;
}

export function RecitationComponent({
  surahNumber,
  ayahNumber,
  onComplete
}: RecitationProps) {
  // Implementation
}
```

### Naming Conventions

- **Variables/Functions**: `camelCase` (frontend), `snake_case` (backend)
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case` or `PascalCase` for components

## Testing

### Backend Testing

Create tests in `backend/tests/`:

```python
# tests/test_tajweed_analyzer.py
import pytest
from services.tajweed_analyzer import TajweedAnalyzer

def test_qalqalah_detection():
    analyzer = TajweedAnalyzer()
    result = analyzer.analyze("قُلْ", "قُلْ", [])
    
    # Check if Qalqalah is detected
    rules = [r for r in result["tajweed_rules"] if r["rule"] == "Qalqalah"]
    assert len(rules) > 0
```

Run tests:
```bash
cd backend
pytest
```

### Frontend Testing

Create tests in `frontend/__tests__/`:

```typescript
// __tests__/RecitationInterface.test.tsx
import { render, screen } from '@testing-library/react';
import RecitationInterface from '@/components/RecitationInterface';

test('renders recording button', () => {
  render(<RecitationInterface surahNumber={1} ayahNumber={1} />);
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
});
```

Run tests:
```bash
cd frontend
npm test
```

## Documentation

When adding features, update:
- **README.md** - Overview and features
- **API.md** - API endpoints and schemas
- **Code comments** - Inline documentation
- **Component docs** - PropTypes and usage

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: Add Qalqalah rule detection
fix: Resolve WebSocket reconnection issue
docs: Update API documentation
style: Format code with Black
refactor: Simplify audio processing logic
test: Add tests for Tajweed analyzer
chore: Update dependencies
```

## Release Process

1. **Update version numbers**
2. **Update CHANGELOG.md**
3. **Run all tests**
4. **Build production bundles**
5. **Create GitHub release**
6. **Deploy to production**

## Questions?

- Check existing documentation
- Search closed issues
- Ask in GitHub Discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**JazakAllahu Khayran for contributing to this project!** 🤲
