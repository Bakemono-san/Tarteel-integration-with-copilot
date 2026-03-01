# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- User authentication and accounts
- Progress tracking and statistics
- Audio playback of correct recitation
- Mobile app (React Native)
- Offline mode support
- Additional Tajweed rules
- Multiple Quranic text sources
- Community features

## [1.0.0] - 2026-03-01

### Added
- Initial release of Quran Recitation App
- Real-time Arabic speech recognition using Tarteel AI models
- WebSocket-based audio streaming for live analysis
- Comprehensive Tajweed rule detection:
  - Qalqalah (ق ط ب ج د)
  - Ghunna (ن م)
  - Madd (Prolongation)
  - Idgham (Merging)
  - Ikhfa (Hiding)
- Error detection and correction suggestions
- Scoring system (0-100) with accuracy percentages
- Modern Next.js frontend with responsive design
- FastAPI backend with PyTorch and Transformers
- Support for multiple AI models:
  - Tarteel Whisper models
  - Wav2Vec2 Arabic models
  - OpenAI Whisper fallback
- Sample Quran data for 3 Surahs:
  - Al-Fatihah (7 ayahs)
  - Al-Baqarah (5 ayahs)
  - Al-Ikhlas (4 ayahs)
- Beautiful Arabic typography with Amiri font
- Real-time feedback with visual error highlighting
- Microphone recording with MediaRecorder API
- Docker support for easy deployment
- Comprehensive documentation:
  - README.md
  - QUICKSTART.md
  - API.md
  - CONTRIBUTING.md
- Setup and start scripts for easy installation

### Technical Features
- FastAPI with WebSocket support
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Real-time audio processing with librosa
- Automatic model loading and fallback
- Cross-browser compatibility
- Responsive design for mobile and desktop

### Documentation
- Complete API documentation with examples
- Quick start guide
- Contributing guidelines
- Code style guidelines
- Troubleshooting guide

## [0.1.0] - 2026-02-15

### Added
- Initial project setup
- Basic project structure
- Development environment configuration

---

## Version History

### Version Numbering

- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (1.X.0)**: New features, backwards compatible
- **Patch (1.0.X)**: Bug fixes, minor improvements

### Release Schedule

- **Major releases**: Every 6-12 months
- **Minor releases**: Every 1-2 months
- **Patch releases**: As needed for bug fixes

---

For more details on specific changes, see the [commit history](https://github.com/yourusername/quran-recitation-app/commits/main).
