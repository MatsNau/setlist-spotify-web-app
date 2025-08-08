# Setlist to Spotify

Transform concert setlists from setlist.fm into Spotify playlists with a single click.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)

## 🎵 Overview

This full-stack application bridges the gap between live concert experiences and digital music consumption. Users can paste a setlist.fm URL, and the app automatically creates a Spotify playlist with all the songs from that concert. Currently hosted on: https://setlist-spotify-web-app.onrender.com/
**NOTE: You won't be able to use the hosted app since I only use the spotify API for developers. Thus your account needs a manual registration for the application.**

### Key Features

- 🔐 Secure OAuth 2.0 authentication with Spotify
- 🎸 Automatic setlist parsing from setlist.fm URLs
- 🔍 Intelligent track matching with fallback search strategies
- ✏️ Customizable playlist names
- 📱 Fully responsive design for all devices
- 🚀 One-click deployment ready
- 🔄 Keep-alive service prevents Render.com from sleeping
- 🏗️ Clean modular architecture with separated concerns

## 🏗️ Architecture & Technical Decisions

### Overall Architecture

The application follows a **modular client-server architecture** with clean separation of concerns:

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Client    │────▶│   Server    │────▶│  External    │
│   (React)   │◀────│  (Express)  │◀────│    APIs      │
│             │     │             │     │ • Spotify    │
│ Components  │     │ Services    │     │ • Setlist.fm │
│ Hooks       │     │ Controllers │     │ • KeepAlive  │
│ Services    │     │ Routes      │     └──────────────┘
└─────────────┘     └─────────────┘
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
client/src/
├── components/
│   ├── Layout/          # Header, LoginCard
│   ├── common/          # ErrorMessage, LoadingSpinner, ServerStatus
│   ├── setlist/         # SetlistInput, SetlistDetails
│   ├── playlist/        # PlaylistNameEditor, PlaylistActions
│   └── tracks/          # TrackList
├── hooks/               # Custom React hooks
│   ├── useSpotifyAuth   # Authentication management
│   ├── useServerStatus  # Health monitoring
│   └── useSetlist       # Setlist operations
├── services/            # API communication
├── types/               # TypeScript definitions
├── utils/               # Helper functions
│   ├── auth.ts          # Token management
│   └── setlist.ts       # Setlist processing
└── App.tsx              # Main application component
```

#### State Management
- **Decision**: React hooks instead of Redux
- **Rationale**:
  - Simplicity: No boilerplate for small app
  - Built-in: No additional dependencies
  - Sufficient: App has minimal global state

#### Custom Hooks
- `useSpotifyAuth`: Complete Spotify authentication flow and token management
- `useServerStatus`: Server health monitoring with automatic retry
- `useSetlist`: Setlist loading, track searching, and playlist creation

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

### Deployment Strategy

#### Render.com Configuration
- **Build Command**: Compiles both client and server
- **Start Command**: Runs Express server with keep-alive service
- **Static Files**: Served from Express in production
- **Environment**: Variables set in Render dashboard
- **Keep-Alive**: Prevents free tier from sleeping

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
# Install all dependencies (client + server)
npm run install-all

# Or install individually:
cd server && npm install
cd ../client && npm install
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

**Option 1: Both services (recommended)**
```bash
npm run dev
```

**Option 2: Separate terminals**
```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client  
cd client
npm run dev
```

**Access the application:**
- Client: http://localhost:5173
- Server API: http://localhost:3001/api

### Production Deployment on Render.com

1. **Build Configuration:**
   ```bash
   npm run build
   ```

2. **Environment Variables:**
   ```env
   # Required
   SETLIST_API_KEY=your-setlist-api-key
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   
   # Render-specific
   RENDER_EXTERNAL_URL=https://your-app.onrender.com
   CLIENT_URL=https://your-app.onrender.com
   SPOTIFY_REDIRECT_URI=https://your-app.onrender.com/callback
   ```

3. **Render Setup:**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set start command: `cd server && npm start`
   - Add environment variables
   - Deploy

4. **Keep-Alive Service:**
   - Automatically prevents Render free tier from sleeping
   - Pings server every 14 minutes
   - Logs activity for monitoring

## 📁 Project Structure

```
.
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── environment.js     # Environment configuration
│   │   ├── controllers/
│   │   │   ├── healthController.js      # Health check endpoint
│   │   │   ├── spotifyController.js     # Spotify API handlers
│   │   │   └── setlistController.js     # Setlist API handlers
│   │   ├── middleware/
│   │   │   └── logging.js         # Request logging middleware
│   │   ├── routes/
│   │   │   └── index.js           # Route definitions
│   │   ├── services/
│   │   │   ├── spotifyService.js  # Spotify API business logic
│   │   │   ├── setlistService.js  # Setlist.fm API business logic
│   │   │   └── keepAliveService.js # Render keep-alive service
│   │   └── utils/
│   │       └── crypto.js          # Utility functions
│   ├── package.json
│   └── index.js                   # Server entry point
├── client/
│   ├── src/
│   │   ├── components/            # Modular React components
│   │   │   ├── Layout/           # App structure components
│   │   │   ├── common/           # Shared UI components
│   │   │   ├── setlist/          # Setlist-specific components
│   │   │   ├── playlist/         # Playlist management
│   │   │   └── tracks/           # Track display components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/
│   │   │   └── api.ts            # API client
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript type definitions
│   │   ├── utils/                # Client-side utilities
│   │   └── App.tsx               # Main application component
│   ├── package.json
│   └── index.html
├── keep-alive-instructions.md     # Render deployment guide
└── README.md
```

## 🔧 Development

### Code Style & Architecture

- **ESLint**: Enforced code standards
- **Prettier**: Consistent formatting
- **TypeScript**: Type safety on frontend
- **Modular Design**: Separated concerns with services, hooks, and components
- **Clean Architecture**: Business logic separated from UI
- **Conventional Commits**: Semantic versioning

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Setlist.fm](https://www.setlist.fm) for concert data
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for music platform integration
- [Render.com](https://render.com) for hosting

---

Built with ❤️ by developers who love live music
