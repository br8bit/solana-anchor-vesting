# Vercel Deployment Guide

This guide will help you deploy the Solana Vesting frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your Solana program deployed to devnet
3. Git repository with your code

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your repository
   - Select the `frontend` folder as the root directory

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**

   ```bash
   cd frontend
   vercel --prod
   ```

## Configuration

The frontend is pre-configured to:

- ✅ Connect to Solana devnet by default
- ✅ Use the correct program ID: `9EaFVdWxtmUro5U23yde2qezeL1LfbRnS4xuwSNDUWND`
- ✅ Include all necessary Solana wallet adapters
- ✅ Handle CORS and browser compatibility

## Environment Variables (Optional)

If you need to override any settings, you can add these environment variables in Vercel:

- `NEXT_PUBLIC_SOLANA_NETWORK`: Set to "devnet" (default)
- `NEXT_PUBLIC_PROGRAM_ID`: Your program ID (already configured)

## Post-Deployment

1. **Test the deployment**
   - Visit your Vercel URL
   - Connect a Solana wallet (Phantom, Solflare, etc.)
   - Ensure it connects to devnet
   - Test creating a vesting account

2. **Monitor**
   - Check Vercel dashboard for deployment logs
   - Monitor browser console for any errors

## Troubleshooting

### Build Errors

- Ensure all dependencies are properly installed
- Check that the build passes locally first: `npm run build`

### Wallet Connection Issues

- Ensure users are connected to devnet in their wallet
- Check browser console for connection errors

### Program Interaction Issues

- Verify the program ID matches your deployed program
- Ensure the program is deployed to devnet
- Check Solana Explorer for program status

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your custom domain
4. Follow DNS configuration instructions

Your Solana Vesting dApp is now live on Vercel! 🚀
