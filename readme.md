# Setlist to Spotify

Transform concert setlists from setlist.fm into Spotify playlists with a single click.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)

## 🎵 Overview

This full-stack application bridges the gap between live concert experiences and digital music consumption. Users can paste a setlist.fm URL, and the app automatically creates a Spotify playlist with all the songs from that concert.

### Key Features

- 🔐 Secure OAuth 2.0 authentication with Spotify
- 🎸 Automatic setlist parsing from setlist.fm URLs
- 🔍 Intelligent track matching with fallback search strategies
- ✏️ Customizable playlist names
- 📱 Fully responsive design for all devices
- 🚀 One-click deployment ready

## 🏗️ Architecture & Technical Decisions

### Overall Architecture

The application follows a **client-server architecture** with clear separation of concerns:

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Client    │────▶│   Server    │────▶│  External    │
│   (React)   │◀────│  (Express)  │◀────│    APIs      │
└─────────────┘     └─────────────┘     └──────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │   Static    │
                    │   Files     │
                    └─────────────┘
```

### Key Technical Decisions

#### 1. **Full-Stack JavaScript/TypeScript**
- **Decision**: Use Node.js/Express for backend and React/TypeScript for frontend
- **Rationale**: 
  - Single language across the stack reduces context switching
  - Shared types and interfaces between client and server
  - Large ecosystem and community support
  - Excellent tooling and developer experience

#### 2. **Server-Side API Key Management**
- **Decision**: Move all API interactions to the backend
- **Rationale**:
  - Security: API keys never exposed to client
  - CORS: Bypasses browser CORS restrictions for setlist.fm API
  - Token management: Secure handling of Spotify refresh tokens
  - Rate limiting: Centralized control over API requests

#### 3. **OAuth 2.0 Authorization Code Flow**
- **Decision**: Use Authorization Code Flow instead of Implicit Flow
- **Rationale**:
  - More secure: Access tokens not exposed in URL
  - Refresh tokens: Long-lived sessions without re-authentication
  - Industry standard: Recommended by OAuth 2.0 Security BCP

#### 4. **Token Storage Strategy**
- **Decision**: Store tokens in localStorage with expiration tracking
- **Rationale**:
  - Persistence: Users remain logged in across sessions
  - Simplicity: No need for complex session management
  - Trade-off: Acceptable for non-critical application
  - Future: Could migrate to httpOnly cookies for enhanced security

#### 5. **Monorepo Structure**
- **Decision**: Keep client and server in single repository
- **Rationale**:
  - Simplified deployment: Single git push deploys everything
  - Shared configuration: Common ESLint, prettier, etc.
  - Easier development: No need to manage multiple repos
  - Atomic changes: Frontend and backend changes in same commit

#### 6. **Static File Serving**
- **Decision**: Express serves React build in production
- **Rationale**:
  - Single deployment: One service on Render.com
  - Cost effective: No need for separate static hosting
  - Simplified CORS: Same origin for API and client
  - Trade-off: Slightly slower than CDN for static assets

#### 7. **Responsive Design with Tailwind CSS**
- **Decision**: Use Tailwind CSS for styling
- **Rationale**:
  - Rapid development: Utility-first approach
  - Consistency: Design system built-in
  - Performance: PurgeCSS removes unused styles
  - Responsive: Mobile-first breakpoint system

#### 8. **Error Handling Strategy**
- **Decision**: Graceful degradation with user-friendly messages
- **Rationale**:
  - User experience: Clear feedback on what went wrong
  - Debugging: Detailed logs on server, simplified messages on client
  - Recovery: Show which tracks weren't found, still create playlist

### API Design

#### RESTful Endpoints

```
GET  /api/health                 # Health check
GET  /api/spotify/auth-url       # Get Spotify OAuth URL
POST /api/spotify/token          # Exchange code for token
POST /api/spotify/refresh        # Refresh access token
POST /api/spotify/search-tracks  # Search multiple tracks
POST /api/spotify/create-playlist # Create playlist
POST /api/setlist/from-url       # Parse setlist from URL
```

#### Design Principles
- **Stateless**: No server-side session storage
- **Resource-oriented**: Clear resource boundaries
- **Consistent**: Predictable request/response formats
- **Secure**: All sensitive operations on backend

### Frontend Architecture

#### Component Structure
```
components/
├── Layout/          # App structure
├── Auth/            # Authentication flows  
├── Setlist/         # Setlist display
├── Playlist/        # Playlist creation
└── Common/          # Shared components
```

#### State Management
- **Decision**: React hooks instead of Redux
- **Rationale**:
  - Simplicity: No boilerplate for small app
  - Built-in: No additional dependencies
  - Sufficient: App has minimal global state

#### Custom Hooks
- `useAuth`: Authentication logic and token management
- `useServerStatus`: Health check monitoring
- `useSetlist`: Setlist loading and processing

### Security Considerations

1. **API Key Protection**
   - All keys stored in environment variables
   - Never exposed to client code
   - Validated on server startup

2. **Input Validation**
   - URL pattern matching for setlist.fm links
   - Sanitization of user inputs
   - Request body validation

3. **Rate Limiting** (Future Enhancement)
   - Prevent abuse of external APIs
   - Protect against DDoS

4. **HTTPS Only**
   - Enforced in production
   - Secure token transmission

### Performance Optimizations

1. **Lazy Loading**
   - Components loaded as needed
   - Reduced initial bundle size

2. **Batch Operations**
   - Spotify tracks added in batches of 100
   - Parallel track searches where possible

3. **Caching Strategy** (Future Enhancement)
   - Cache setlist data
   - Cache track search results

### Deployment Strategy

#### Render.com Configuration
- **Build Command**: Compiles both client and server
- **Start Command**: Runs Express server
- **Static Files**: Served from Express in production
- **Environment**: Variables set in Render dashboard

#### CI/CD Pipeline
- **Automatic Deployments**: On push to main branch
- **Zero Downtime**: Render handles blue-green deployments
- **Rollback**: Easy reversion to previous versions

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Spotify Developer Account
- Setlist.fm API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/setlist-spotify-fullstack.git
cd setlist-spotify-fullstack
```

