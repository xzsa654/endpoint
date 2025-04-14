import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/dist/token-cache'
import React from 'react'
import { ConvexProviderWithClerk} from "convex/react-clerk"
import { ConvexReactClient } from "convex/react";

export default function ConvexAndClerkProvider({ children }: { children: React.ReactNode }) {
  const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string);
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
        </ConvexProviderWithClerk>
        </ClerkProvider>
  )
}