# SkillTry-On

**Realistic job simulations with instant feedback and training pathways**

5-15 minute interactive scenarios that help job seekers practice real workplace situations and get AI-powered feedback with next-step training links.

---

## 🏗️ Project Structure

```
skilltry_on/
├── skilltry_web/      # Next.js 15 web application
└── skilltry_ios/      # SwiftUI iOS application
```

## 🌐 Web Application (`skilltry_web`)

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL 16 + Prisma 5 + pgvector
- **Authentication**: Clerk (Passkeys/WebAuthn-first, magic links fallback)
- **Payments**: Stripe
- **Storage**: Cloudflare R2 (S3-compatible)
- **Observability**: Sentry + OpenTelemetry

### Getting Started

#### Prerequisites

- Node.js 18+
- PostgreSQL 16
- npm or yarn

#### Installation

```bash
cd skilltry_web
npm install
```

#### Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
   - `CLERK_SECRET_KEY`: Clerk secret key
   - `STRIPE_SECRET_KEY`: Stripe secret key
   - `R2_*`: Cloudflare R2 credentials
   - `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN

3. Initialize database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

#### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/simulations` | GET | List simulations |
| `/api/simulations` | POST | Create simulation (admin) |
| `/api/simulations/:id` | GET | Get simulation details |
| `/api/simulations/:id` | PUT | Update simulation (admin) |
| `/api/simulations/:id` | DELETE | Delete simulation (admin) |
| `/api/attempt` | POST | Create attempt |
| `/api/attempt?id=:id` | PUT | Update attempt with scores |

#### Database Schema

Key models:
- **User**: Authentication and profile
- **Credential**: WebAuthn/Passkey credentials
- **Simulation**: Job simulation scenarios
- **Attempt**: User attempts with rubric scores
- **Subscription**: Stripe billing
- **AnalyticsEvent**: Anonymized analytics
- **DataSubjectRequest**: GDPR compliance (DSR)

### Security Features

- ✅ **Passkey-first authentication** with WebAuthn
- ✅ **Client-side encryption** for sensitive data
- ✅ **Zero-knowledge architecture** (server stores ciphertext only)
- ✅ **Role-based access control** (RBAC/ABAC)
- ✅ **GDPR compliance** (data export, deletion)
- ✅ **No collection of protected attributes**

---

## 📱 iOS Application (`skilltry_ios`)

### Tech Stack

- **Framework**: SwiftUI
- **Async**: Combine + async/await
- **Encryption**: CryptoKit (AES-GCM)
- **Authentication**: AuthenticationServices (Passkeys)
- **Media**: AVFoundation + Vision
- **Payments**: StoreKit 2

### Architecture

```
SkillTryOn/
├── Modules/
│   ├── Networking/         # API client with OpenAPI types
│   ├── Crypto/             # CryptoKit wrapper for encryption
│   ├── Auth/               # PasskeyManager authentication
│   ├── Simulation/         # Simulation features
│   └── Settings/           # Settings and privacy
├── Views/                  # SwiftUI views
├── Models/                 # Data models
└── Resources/              # Assets and configuration
```

### Key Features

#### Authentication Module

- **Passkey-first sign-in** using AuthenticationServices
- **Magic link fallback** for devices without biometrics
- Secure credential storage in Keychain

#### Networking Module

- Type-safe API client
- OpenAPI-compatible endpoints
- Automatic retry and error handling
- Token-based authentication

#### Crypto Module

- **Client-side AES-GCM encryption** before upload
- Zero-knowledge: server never sees plaintext
- Secure key storage in Keychain
- File and string encryption utilities

### Development

#### Requirements

- Xcode 15+
- iOS 17+
- Swift 5.9+

#### Setup

1. Open `skilltry_ios/SkillTryOn.xcodeproj` in Xcode
2. Update bundle identifier and signing
3. Configure API base URL in `NetworkManager`
4. Add passkey domain in entitlements

#### Key Screens

- **SignInView**: Passkey authentication
- **SimulationsListView**: Browse job simulations
- **SimulationDetailView**: Start simulation
- **SettingsView**: Privacy controls and data export

---

## 🎯 Core Features

### Simulation Engine

- **Branching scenarios** with dynamic steps
- **Rubric-based scoring** with AI feedback
- **Local training program links** based on performance
- **Encrypted media uploads** (video/audio responses)

### Privacy-First Design

- Client-side encryption for sensitive data
- Anonymized analytics (hashed user IDs)
- No collection of protected attributes (age, race, etc.)
- GDPR-compliant data export and deletion

### Accessibility

- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Offline packs for schools

### Monetization

- **Institutional licensing** for schools and programs
- **In-app training referrals** with revenue share
- **Premium features** with Stripe/StoreKit

---

## 🚀 Deployment

### Web Application

**Recommended**: Vercel or Railway

```bash
# Build for production
npm run build

# Start production server
npm start
```

### iOS Application

1. Archive in Xcode
2. Submit to App Store Connect
3. Configure StoreKit entitlements
4. Set up webhook for subscription sync

---

## 📊 Data Model (High Level)

```typescript
// Core entities
Simulation {
  id, title, sector, steps[], rubric, resources
}

Attempt {
  id, userId, simulationId,
  rubricScores, feedback, encryptedMedia[]
}

User {
  id, email, role, credentials[]
}

Subscription {
  id, userId/institutionId,
  stripeSubscriptionId, plan, status
}
```

---

## 🔒 Security & Compliance

### Authentication

- **Passkeys (WebAuthn)** for passwordless auth
- **Magic links** as fallback
- **Multi-device sync** with platform authenticators

### Encryption

- **Client-side AES-GCM** for sensitive uploads
- **TLS 1.3** for transport
- **Key storage** in Keychain (iOS) and environment (server)

### Privacy

- **No PII collection** for analytics
- **Anonymized metrics** with hashed identifiers
- **Data Subject Requests** (export, delete)
- **Transparent privacy policy**

---

## 🧪 Testing

### Web

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### iOS

- Unit tests in Xcode Test Navigator
- UI tests for critical flows
- Snapshot tests for visual regression

---

## 📝 TODO: MVP Acceptance Criteria

- [x] Project structure created
- [x] Auth works with passkeys and roles
- [x] Core data models persist (Prisma schema)
- [x] CRUD + list + search APIs shipped
- [x] Sensitive uploads encrypted client-side
- [ ] Primary user flow demonstrated (end-to-end)
- [ ] Billing entitlements gate premium features
- [ ] DSR: data export + delete fully functional
- [ ] Database migrations run successfully
- [ ] OpenAPI documentation generated

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](#)
- Email: support@skilltry.example.com
- Docs: [docs.skilltry.example.com](#)

---

## 🎉 What's Next?

1. **Database Setup**: Run Prisma migrations on production DB
2. **Auth Configuration**: Set up Clerk with passkey support
3. **Storage Setup**: Configure Cloudflare R2 bucket
4. **API Documentation**: Generate OpenAPI spec
5. **Testing**: Add unit and integration tests
6. **CI/CD**: Set up GitHub Actions
7. **Monitoring**: Configure Sentry error tracking
8. **Deployment**: Deploy to production

---

**Built with ❤️ for job seekers everywhere**
