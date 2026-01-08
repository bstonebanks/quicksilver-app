import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import CognitoLoginForm from '../components/auth/CognitoLoginForm';
import CognitoSignupForm from '../components/auth/CognitoSignupForm';
import { createPageUrl } from '@/utils';

export default function Auth() {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-400 to-blue-900 items-center justify-center mb-4 shadow-xl overflow-hidden">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693b33d51f81e96e437bf0bf/0742d052d_Quicksilverlogosimple.png" 
              alt="QuickSilver" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">QuickSilver</h1>
          <p className="text-slate-600">Instant Toll Payment</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in or create an account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <CognitoLoginForm onSuccess={handleAuthSuccess} />
              </TabsContent>
              
              <TabsContent value="signup">
                <CognitoSignupForm onSuccess={handleAuthSuccess} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          Secured by AWS Cognito
        </p>
      </motion.div>
    </div>
  );
}