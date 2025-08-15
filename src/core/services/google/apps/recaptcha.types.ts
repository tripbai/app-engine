type ReCAPTCHAResponse = {
  name: string;
  event: {
    token: string;
    siteKey: string;
    userAgent: string;
    userIpAddress: string;
    expectedAction: string;
    hashedAccountId: string;
    express: false;
    requestedUri: string;
    wafTokenAssessment: string;
    ja3: string;
    headers: [];
    firewallPolicyEvaluation: false;
    fraudPrevention: string;
  };
  riskAnalysis: {
    score: number;
    reasons: [];
    extendedVerdictReasons: [];
  };
  tokenProperties: {
    valid: boolean;
    invalidReason: string;
    hostname: string;
    androidPackageName: string;
    iosBundleId: string;
    action: string;
    createTime: string;
  };
  accountDefenderAssessment: {
    labels: [];
  };
};

type RecaptchaVaultConfig = {
  RECAPTCHA_PROJECT_ID: string;
  RECAPTCHA_PROJECT_KEY: string;
  RECAPTCHA_RISK_ANALYSIS_LOWER_LIMIT: number;
};
