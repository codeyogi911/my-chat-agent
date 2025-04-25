/**
 * User info tools for the AI chat agent
 */
import { tool } from "ai";
import { z } from "zod";

/**
 * Tool to check if the user is currently logged in
 * No human confirmation required
 */
export const getUserLoginStatus = tool({
  description: "Check if the user is currently logged in",
  parameters: z.object({}),
  execute: async () => {
    try {
      // Get API base URL and auth token from environment variables
      const authToken = process.env.AUTH_TOKEN || "";
      
      // Simple check: if auth token exists, consider the user logged in
      const isLoggedIn = !!authToken && authToken.length > 0;
      
      return {
        isLoggedIn,
        message: isLoggedIn 
          ? "User is currently logged in."
          : "User is not logged in.",
      };
    } catch (error) {
      console.error(`Error checking user login status: ${error}`);
      return {
        isLoggedIn: false,
        message: `Failed to check login status: ${error}`,
        error: String(error)
      };
    }
  },
});

/**
 * Tool to get detailed user information if logged in
 * No human confirmation required
 */
export const getUserInfo = tool({
  description: "Get detailed information about the currently logged in user",
  parameters: z.object({}),
  execute: async () => {
    try {
      // Get API base URL and auth token from environment variables
      const authToken = process.env.AUTH_TOKEN || "";
      const authHeaderName = process.env.AUTH_HEADER_NAME || "x-approuter-authorization";
      const baseUrl = process.env.API_BASE_URL || "https://mymediset-xba-dev-eu10.dev.mymediset.cloud/catalog/BookingService";
      const userInfoUrl = `${baseUrl}/user-api/currentUser`;
      
      // Check if user is logged in
      const isLoggedIn = !!authToken && authToken.length > 0;
      
      if (!isLoggedIn) {
        return {
          success: false,
          message: "User is not logged in.",
          isLoggedIn: false
        };
      }
      
      // If no user info URL is configured, return basic logged in status
      if (!userInfoUrl) {
        return {
          success: true,
          message: "User is logged in, but no user info endpoint is configured.",
          isLoggedIn: true,
          user: {
            loggedIn: true
          }
        };
      }
      
      // Fetch detailed user info from the backend
      const response = await fetch(userInfoUrl, {
        headers: {
          [authHeaderName]: authToken
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }
      
      const userInfo = await response.json();
      
      return {
        success: true,
        message: "Successfully retrieved user information.",
        isLoggedIn: true,
        user: userInfo
      };
    } catch (error) {
      console.error(`Error getting user info: ${error}`);
      return {
        success: false,
        message: `Failed to retrieve user information: ${error}`,
        isLoggedIn: true, // Still return logged in if token exists but info fetch failed
        error: String(error)
      };
    }
  },
});

// Export all user info tools
export const userInfoTools = {
  getUserLoginStatus,
  getUserInfo
}; 