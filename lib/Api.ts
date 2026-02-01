/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface RegisterDto {
  /**
   * User email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * User password
   * @minLength 8
   * @example "SecurePassword123"
   */
  password: string;
  /**
   * User first name
   * @minLength 1
   * @maxLength 100
   * @example "John"
   */
  firstName: string;
  /**
   * User last name
   * @minLength 1
   * @maxLength 100
   * @example "Doe"
   */
  lastName: string;
}

export interface AuthResponse {
  /**
   * Access token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNTE2MjM5MDIyfQ"
   */
  accessToken: string;
  /**
   * Refresh token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNTE2MjM5MDIyfQ"
   */
  refreshToken: string;
  /**
   * Needs onboarding
   * @example true
   */
  needsOnboarding: boolean;
}

export interface LoginDto {
  /**
   * User email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * User password
   * @minLength 8
   * @example "SecurePassword123"
   */
  password: string;
}

export interface RefreshTokenDto {
  /**
   * Refresh token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNTE2MjM5MDIyfQ"
   */
  refreshToken: string;
}

export interface AccessTokenResponse {
  /**
   * Access token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNTE2MjM5MDIyfQ"
   */
  accessToken: string;
}

export interface VerifyEmailDto {
  /**
   * Email verification token
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  token: string;
}

export interface MessageResponseDto {
  /**
   * Status or confirmation message
   * @example "Operation completed successfully"
   */
  message: string;
}

export interface ResendVerificationDto {
  /**
   * Email address to resend verification to
   * @example "user@example.com"
   */
  email: string;
}

export interface ForgotPasswordDto {
  /**
   * Email address to send reset link to
   * @example "user@example.com"
   */
  email: string;
}

export interface ResetPasswordDto {
  /**
   * Password reset token
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  token: string;
  /**
   * New password (minimum 8 characters)
   * @minLength 8
   * @example "newSecurePassword123"
   */
  password: string;
}

export interface UserResponseDto {
  /**
   * User unique identifier
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;
  /**
   * User email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * User first name
   * @example "John"
   */
  firstName: string;
  /**
   * User last name
   * @example "Doe"
   */
  lastName: string;
  /**
   * User roles
   * @example ["user"]
   */
  roles: ("user" | "admin")[];
  /**
   * Whether the user account is active
   * @example true
   */
  isActive: boolean;
  /**
   * Whether the email is verified
   * @example false
   */
  emailVerified: boolean;
  /**
   * Last login timestamp
   * @example "2024-01-15T10:30:00Z"
   */
  lastLoginAt?: object | null;
  /**
   * Account creation timestamp
   * @format date-time
   * @example "2024-01-01T00:00:00Z"
   */
  createdAt: string;
  /**
   * Last update timestamp
   * @format date-time
   * @example "2024-01-15T10:30:00Z"
   */
  updatedAt: string;
}

export interface CreateUserRequestDto {
  /**
   * User email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * User password (minimum 8 characters)
   * @minLength 8
   * @example "SecurePassword123"
   */
  password: string;
  /**
   * User first name
   * @minLength 1
   * @maxLength 100
   * @example "John"
   */
  firstName: string;
  /**
   * User last name
   * @minLength 1
   * @maxLength 100
   * @example "Doe"
   */
  lastName: string;
  /**
   * User roles
   * @example ["user","admin"]
   */
  roles?: ("user" | "admin")[];
  /**
   * Whether the user account is active
   * @default true
   * @example true
   */
  isActive?: boolean;
  /**
   * Whether the email is verified
   * @default false
   * @example false
   */
  emailVerified?: boolean;
}

export interface UpdateUserRequestDto {
  /**
   * User first name
   * @minLength 1
   * @maxLength 100
   * @example "John"
   */
  firstName?: string;
  /**
   * User last name
   * @minLength 1
   * @maxLength 100
   * @example "Doe"
   */
  lastName?: string;
  /**
   * Whether the user account is active
   * @example true
   */
  isActive?: boolean;
  /**
   * Whether the email is verified
   * @example true
   */
  emailVerified?: boolean;
}

export interface CreateProjectRequestDto {
  /**
   * Project name
   * @example "Acme Platform"
   */
  name: string;
  /**
   * Website URL for analysis
   * @example "https://example.com"
   */
  websiteUrl: string;
  /**
   * Project description
   * @example "Main tracking and analytics workspace"
   */
  description?: string;
}

