declare namespace API {
  type ApiKeyValidationResponse = {
    /** Whether the API key is valid */
    authorized?: boolean;
  };

  type CryptomusConfig = {
    /** Cryptomus API key */
    api_key?: string;
    /** Cryptomus merchant ID */
    merchant_id?: string;
  };

  type deleteProjectIdParams = {
    id: number;
  };

  type deleteSecretIdParams = {
    id: number;
  };

  type deleteWorkflowIdParams = {
    id: number;
  };

  type DeployMethod = {
    /** Deployment method type */
    type: string;
    /** Deployment method name */
    name: string;
    /** Deployment method description */
    description: string;
    /** Where the deployment runs */
    runs_on: string;
    /** Git branch to deploy */
    branch: string;
    /** Deployment commands */
    commands: string[];
    /** Deployment outputs */
    outputs?: string[];
    /** Whether to compress the deployment */
    compress?: boolean;
  };

  type EnvironmentVar = {
    /** Environment variable name */
    name: string;
    /** Environment variable description */
    description: string;
  };

  type getOrderIdParams = {
    id: string;
  };

  type getProjectIdParams = {
    id: number;
  };

  type getProjectParams = {
    page?: number;
    size?: number;
    name?: string;
  };

  type getSecretIdParams = {
    id: number;
  };

  type getSecretParams = {
    page?: number;
    size?: number;
    name?: string;
    project_id?: number;
  };

  type getTaskParams = {
    project_id?: number;
    status?: "pending" | "running" | "completed" | "failed";
  };

  type getWorkflowIdParams = {
    id: number;
  };

  type getWorkflowParams = {
    page?: number;
    size?: number;
    name?: string;
  };

  type Order = {
    /** Order ID */
    id?: string;
    /** Project ID */
    project_id?: number;
    /** Project name */
    project_name?: string;
    /** Order type */
    order_type?: "monthly" | "per_use" | "yearly";
    /** Quantity */
    quantity?: number;
    /** Unit price */
    unit_price?: number;
    /** Total amount */
    total_amount?: number;
    /** Currency */
    currency?: string;
    /** Order status */
    status?: string;
    /** Payment URL */
    payment_url?: string;
    /** Creation timestamp */
    created_at?: string;
    /** Last update timestamp */
    updated_at?: string;
  };

  type OrderCreateRequest = {
    /** Project ID */
    project_id: number;
    /** Project name */
    project_name: string;
    /** Order type */
    order_type: "monthly" | "per_use" | "yearly";
    /** Quantity */
    quantity: number;
    /** Unit price */
    unit_price: number;
    /** Total amount */
    total_amount: number;
    /** Currency */
    currency?: string;
    /** Return URL */
    return_url?: string;
    /** Secret key */
    secret?: string;
    payment_config: PaymentConfig;
  };

  type PaymentConfig = {
    cryptomus?: CryptomusConfig;
  };

  type PaymentWebhookRequest = {
    /** Order ID */
    order_id: string;
    /** Payment status */
    status: string;
    /** Payment amount */
    amount?: number;
    /** Payment currency */
    currency?: string;
  };

  type Pricing = {
    /** Monthly price */
    monthly?: number;
    /** Yearly price */
    yearly?: number;
    /** Per use price */
    per_use?: number;
  };

  type Project = {
    /** Project ID */
    id?: number;
    /** Project name */
    name?: string;
    /** Project description */
    description?: string;
    /** Repository owner */
    repo_owner?: string;
    /** Repository name */
    repo_name?: string;
    /** Preview URL */
    preview?: string;
    /** Associated workflow ID */
    workflow_id?: number;
    deploy_methods?: DeployMethod[];
    environment?: EnvironmentVar[];
    pricing?: Pricing;
    payment_config?: PaymentConfig;
    /** Creation timestamp */
    created_at?: string;
    /** Last update timestamp */
    updated_at?: string;
  };

