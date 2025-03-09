# AI Flow - Smart Invoice Management

AI Flow is a powerful SaaS application that helps businesses automate their invoice management using AI. Built with Next.js and MongoDB, it offers smart task automation, workflow optimization, and AI-driven insights.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

To deploy this application on Vercel:

1. Push your code to GitHub

2. Visit [Vercel](https://vercel.com) and create a new project

3. Import your GitHub repository

4. Configure the following environment variables in Vercel's project settings:
   ```
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-secure-secret
   MONGODB_URI=your-mongodb-connection-string
   ```

5. Deploy the application

### Important Notes
- Ensure your MongoDB instance is accessible from Vercel's servers
- Use a strong NEXTAUTH_SECRET for production
- Update NEXTAUTH_URL to match your Vercel deployment URL