export interface ProjectResponseDto {
  /**
   * Project unique identifier
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;
  /**
   * Project name
   * @example "Acme Platform"
   */
  name: string;
  /**
   * Website URL for analysis
   * @example "https://example.com"
   */
  websiteUrl: string;
  /**
   * Project description
   * @example "Main tracking and analytics workspace"
   */
  description?: object | null;
  /**
   * Creation timestamp
   * @format date-time
   * @example "2024-01-01T00:00:00Z"
   */
  createdAt: string;
  /**
   * Last update timestamp
   * @format date-time
   * @example "2024-01-15T10:30:00Z"
   */
  updatedAt: string;
}

export interface CreateProjectResponseDto {
  /** Created project */
  project: ProjectResponseDto;
}

export interface UpdateProjectRequestDto {
  /**
   * Project name
   * @example "Acme Platform"
   */
  name?: string;
  /**
   * Project description
   * @example "Main tracking and analytics workspace"
   */
  description?: object;
}

export interface CreateInvitationRequestDto {
  /**
   * Invitee email (optional for shareable links)
   * @example "teammate@example.com"
   */
  email?: string;
  /**
   * Role for the invited user
   * @example "maintainer"
   */
  role: "owner" | "maintainer";
}

export interface InvitationResponseDto {
  /**
   * Invitation unique identifier
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;
  /**
   * Invitee email
   * @example "teammate@example.com"
   */
  email?: object | null;
  /**
   * Role for the invited user
   * @example "maintainer"
   */
  role: "owner" | "maintainer";
  /**
   * Invitation expiry timestamp
   * @format date-time
   * @example "2024-02-01T00:00:00Z"
   */
  expiresAt: string;
  /**
   * Invitation acceptance timestamp
   * @example "2024-01-15T10:30:00Z"
   */
  acceptedAt?: object | null;
  /**
   * User ID who accepted the invitation
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  acceptedByUserId?: object | null;
  /**
   * Creation timestamp
   * @format date-time
   * @example "2024-01-01T00:00:00Z"
   */
  createdAt: string;
  /**
   * Last update timestamp
   * @format date-time
   * @example "2024-01-15T10:30:00Z"
   */
  updatedAt: string;
}

export interface AcceptInvitationRequestDto {
  /**
   * Invitation code
   * @example "f0b2c3d4-5e6f-7a8b-9c0d-ef1234567890"
   */
  code: string;
}

export interface CreateOnboardingProjectRequestDto {
  /**
   * Website URL for analysis
   * @example "https://example.com"
   */
  websiteUrl: string;
}

