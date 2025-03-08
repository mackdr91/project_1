import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Login - Next.js MongoDB App',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AuthForm type="login" />
    </div>
  );
}
