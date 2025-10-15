# Longpoint

**AI-Native Media Asset Management**

Open source, self-hosted, intelligent media library that understands your content.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status: Alpha](https://img.shields.io/badge/Status-Alpha-yellow.svg)]()


## What is Longpoint?

Longpoint is a media asset management (MAM) system built AI-first, not AI-added. Unlike traditional media libraries that treat AI as an afterthought, Longpoint uses AI to fundamentally transform how you organize, search, and understand your media.

### Key Features

- **Intelligent Classification** - Automatic tagging, scene detection, and content analysis
- **Semantic Search** - Find content using natural language, not just filenames
- **Multi-Modal Understanding** - Analyze images, videos, audio, and documents
- **Bring Your Own Everything** - Your storage, your AI models, your infrastructure
- **Privacy First** - Self-hosted with local model support
- **Open Source** - MIT licensed, fully extensible

## Development Roadmap

### Phase 1: Foundation ✅ (Month 1)
**Status**: In Progress

- [x] Monorepo structure setup
- [ ] Basic API with NestJS
- [ ] Prisma schema design
- [ ] Storage abstraction layer
- [ ] Content upload & retrieval
- [ ] Basic web UI
- [ ] CLI to generate project

**Milestone**: Create longpoint project, upload content, and display it

### Phase 2: AI Integration (Month 2)
**Status**: Planned

- [ ] AI provider abstraction layer
- [ ] Claude integration for image analysis
- [ ] Job queue system (BullMQ)
- [ ] Analysis result storage & display
- [ ] Confidence scoring system

**Milestone**: Upload → Automatic AI analysis with tags & descriptions

### Phase 3: Search & Discovery (Month 3)
**Status**: Planned

- [ ] Vector embeddings generation
- [ ] Semantic search implementation
- [ ] Similar content recommendations
- [ ] Multi-provider support (OpenAI, Gemini)
- [ ] Search UI with filters

**Milestone**: Natural language search across all content

### Phase 4: Review & Management (Month 4)
**Status**: Planned

- [ ] Review queue for low-confidence analysis
- [ ] Batch operations (approve/reject/retag)
- [ ] Manual tag editing & override
- [ ] Analysis history & versioning
- [ ] Notification system

**Milestone**: Complete content management workflow

### Phase 5: Multi-Modal & Advanced (Month 5)
**Status**: Planned

- [ ] Video analysis (transcription, scene detection)
- [ ] Audio transcription & analysis
- [ ] Document text extraction & analysis
- [ ] Custom model deployment support
- [ ] Advanced configuration UI

**Milestone**: Support for all major media types

### Phase 6: Polish & Launch (Month 6)
**Status**: Planned

- [ ] Comprehensive documentation
- [ ] Docker deployment setup
- [ ] Demo instance deployment
- [ ] Performance optimization
- [ ] Security audit
- [ ] Public launch (HN, Reddit, Product Hunt)

**Milestone**: v1.0 public release