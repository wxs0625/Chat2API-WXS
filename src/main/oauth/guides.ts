export interface TokenExtractionGuide {
  loginUrl: string
  steps: string[]
  tokenKey: string
  tokenLabel: string
  storageType: 'localStorage' | 'cookie' | 'other'
  placeholder?: string
  helpUrl?: string
}

export const TOKEN_EXTRACTION_GUIDES: Record<string, TokenExtractionGuide> = {
  deepseek: {
    loginUrl: 'https://chat.deepseek.com',
    steps: [
      '1. Click the button below to open DeepSeek website',
      '2. Log in to your account',
      '3. Press F12 to open Developer Tools',
      '4. Switch to the Application tab',
      '5. Find Local Storage → chat.deepseek.com on the left',
      '6. Find the userToken field and copy its value',
    ],
    tokenKey: 'userToken',
    tokenLabel: 'Token',
    storageType: 'localStorage',
    placeholder: 'Paste the Token obtained from DeepSeek',
  },
  qwen: {
    loginUrl: 'https://www.qianwen.com',
    steps: [
      '1. Click the button below to open Qwen website',
      '2. Log in to your account',
      '3. Press F12 to open Developer Tools',
      '4. Switch to the Application tab',
      '5. Find Cookies → www.qianwen.com on the left',
      '6. Find tongyi_sso_ticket and copy its value',
    ],
    tokenKey: 'tongyi_sso_ticket',
    tokenLabel: 'Ticket',
    storageType: 'cookie',
    placeholder: 'Paste the Ticket obtained from Qwen',
  },
  glm: {
    loginUrl: 'https://chatglm.cn',
    steps: [
      '1. Click the button below to open GLM website',
      '2. Log in to your account',
      '3. Press F12 to open Developer Tools',
      '4. Switch to the Application tab',
      '5. Find Local Storage → chatglm.cn on the left',
      '6. Find the token or access_token field and copy its value',
    ],
    tokenKey: 'token',
    tokenLabel: 'Token',
    storageType: 'localStorage',
    placeholder: 'Paste the Token obtained from GLM',
  },
  kimi: {
    // K3 upgrade: international users are served by www.kimi.ai.
    loginUrl: 'https://www.kimi.ai',
    steps: [
      '1. Click the button below to open the Kimi website (kimi.ai)',
      '2. Log in to your account (Google / email / phone)',
      '3. The kimi-auth cookie is captured automatically after login',
      '4. Manual fallback: press F12 to open Developer Tools',
      '5. Switch to the Application tab → Cookies → www.kimi.ai',
      '6. Copy the value of the kimi-auth cookie',
      '7. Or use the Network tab: copy the token after Bearer in the Authorization header',
    ],
    tokenKey: 'kimi-auth',
    tokenLabel: 'Token',
    storageType: 'cookie',
    placeholder: 'Paste the Token obtained from Kimi',
  },
  minimax: {
    loginUrl: 'https://www.minimaxi.com',
    steps: [
      '1. Click the button below to open MiniMax website',
      '2. Log in to your account',
      '3. Press F12 to open Developer Tools',
      '4. Switch to the Application tab',
      '5. Find Local Storage → www.minimaxi.com on the left',
      '6. Find the token or access_token field and copy its value',
    ],
    tokenKey: 'token',
    tokenLabel: 'Token',
    storageType: 'localStorage',
    placeholder: 'Paste the Token obtained from MiniMax',
  },
}

export function getGuideByProvider(providerType: string): TokenExtractionGuide | undefined {
  return TOKEN_EXTRACTION_GUIDES[providerType]
}
