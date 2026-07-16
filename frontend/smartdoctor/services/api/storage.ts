import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const ONBOARDING_KEY = "has_completed_onboarding";

const isWeb = Platform.OS === "web";

/**
 * Secure token storage utility wrapping expo-secure-store with a web fallback.
 */
export const tokenStorage = {
  /**
   * Retrieve the authentication token.
   */
  async getToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return localStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error retrieving JWT token:", error);
      return null;
    }
  },

  /**
   * Securely save the authentication token.
   */
  async saveToken(token: string): Promise<void> {
    try {
      if (isWeb) {
        localStorage.setItem(TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error saving JWT token:", error);
    }
  },

  /**
   * Remove the authentication token (logout/invalidation).
   */
  async removeToken(): Promise<void> {
    try {
      if (isWeb) {
        localStorage.removeItem(TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error removing JWT token:", error);
    }
  },

  /**
   * Retrieve onboarding status.
   */
  async getOnboardingStatus(): Promise<boolean> {
    try {
      if (isWeb) {
        const val = localStorage.getItem(ONBOARDING_KEY);
        return val === "true";
      }
      const val = await SecureStore.getItemAsync(ONBOARDING_KEY);
      return val === "true";
    } catch (error) {
      console.error("Error retrieving onboarding status:", error);
      return false;
    }
  },

  /**
   * Save onboarding completion status.
   */
  async setOnboardingCompleted(): Promise<void> {
    try {
      if (isWeb) {
        localStorage.setItem(ONBOARDING_KEY, "true");
        return;
      }
      await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  },
};

