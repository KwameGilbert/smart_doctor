import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

/**
 * Secure token storage utility wrapping expo-secure-store.
 */
export const tokenStorage = {
  /**
   * Retrieve the authentication token.
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error retrieving JWT token from SecureStore:", error);
      return null;
    }
  },

  /**
   * Securely save the authentication token.
   */
  async saveToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error saving JWT token to SecureStore:", error);
    }
  },

  /**
   * Remove the authentication token (logout/invalidation).
   */
  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error removing JWT token from SecureStore:", error);
    }
  },
};
