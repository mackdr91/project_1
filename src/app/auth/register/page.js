import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Register - Next.js MongoDB App',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AuthForm type="register" />
    </div>
  );
}
