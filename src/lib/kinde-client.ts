import {
  managementApi,
  type UsersApi,
  type PermissionsApi,
  type OrganizationsApi,
  Configuration,
} from "@kinde-oss/kinde-typescript-sdk";
import debug from "debug";

const log = debug("api:kinde:client");

/**
 * Configuration for retry behavior when API calls fail
 */
interface RetryConfig {
  maxRetries: number; // Maximum number of retry attempts
  baseDelay: number; // Base delay in milliseconds for first retry
  maxDelay: number; // Maximum delay cap to prevent excessive waiting
}

/**
 * Default retry configuration for API calls
 * Uses exponential backoff: 1s, 2s, 4s, 8s (capped at 10s)
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Utility function to create a delay
 * @param ms - Delay in milliseconds
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff for API calls
 *
 * This function implements resilient API calls by automatically retrying failed operations.
 * It uses exponential backoff to avoid overwhelming the API during temporary issues.
 *
 * Retry Strategy:
 * - Attempt 1: Immediate
 * - Attempt 2: Wait 1s
 * - Attempt 3: Wait 2s
 * - Attempt 4: Wait 4s
 * - Maximum delay capped at 10s
 *
 * @param operation - The async operation to retry
 * @param config - Retry configuration (optional, uses defaults)
 * @returns Promise that resolves with the operation result
 * @throws The last error if all retries are exhausted
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<T> {
  let lastError: Error;

  // Try the operation up to maxRetries + 1 times (initial attempt + retries)
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // If this was our last attempt, give up and throw the error
      if (attempt === config.maxRetries) {
        log(`Operation failed after ${config.maxRetries + 1} attempts:`, lastError);
        throw lastError;
      }

      // Calculate delay with exponential backoff: baseDelay * 2^attempt
      // This means delays increase exponentially: 1s, 2s, 4s, 8s...
      const delay = Math.min(config.baseDelay * Math.pow(2, attempt), config.maxDelay);

      log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
      await sleep(delay);
    }
  }

  // This should never be reached due to the throw above, but TypeScript requires it
  throw lastError!;
}

/**
 * Configuration interface for Kinde client initialization
 */
export interface KindeConfig {
  basePath: string; // Kinde issuer URL (e.g., https://your-domain.kinde.com)
  accessToken: string; // Kinde management API token
}

/**
 * Kinde Management API Client
 *
 * This class provides a wrapper around the Kinde Management API with:
 * - Automatic retry logic for transient failures
 * - Centralized error handling
 * - Type-safe API interactions
 * - Logging for debugging and monitoring
 *
 * The client handles user management, permission assignment, and organization operations
 * with built-in resilience for production environments.
 */
export class KindeClient {
  private config: Configuration;
  private permissionsClient: PermissionsApi;
  private organizationsClient: OrganizationsApi;
  private usersClient: UsersApi;

  /**
   * Initialize the Kinde client with configuration
   * @param config - Kinde configuration containing basePath and accessToken
   */
  constructor(config: KindeConfig) {
    // Create the base configuration for all API clients
    this.config = new Configuration({
      basePath: config.basePath,
      accessToken: config.accessToken,
    });

    // Initialize specialized API clients for different operations
    this.permissionsClient = new managementApi.apis.PermissionsApi(this.config);
    this.organizationsClient = new managementApi.apis.OrganizationsApi(this.config);
    this.usersClient = new managementApi.apis.UsersApi(this.config);
  }

  /**
   * Create a KindeClient instance from environment variables
   *
   * This is the recommended way to initialize the client in production.
   * It validates that all required environment variables are present.
   *
   * Required Environment Variables:
   * - KINDE_ISSUER_URL: Your Kinde domain (e.g., https://your-domain.kinde.com)
   * - KINDE_API_TOKEN: Your Kinde management API token
   *
   * @returns Configured KindeClient instance
   * @throws Error if required environment variables are missing
   */
  static fromEnv(): KindeClient {
    const basePath = process.env.KINDE_ISSUER_URL;
    const accessToken = process.env.KINDE_API_TOKEN;

    // Validate that all required environment variables are present
    if (!basePath || !accessToken) {
      throw new Error(
        "Missing required Kinde environment variables: KINDE_ISSUER_URL, KINDE_API_TOKEN",
      );
    }

    return new KindeClient({ basePath, accessToken });
  }

