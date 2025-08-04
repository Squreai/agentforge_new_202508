/**
 * 환경 변수 설정 및 검증
 */

export const ENV_CONFIG = {
  // AI Works 기본 설정
  DEFAULT_AI_WORKS_KEY: process.env.DEFAULT_AI_WORKS_KEY || "2121",
  DEFAULT_API_AVAILABLE: process.env.NEXT_PUBLIC_DEFAULT_API_AVAILABLE === "true",

  // Google APIs
  GOOGLE_CUSTOM_SEARCH_API_KEY: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || "AIzaSyD0HC9KVqdZoth0KxEdrqDXgHrFUo0e5Nw",
  GOOGLE_SEARCH_ENGINE_ID: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID || "e2e41f7fa26ed4ee4",
  GOOGLE_GCP_API_KEY: process.env.GOOGLE_GCP_API_KEY || "AIzaSyBbZ13552fyTJe0qr0OUZ-JUGpfTQe7q_Y",

  // Naver Search API
  NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID || "U58tSZO_OlMVtNRJzGA0",
  NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET || "LqNHPhqkDB",

  // Infura 설정
  INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca",
  INFURA_PROJECT_SECRET: process.env.INFURA_PROJECT_SECRET || "",

  // 블록체인 네트워크 URL들
  BLOCKCHAIN_NETWORKS: {
    ethereum: {
      mainnet:
        process.env.ETHEREUM_MAINNET_URL ||
        `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      sepolia:
        process.env.ETHEREUM_SEPOLIA_URL ||
        `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      hoodi:
        process.env.ETHEREUM_HOODI_URL ||
        `https://hoodi.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    polygon: {
      mainnet:
        process.env.POLYGON_MAINNET_URL ||
        `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      amoy:
        process.env.POLYGON_AMOY_URL ||
        `https://polygon-amoy.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    arbitrum: {
      mainnet:
        process.env.ARBITRUM_MAINNET_URL ||
        `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      sepolia:
        process.env.ARBITRUM_SEPOLIA_URL ||
        `https://arbitrum-sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    base: {
      mainnet:
        process.env.BASE_MAINNET_URL ||
        `https://base-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      sepolia:
        process.env.BASE_SEPOLIA_URL ||
        `https://base-sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    optimism: {
      mainnet:
        process.env.OPTIMISM_MAINNET_URL ||
        `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      sepolia:
        process.env.OPTIMISM_SEPOLIA_URL ||
        `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    avalanche: {
      mainnet:
        process.env.AVALANCHE_MAINNET_URL ||
        `https://avalanche-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      fuji:
        process.env.AVALANCHE_FUJI_URL ||
        `https://avalanche-fuji.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    bsc: {
      mainnet:
        process.env.BSC_MAINNET_URL ||
        `https://bsc-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      testnet:
        process.env.BSC_TESTNET_URL ||
        `https://bsc-testnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    linea: {
      mainnet:
        process.env.LINEA_MAINNET_URL ||
        `https://linea-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    starknet: {
      mainnet:
        process.env.STARKNET_MAINNET_URL ||
        `https://starknet-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      sepolia:
        process.env.STARKNET_SEPOLIA_URL ||
        `https://starknet-sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    mantle: {
      mainnet:
        process.env.MANTLE_MAINNET_URL ||
        `https://mantle-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      sepolia:
        process.env.MANTLE_SEPOLIA_URL ||
        `https://mantle-sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    opbnb: {
      mainnet:
        process.env.OPBNB_MAINNET_URL ||
        `https://opbnb-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      testnet:
        process.env.OPBNB_TESTNET_URL ||
        `https://opbnb-testnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
    unichain: {
      mainnet:
        process.env.UNICHAIN_MAINNET_URL ||
        `https://unichain-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
      sepolia:
        process.env.UNICHAIN_SEPOLIA_URL ||
        `https://unichain-sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || "3d235080f27243d5a8759860b8d178ca"}`,
    },
  },
}

/**
 * 환경 변수 유효성 검사
 */
export function validateEnvConfig(): { isValid: boolean; missingKeys: string[] } {
  const missingKeys: string[] = []

  // 필수 키 검사
  if (!ENV_CONFIG.DEFAULT_AI_WORKS_KEY) {
    missingKeys.push("DEFAULT_AI_WORKS_KEY")
  }

  if (!ENV_CONFIG.INFURA_PROJECT_ID) {
    missingKeys.push("INFURA_PROJECT_ID")
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  }
}

/**
 * 특정 API 키 사용 가능 여부 확인
 */
export function isApiKeyAvailable(keyType: "google" | "naver" | "infura"): boolean {
  switch (keyType) {
    case "google":
      return !!(ENV_CONFIG.GOOGLE_CUSTOM_SEARCH_API_KEY && ENV_CONFIG.GOOGLE_SEARCH_ENGINE_ID)
    case "naver":
      return !!(ENV_CONFIG.NAVER_CLIENT_ID && ENV_CONFIG.NAVER_CLIENT_SECRET)
    case "infura":
      return !!ENV_CONFIG.INFURA_PROJECT_ID
    default:
      return false
  }
}