2. Install dependencies:
```bash
npm run install-all
```

3. Configure environment variables:

**server/.env**
```env
SETLIST_API_KEY=your-setlist-api-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
CLIENT_URL=http://localhost:5173
PORT=3001
```

**client/.env**
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start development servers:
```bash
npm run dev
```

### Production Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Render.com:
   - Connect GitHub repository
   - Set environment variables
   - Deploy

## 📁 Project Structure

```
.
├── server/
│   ├── src/
│   │   ├── config/        # Configuration management
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── app.js         # Express app setup
│   └── index.js           # Server entry point
├── client/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API communication
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main component
│   └── index.html         # Entry HTML
└── README.md
```

## 🔧 Development

### Code Style

- **ESLint**: Enforced code standards
- **Prettier**: Consistent formatting
- **TypeScript**: Type safety on frontend
- **Conventional Commits**: Semantic versioning

### Testing Strategy (Future Enhancement)

- **Unit Tests**: Jest for business logic
- **Integration Tests**: Supertest for API
- **E2E Tests**: Cypress for user flows

### Development Workflow

1. Create feature branch
2. Make changes
3. Run tests
4. Create pull request
5. Merge after review

## 📊 Monitoring & Analytics (Future Enhancement)

- **Error Tracking**: Sentry integration
- **Performance**: Web Vitals monitoring
- **Usage Analytics**: Privacy-focused analytics
- **Uptime Monitoring**: Status page

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Setlist.fm](https://www.setlist.fm) for concert data
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for music platform integration
- [Render.com](https://render.com) for hosting

## 🔮 Future Enhancements

1. **User Accounts**: Save playlist history
2. **Batch Processing**: Create multiple playlists at once
3. **Smart Matching**: ML-based track matching
4. **Social Features**: Share playlists with friends
5. **Analytics Dashboard**: Track playlist statistics
6. **Mobile App**: Native iOS/Android apps
7. **Offline Support**: PWA capabilities
8. **Multi-language**: i18n support

---

Built with ❤️ by developers who love live music