export interface AnalysisResponseDto {
  /**
   * Analysis unique identifier
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;
  /**
   * Project ID this analysis belongs to
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  projectId: string;
  /**
   * Analysis status
   * @example "completed"
   */
  status: "pending" | "running" | "completed" | "failed";
  /**
   * Analysis result (null until completed)
   * @example {"placeholder":true,"analyzedAt":"2024-01-01T00:00:00Z"}
   */
  result?: object | null;
  /**
   * When analysis started
   * @example "2024-01-01T00:00:00Z"
   */
  startedAt?: object | null;
  /**
   * When analysis completed
   * @example "2024-01-01T00:00:30Z"
   */
  completedAt?: object | null;
  /**
   * Error message if analysis failed
   * @example "Failed to fetch website"
   */
  errorMessage?: object | null;
  /**
   * Creation timestamp
   * @format date-time
   * @example "2024-01-01T00:00:00Z"
   */
  createdAt: string;
  /**
   * Last update timestamp
   * @format date-time
   * @example "2024-01-01T00:00:30Z"
   */
  updatedAt: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title betracked API
 * @version 1.0
 * @contact
 *
 * API Documentation
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Checks if the service is alive. Used by orchestrators to determine if the service should be restarted.
     *
     * @tags Health
     * @name HealthControllerLiveness
     * @summary Liveness probe
     * @request GET:/api/health/live
     */
    healthControllerLiveness: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example "ok" */
          status?: string;
          /** @example {"database":{"status":"up"}} */
          info?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {} */
          error?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"database":{"status":"up"}} */
          details?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
        },
        {
          /** @example "error" */
          status?: string;
          /** @example {"database":{"status":"up"}} */
          info?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"redis":{"status":"down","message":"Could not connect"}} */
          error?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"database":{"status":"up"},"redis":{"status":"down","message":"Could not connect"}} */
          details?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
        }
      >({
        path: `/api/health/live`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Checks if the service can handle traffic. Used by load balancers to determine if traffic should be routed to this instance.
     *
     * @tags Health
     * @name HealthControllerReadiness
     * @summary Readiness probe
     * @request GET:/api/health/ready
     */
    healthControllerReadiness: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example "ok" */
          status?: string;
          /** @example {"database":{"status":"up"}} */
          info?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {} */
          error?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"database":{"status":"up"}} */
          details?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
        },
        {
          /** @example "error" */
          status?: string;
          /** @example {"database":{"status":"up"}} */
          info?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"redis":{"status":"down","message":"Could not connect"}} */
          error?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"database":{"status":"up"},"redis":{"status":"down","message":"Could not connect"}} */
          details?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
        }
      >({
        path: `/api/health/ready`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Comprehensive health check including database, memory, and disk. Useful for debugging and monitoring.
     *
     * @tags Health
     * @name HealthControllerDeepCheck
     * @summary Deep health check
     * @request GET:/api/health/deep
     */
    healthControllerDeepCheck: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example "ok" */
          status?: string;
          /** @example {"database":{"status":"up"}} */
          info?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {} */
          error?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"database":{"status":"up"}} */
          details?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
        },
        {
          /** @example "error" */
          status?: string;
          /** @example {"database":{"status":"up"}} */
          info?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"redis":{"status":"down","message":"Could not connect"}} */
          error?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"database":{"status":"up"},"redis":{"status":"down","message":"Could not connect"}} */
          details?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
        }
      >({
        path: `/api/health/deep`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a new user account and returns JWT access and refresh tokens
     *
     * @tags Auth
     * @name AuthControllerRegister
     * @summary User registration
     * @request POST:/api/auth/register
     */
    authControllerRegister: (data: RegisterDto, params: RequestParams = {}) =>
      this.request<AuthResponse, void>({
        path: `/api/auth/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Authenticates a user and returns JWT access and refresh tokens
     *
     * @tags Auth
     * @name AuthControllerLogin
     * @summary User login
     * @request POST:/api/auth/login
     */
    authControllerLogin: (data: LoginDto, params: RequestParams = {}) =>
      this.request<AuthResponse, void>({
        path: `/api/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Generates a new access token using a valid refresh token
     *
     * @tags Auth
     * @name AuthControllerRefreshToken
     * @summary Refresh access token
     * @request POST:/api/auth/refresh
     */
    authControllerRefreshToken: (
      data: RefreshTokenDto,
      params: RequestParams = {},
    ) =>
      this.request<AccessTokenResponse, void>({
        path: `/api/auth/refresh`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Verifies user email address using the verification token
     *
     * @tags Auth
     * @name AuthControllerVerifyEmail
     * @summary Verify email
     * @request POST:/api/auth/verify-email
     */
    authControllerVerifyEmail: (
      data: VerifyEmailDto,
      params: RequestParams = {},
    ) =>
      this.request<MessageResponseDto, void>({
        path: `/api/auth/verify-email`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Sends a new verification email to the specified address
     *
     * @tags Auth
     * @name AuthControllerResendVerificationEmail
     * @summary Resend verification email
     * @request POST:/api/auth/resend-verification
     */
    authControllerResendVerificationEmail: (
      data: ResendVerificationDto,
      params: RequestParams = {},
    ) =>
      this.request<MessageResponseDto, void>({
        path: `/api/auth/resend-verification`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Sends a password reset email to the specified address
     *
     * @tags Auth
     * @name AuthControllerForgotPassword
     * @summary Request password reset
     * @request POST:/api/auth/forgot-password
     */
    authControllerForgotPassword: (
      data: ForgotPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<MessageResponseDto, any>({
        path: `/api/auth/forgot-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Resets user password using the reset token
     *
     * @tags Auth
     * @name AuthControllerResetPassword
     * @summary Reset password
     * @request POST:/api/auth/reset-password
     */
    authControllerResetPassword: (
      data: ResetPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<MessageResponseDto, void>({
        path: `/api/auth/reset-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns the profile of the currently authenticated user
     *
     * @tags Users
     * @name UsersControllerGetMe
     * @summary Get current user profile
     * @request GET:/api/users/me
     * @secure
     */
    usersControllerGetMe: (params: RequestParams = {}) =>
      this.request<UserResponseDto, void>({
        path: `/api/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a new user account. Admin only.
     *
     * @tags Users
     * @name UsersControllerCreate
     * @summary Create a new user
     * @request POST:/api/users
     * @secure
     */
    usersControllerCreate: (
      data: CreateUserRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<UserResponseDto, void>({
        path: `/api/users`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Updates user information. Users can update their own profile, admins can update any user.
     *
     * @tags Users
     * @name UsersControllerUpdate
     * @summary Update a user
     * @request PATCH:/api/users/{id}
     * @secure
     */
    usersControllerUpdate: (
      id: string,
      data: UpdateUserRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<UserResponseDto, void>({
        path: `/api/users/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Soft deletes a user account. Admin only.
     *
     * @tags Users
     * @name UsersControllerRemove
     * @summary Delete a user
     * @request DELETE:/api/users/{id}
     * @secure
     */
    usersControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/users/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Creates a new project, sets the current user as owner, and triggers website analysis
     *
     * @tags Projects
     * @name ProjectsControllerCreateProject
     * @summary Create project
     * @request POST:/api/projects
     * @secure
     */
    projectsControllerCreateProject: (
      data: CreateProjectRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<CreateProjectResponseDto, any>({
        path: `/api/projects`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Lists projects the current user belongs to
     *
     * @tags Projects
     * @name ProjectsControllerGetMyProjects
     * @summary List projects
     * @request GET:/api/projects
     * @secure
     */
    projectsControllerGetMyProjects: (params: RequestParams = {}) =>
      this.request<ProjectResponseDto[], any>({
        path: `/api/projects`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves a project by its ID for members
     *
     * @tags Projects
     * @name ProjectsControllerGetProject
     * @summary Get project
     * @request GET:/api/projects/{projectId}
     * @secure
     */
    projectsControllerGetProject: (
      projectId: string,
      params: RequestParams = {},
    ) =>
      this.request<ProjectResponseDto, any>({
        path: `/api/projects/${projectId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Updates project fields for owners and maintainers
     *
     * @tags Projects
     * @name ProjectsControllerUpdateProject
     * @summary Update project
     * @request PATCH:/api/projects/{projectId}
     * @secure
     */
    projectsControllerUpdateProject: (
      projectId: string,
      data: UpdateProjectRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<ProjectResponseDto, any>({
        path: `/api/projects/${projectId}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Deletes a project (owner only)
     *
     * @tags Projects
     * @name ProjectsControllerDeleteProject
     * @summary Delete project
     * @request DELETE:/api/projects/{projectId}
     * @secure
     */
    projectsControllerDeleteProject: (
      projectId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/projects/${projectId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Creates an invitation for a project
     *
     * @tags Project Invitations
     * @name ProjectInvitationsControllerCreateInvitation
     * @summary Create invitation
     * @request POST:/api/projects/{projectId}/invitations
     * @secure
     */
    projectInvitationsControllerCreateInvitation: (
      projectId: string,
      data: CreateInvitationRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<InvitationResponseDto, any>({
        path: `/api/projects/${projectId}/invitations`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Accepts a project invitation by code
     *
     * @tags Project Invitations
     * @name ProjectInvitationsControllerAcceptInvitation
     * @summary Accept invitation
     * @request POST:/api/invitations/accept
     * @secure
     */
    projectInvitationsControllerAcceptInvitation: (
      data: AcceptInvitationRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/invitations/accept`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Creates the first project for a new user with automatic slug generation and triggers website analysis
     *
     * @tags Onboarding
     * @name OnboardingControllerCreateProject
     * @summary Create project during onboarding
     * @request POST:/api/onboarding/project
     * @secure
     */
    onboardingControllerCreateProject: (
      data: CreateOnboardingProjectRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<CreateProjectResponseDto, any>({
        path: `/api/onboarding/project`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves all analyses for a project
     *
     * @tags Analysis
     * @name AnalysisControllerGetAnalyses
     * @summary Get analyses
     * @request GET:/api/projects/{projectId}/analysis
     * @secure
     */
    analysisControllerGetAnalyses: (
      projectId: string,
      params: RequestParams = {},
    ) =>
      this.request<AnalysisResponseDto[], any>({
        path: `/api/projects/${projectId}/analysis`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves the most recent analysis for a project
     *
     * @tags Analysis
     * @name AnalysisControllerGetLatestAnalysis
     * @summary Get latest analysis
     * @request GET:/api/projects/{projectId}/analysis/latest
     * @secure
     */
    analysisControllerGetLatestAnalysis: (
      projectId: string,
      params: RequestParams = {},
    ) =>
      this.request<AnalysisResponseDto, void>({
        path: `/api/projects/${projectId}/analysis/latest`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves a specific analysis
     *
     * @tags Analysis
     * @name AnalysisControllerGetAnalysis
     * @summary Get analysis by ID
     * @request GET:/api/projects/{projectId}/analysis/{analysisId}
     * @secure
     */
    analysisControllerGetAnalysis: (
      analysisId: string,
      projectId: any,
      params: RequestParams = {},
    ) =>
      this.request<AnalysisResponseDto, void>({
        path: `/api/projects/${projectId}/analysis/${analysisId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
