# BuffrSign Web Application

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Redis environment variables:**
   ```bash
   npm run setup:redis
   ```

3. **Verify Redis configuration:**
   ```bash
   npm run verify:redis
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 📚 Documentation

- **Redis Integration**: See [REDIS_SETUP.md](./REDIS_SETUP.md) for comprehensive Redis integration guide
- **API Documentation**: Check the API routes for backend integration with Redis
- **Component Library**: Browse the components directory for reusable UI components
- **Real-time Features**: Review hooks and components for real-time functionality
- **Testing Guide**: Use provided testing tools and components for Redis verification

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup:redis` - Set up Redis environment variables
- `npm run verify:redis` - Verify Redis configuration

## 🛠️ Features

### Core Platform Features
- **Electronic Signatures**: ETA 2019 compliant digital signatures
- **Document Management**: Secure document upload, processing, and storage
- **Real-time Collaboration**: Live document editing and signing
- **Compliance Tracking**: ETA 2019 compliance monitoring and reporting
- **Audit Trail**: Comprehensive audit logging for regulatory requirements

### Technical Features
- **Redis Integration**: Comprehensive Redis support for:
  - Session management & JWT blacklisting
  - Real-time features & WebSocket communication
  - Caching layer for performance optimization
  - Background task processing & job queues
  - Rate limiting & security protection
  - User activity tracking & analytics
- **TypeScript**: Full TypeScript support with type safety
- **Next.js 14**: Latest Next.js with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library built on top of Tailwind CSS
- **Supabase**: Backend-as-a-Service integration
- **WebSocket**: Real-time communication for live updates
