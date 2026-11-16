// 네트워크 연결 디버깅 유틸리티

export interface NetworkTestResult {
  url: string;
  success: boolean;
  status?: number;
  statusText?: string;
  error?: string;
  responseTime?: number;
}

// 여러 URL로 네트워크 연결 테스트
export const testNetworkConnections = async (): Promise<NetworkTestResult[]> => {
  const testUrls = [
    'http://192.168.100.146:8000/', // 실제 로컬 IP
    'http://10.0.2.2:8000/', // Android 에뮬레이터용
    'http://localhost:8000/', // iOS 시뮬레이터용
    'http://211.194.128.18:8000/', // 이전 설정
  ];

  const results: NetworkTestResult[] = [];

  for (const url of testUrls) {
    const startTime = Date.now();
    
    try {
      console.log(`테스트 중: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      results.push({
        url,
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime,
      });
      
      console.log(`✅ ${url}: ${response.status} ${response.statusText} (${responseTime}ms)`);
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      results.push({
        url,
        success: false,
        error: errorMessage,
        responseTime,
      });
      
      console.log(`❌ ${url}: ${errorMessage} (${responseTime}ms)`);
    }
  }

  return results;
};

// 특정 API 엔드포인트 테스트
export const testApiEndpoint = async (endpoint: string): Promise<NetworkTestResult> => {
  const baseUrls = [
    'http://211.194.128.18:8000',
    'http://10.0.2.2:8000',
    'http://localhost:8000',
  ];

  for (const baseUrl of baseUrls) {
    const url = `${baseUrl}${endpoint}`;
    const startTime = Date.now();
    
    try {
      console.log(`API 테스트 중: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        url,
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime,
      };
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.log(`❌ ${url}: ${errorMessage} (${responseTime}ms)`);
      
      // 마지막 URL이 아니면 다음 URL 시도
      if (baseUrl !== baseUrls[baseUrls.length - 1]) {
        continue;
      }
      
      return {
        url,
        success: false,
        error: errorMessage,
        responseTime,
      };
    }
  }

  return {
    url: 'No valid URL found',
    success: false,
    error: 'All URLs failed',
  };
};

// 네트워크 상태 요약
export const getNetworkSummary = (results: NetworkTestResult[]): string => {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  let summary = `네트워크 테스트 결과:\n`;
  summary += `✅ 성공: ${successful.length}개\n`;
  summary += `❌ 실패: ${failed.length}개\n\n`;
  
  if (successful.length > 0) {
    summary += `성공한 URL:\n`;
    successful.forEach(result => {
      summary += `• ${result.url} (${result.status} ${result.statusText})\n`;
    });
    summary += `\n`;
  }
  
  if (failed.length > 0) {
    summary += `실패한 URL:\n`;
    failed.forEach(result => {
      summary += `• ${result.url}: ${result.error}\n`;
    });
  }
  
  return summary;
}; 