import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/models/User';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        
        await dbConnect();
        
        // Find user by email and explicitly include the password field
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        if (!user) {
          throw new Error('No user found with this email');
        }
        
        // Check if password matches
        const isPasswordValid = await user.comparePassword(credentials.password);
        
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }
        
        // Update last login time
        user.lastLogin = new Date();
        await user.save();
        
        // Return user without password
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.isVerified = user.isVerified || true;
        
        // Store avatar URL if available
        if (user.image) {
          token.picture = user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        
        // Add avatar URL to session if available
        if (token.picture) {
          session.user.image = token.picture;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          await dbConnect();
          
          // Check if user already exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create a new user with Google profile data
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              password: Math.random().toString(36).slice(-10), // Random password
              isVerified: true, // Auto-verify Google users
              role: 'user',
              image: user.image // Store the avatar URL
            });
            
            user.id = newUser._id.toString();
            user.role = 'user';
            user.isVerified = true;
          } else {
            // Update existing user's last login and avatar if needed
            existingUser.lastLogin = new Date();
            
            // Update avatar if it exists and has changed
            if (user.image && existingUser.image !== user.image) {
              existingUser.image = user.image;
            }
            
            await existingUser.save();
            
            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.isVerified = existingUser.isVerified;
            // Ensure image is passed through
            if (existingUser.image) {
              user.image = existingUser.image;
            }
          }
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      return true;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-default-secret-key-change-this-in-production',
});

export { handler as GET, handler as POST };
