import React from 'react';
import { Route } from 'wouter';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';

type AuthenticatedLayoutProps = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedHeader />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}