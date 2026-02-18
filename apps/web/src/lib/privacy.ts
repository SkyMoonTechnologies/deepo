export const RISKY_TOOL_IDS = new Set(['jwt', 'hash-hmac', 'invoice-quote']);

export const SENSITIVE_INPUT_WARNING_BY_TOOL: Record<string, string> = {
  jwt: 'Verification keys are sensitive. Do not paste production secrets, and clear values before screen sharing.',
  'hash-hmac': 'HMAC secrets are sensitive. Keep shared keys out of screenshots, recordings, and saved artifacts unless required.',
  'invoice-quote': 'Invoice and quote forms can include customer PII. Keep customer fields local and share exported files carefully.',
};

export const DEFAULT_SHARING_DISABLED_REASON = 'Sharing is disabled because this tool can contain sensitive inputs.';

export function getSensitiveInputWarning(toolId: string): string | undefined {
  return SENSITIVE_INPUT_WARNING_BY_TOOL[toolId];
}