  /**
   * Get the internal permission ID for a permission key
   *
   * This method looks up the Kinde-internal permission ID that corresponds
   * to a human-readable permission key (e.g., "access:navigator").
   *
   * The permission ID is required for assigning permissions to users,
   * as Kinde's API uses internal IDs rather than the user-facing keys.
   *
   * @param key - The permission key to look up (e.g., "access:navigator")
   * @returns Promise that resolves to the permission ID
   * @throws Error if the permission key is not found
   */
  async getPermissionIdByKey(key: string): Promise<string> {
    return withRetry(async () => {
      // Fetch all permissions (up to 200) to find the one with matching key
      const res = await this.permissionsClient.getPermissions({ pageSize: 200 });
      const match = res.permissions?.find((p) => p.key === key);

      // Validate that we found a permission with the requested key
      if (!match?.id) {
        throw new Error(`Permission with key "${key}" not found`);
      }

      return match.id;
    });
  }

  /**
   * Grant a permission to a user within an organization
   *
   * This method assigns a specific permission to a user in a Kinde organization.
   * It handles the common case where a permission is already assigned gracefully.
   *
   * The process:
   * 1. Look up the permission ID from the permission key
   * 2. Attempt to assign the permission to the user
   * 3. Handle "already assigned" errors as success (idempotent operation)
   * 4. Retry on transient failures
   *
   * @param orgCode - The organization code where the user belongs
   * @param userId - The Kinde user ID to grant permission to
   * @param permissionKey - The permission key to grant (e.g., "access:navigator")
   * @returns Promise that resolves when permission is granted
   * @throws Error if permission assignment fails after retries
   */
  async grantPermissionToUser({
    orgCode,
    userId,
    permissionKey,
  }: {
    orgCode: string;
    userId: string;
    permissionKey: string;
  }): Promise<void> {
    return withRetry(async () => {
      // First, get the internal permission ID from the permission key
      const permissionId = await this.getPermissionIdByKey(permissionKey);

      try {
        // Attempt to assign the permission to the user in the organization
        await this.organizationsClient.createOrganizationUserPermission({
          orgCode,
          userId,
          createOrganizationUserPermissionRequest: { permissionId },
        });

        log(`Successfully granted permission ${permissionKey} to user ${userId}`);
      } catch (error: unknown) {
        const err = error as { response?: Response };

        // Handle the case where permission is already assigned (400 status)
        if (err.response?.status === 400) {
          try {
            const errorBody = await err.response.json();
            // If the error indicates permission is already assigned, treat as success
            if (errorBody.errors?.[0]?.code === "PERMISSION_ALREADY_ASSIGNED") {
              log(`Permission ${permissionKey} already assigned to user ${userId}`);
              return; // This is benign, don't retry
            }
          } catch (parseError) {
            log("Error parsing error response:", parseError);
          }
        }

        // Re-throw the error to trigger retry logic for other types of failures
        throw error;
      }
    });
  }

  /**
   * Refresh user claims to make new permissions immediately available
   *
   * After granting permissions to a user, their claims need to be refreshed
   * to make the new permissions available in their JWT tokens immediately.
   * Without this step, users would need to log out and back in to see new permissions.
   *
   * This is typically called after successfully granting a permission to ensure
   * the user can immediately access the protected resources.
   *
   * @param userId - The Kinde user ID to refresh claims for
   * @returns Promise that resolves when claims are refreshed
   * @throws Error if claim refresh fails after retries
   */
  async refreshUserClaims(userId: string): Promise<void> {
    return withRetry(async () => {
      await this.usersClient.refreshUserClaims({ userId });
      log(`Successfully refreshed claims for user ${userId}`);
    });
  }

  /**
   * Find a user by their email address
   *
   * This method searches for a user in Kinde by their email address.
   * It's commonly used in webhook scenarios where we have a customer email
   * from a payment system and need to find the corresponding Kinde user.
   *
   * The search is limited to 1 result since email addresses should be unique.
   *
   * @param email - The email address to search for
   * @returns Promise that resolves to the user object if found, null otherwise
   * @throws Error if the user search fails after retries
   */
  async findUserByEmail(email: string) {
    return withRetry(async () => {
      // Search for users with the specified email (limit to 1 result)
      const usersResponse = await this.usersClient.getUsers({
        email,
        pageSize: 1,
      });

      // Return the first user if found, otherwise null
      if (usersResponse.users && usersResponse.users.length > 0) {
        return usersResponse.users[0];
      }

      return null;
    });
  }
}
