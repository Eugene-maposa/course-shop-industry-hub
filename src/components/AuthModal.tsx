
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (mode === 'login') {
        result = await signIn(email, password);
        if (!result.error) {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          onClose();
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        result = await signUp(email, password);
        if (!result.error) {
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account.",
          });
          onClose();
        }
      } else if (mode === 'reset') {
        result = await resetPassword(email);
        if (!result.error) {
          toast({
            title: "Reset Email Sent",
            description: "Please check your email for password reset instructions.",
          });
          setMode('login');
        }
      }

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRememberMe(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-nust-blue">
            {mode === 'login' && 'Login to IndustryHub'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset' && 'Reset Password'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-nust-blue hover:bg-nust-blue-dark"
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              mode === 'login' ? 'Login' :
              mode === 'signup' ? 'Create Account' :
              'Send Reset Email'
            )}
          </Button>
        </form>

        <div className="text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot your password?
              </button>
              <div>
                <span className="text-sm text-gray-600">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div>
              <span className="text-sm text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-sm text-blue-600 hover:underline"
              >
                Login
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-sm text-blue-600 hover:underline"
            >
              Back to login
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
