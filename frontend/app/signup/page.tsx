import { SignupForm } from "@/components/auth/SignupForm";
import { AuthScreen } from "@/components/auth/AuthScreen";

export default function SignupPage() {
  return (
    <AuthScreen heading="新規登録">
      <SignupForm />
    </AuthScreen>
  );
}
