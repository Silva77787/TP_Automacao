import { useAuth } from "@/context/AuthContext";
import React from "react";
import { ActivityIndicator, View, Text } from "react-native";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#666" }}>
          Please log in to continue
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}