# 🚀 Deployment Guide for Marionetta

This guide will help you deploy your Mario game to Vercel.

## Prerequisites

- A GitHub/GitLab/Bitbucket account
- A Vercel account (free at [vercel.com](https://vercel.com))

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git add .
git commit -m "Initial commit: Marionetta game"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/marionetta.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration
5. Click "Deploy"
6. Wait for deployment to complete (usually 1-2 minutes)
7. Your game is live! 🎉

### Step 3: Get Your URL

After deployment, you'll receive a URL like:
- `https://marionetta-yourname.vercel.app`

Share it with friends and start playing!

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# From your project directory
vercel

# For production deployment
vercel --prod
```

Follow the prompts, and your game will be deployed!

## Method 3: One-Click Deploy

Click this button to deploy instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/marionetta)

(Replace YOUR_USERNAME with your GitHub username)

## Environment Configuration

No environment variables are needed for this game! It works out of the box.

## Custom Domain (Optional)

### Add a Custom Domain

1. Go to your project on Vercel Dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain (e.g., `play-mario.com`)
4. Follow Vercel's instructions to configure DNS
5. Your game will be available at your custom domain!

## PWA on Mobile

Once deployed, users can install your game as a PWA:

### iOS (Safari)
1. Visit your deployed URL
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name it and tap "Add"

### Android (Chrome)
1. Visit your deployed URL
2. Tap the menu (⋮)
3. Tap "Add to Home screen"
4. Confirm the installation

## Build Configuration

The project is configured with:
- **Framework**: Next.js 16
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 20

All settings are in `vercel.json` and configured automatically.

## Troubleshooting

### Build Fails

If your build fails on Vercel:

1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Try building locally first:
   ```bash
   npm run build
   ```

### Game Not Loading

If the game doesn't load after deployment:

1. Check browser console for errors
2. Clear browser cache
3. Try in incognito/private mode
4. Check that all files were deployed in Vercel dashboard

### PWA Not Working

If PWA features aren't working:

1. Ensure you're using HTTPS (Vercel provides this automatically)
2. Check that `/manifest.json` and `/sw.js` are accessible
3. Check browser console for service worker errors

## Performance Optimization

Your game is already optimized with:
- ✅ Static asset optimization
- ✅ Automatic code splitting
- ✅ Image optimization (if you add images)
- ✅ Server-side rendering (SSR)
- ✅ Turbopack for fast builds

## Analytics (Optional)

Add Vercel Analytics to track game usage:

1. Go to your project on Vercel
2. Navigate to "Analytics"
3. Enable Analytics
4. Install the package:
   ```bash
   npm install @vercel/analytics
   ```
5. Add to `app/layout.tsx`:
   ```tsx
   import { Analytics } from '@vercel/analytics/react';

   // In the body:
   <Analytics />
   ```

## Updating Your Game

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Update: your changes"
git push

# Vercel will automatically deploy the update!
```

## Monitoring

Monitor your game's performance:
- **Vercel Dashboard**: Real-time metrics
- **Browser DevTools**: Performance profiling
- **Lighthouse**: PWA and performance scores

## Support

If you encounter issues:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)
- Open an issue on your repository

---

**Happy Gaming! 🍄🎮**

Your Marionetta game is now ready to share with the world!
