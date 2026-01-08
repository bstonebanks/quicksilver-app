import React, { useState } from 'react';
import { useCognitoAuth } from './CognitoAuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";

export default function CognitoSignupForm({ onSuccess }) {
  const { signUp, confirmSignUp, signIn } = useCognitoAuth();
  const [step, setStep] = useState('signup'); // 'signup' or 'confirm'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name);
      setStep('confirm');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp(email, verificationCode);
      await signIn(email, password);
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'signup' ? (
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
            />
            <p className="text-xs text-slate-500">Minimum 8 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base bg-gradient-to-r from-slate-500 to-blue-900 hover:from-slate-600 hover:to-blue-800"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Create Account
              </span>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              We've sent a verification code to <strong>{email}</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              className="h-11 text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base bg-gradient-to-r from-slate-500 to-blue-900 hover:from-slate-600 hover:to-blue-800"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              'Verify & Sign In'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep('signup')}
            className="w-full"
          >
            Back to Sign Up
          </Button>
        </form>
      )}
    </div>
  );
}