  type ProjectCreateRequest = {
    /** Project name */
    name: string;
    /** Project description */
    description: string;
    /** Repository owner */
    repo_owner: string;
    /** Repository name */
    repo_name: string;
    /** Preview URL */
    preview?: string;
    /** Associated workflow ID */
    workflow_id?: number;
    deploy_methods?: DeployMethod[];
    environment?: EnvironmentVar[];
    pricing?: Pricing;
    payment_config?: PaymentConfig;
  };

  type ProjectUpdateRequest = {
    name?: string;
    description?: string;
    repo_owner?: string;
    repo_name?: string;
    preview?: string;
    workflow_id?: number;
    deploy_methods?: DeployMethod[];
    environment?: EnvironmentVar[];
    pricing?: Pricing;
    payment_config?: PaymentConfig;
  };

  type putProjectIdParams = {
    id: number;
  };

  type putSecretIdParams = {
    id: number;
  };

  type putWorkflowIdParams = {
    id: number;
  };

  type Secret = {
    /** Secret ID */
    id?: number;
    /** Secret name */
    name?: string;
    /** Secret description */
    description?: string;
    /** Project ID */
    project_id?: number;
    /** Secret value */
    value?: string;
    /** Expiration date */
    expires_at?: string;
    /** Maximum number of calls */
    max_calls?: number;
    /** Number of calls made */
    calls?: number;
    /** Creation timestamp */
    created_at?: string;
    /** Last update timestamp */
    updated_at?: string;
  };

  type SecretCreateRequest = {
    /** Secret name */
    name: string;
    /** Secret description */
    description?: string;
    /** Project ID */
    project_id: number;
    /** Secret value */
    value?: string;
    /** Expiration date */
    expires_at?: string;
    /** Maximum number of calls */
    max_calls?: number;
  };

  type SecretUpdateRequest = {
    /** Secret name */
    name?: string;
    /** Secret description */
    description?: string;
    /** Secret value */
    value?: string;
    /** Expiration date */
    expires_at?: string;
    /** Maximum number of calls */
    max_calls?: number;
  };

  type SecretValidateRequest = {
    /** Secret key to validate */
    secret: string;
    /** Project ID */
    project_id: number;
  };

  type SecretValidateResponse = {
    /** Whether the secret is valid */
    valid?: boolean;
  };

  type Task = {
    /** Task ID */
    id?: number;
    /** Project ID */
    project_id?: number;
    /** Deployment method */
    deploy_method?: string;
    /** Task status */
    status?: "pending" | "running" | "completed" | "failed";
    /** Task result */
    result?: string;
    /** Creation timestamp */
    created_at?: string;
    /** Last update timestamp */
    updated_at?: string;
  };

  type TaskCreateRequest = {
    /** Project ID */
    project_id: number;
    /** Deployment method */
    deploy_method: string;
    /** Environment variables */
    environment?: Record<string, any>;
    /** API secret for authentication */
    secret: string;
  };

  type Workflow = {
    /** Workflow ID */
    id?: number;
    /** Workflow name */
    name: string;
    /** Workflow description */
    description?: string;
    /** Repository owner */
    repo_owner: string;
    /** Repository name */
    repo_name: string;
    /** Workflow file path */
    workflow_file: string;
    /** Git branch */
    branch: string;
    /** GitHub token */
    github_token: string;
    /** Creation timestamp */
    created_at?: string;
    /** Last update timestamp */
    updated_at?: string;
  };

  type WorkflowCreateRequest = {
    /** Workflow name */
    name: string;
    /** Workflow description */
    description?: string;
    /** Repository owner */
    repo_owner: string;
    /** Repository name */
    repo_name: string;
    /** Workflow file path */
    workflow_file: string;
    /** Git branch */
    branch: string;
    /** GitHub token */
    github_token: string;
  };

  type WorkflowUpdateRequest = {
    name?: string;
    description?: string;
    repo_owner?: string;
    repo_name?: string;
    workflow_file?: string;
    branch?: string;
    github_token?: string;
  };
}
