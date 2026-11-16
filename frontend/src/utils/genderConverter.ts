// 성별 데이터 변환 유틸리티
// 백엔드에서는 '남성', '여성' 형식을 요구하므로 변환 함수 제공

/**
 * 영어 성별을 한글 성별로 변환
 * @param gender - 영어 성별 ('male' | 'female')
 * @returns 한글 성별 ('남성' | '여성')
 */
export const convertGenderToKorean = (gender?: string): string => {
  if (!gender) return '여성'; // 기본값
  
  switch (gender.toLowerCase()) {
    case 'male':
      return '남성';
    case 'female':
      return '여성';
    case '남성':
    case '여성':
      return gender; // 이미 한글이면 그대로 반환
    default:
      return '여성'; // 기본값
  }
};

/**
 * 한글 성별을 영어 성별로 변환
 * @param gender - 한글 성별 ('남성' | '여성')
 * @returns 영어 성별 ('male' | 'female')
 */
export const convertGenderToEnglish = (gender?: string): string => {
  if (!gender) return 'female'; // 기본값
  
  switch (gender) {
    case '남성':
      return 'male';
    case '여성':
      return 'female';
    case 'male':
    case 'female':
      return gender; // 이미 영어면 그대로 반환
    default:
      return 'female'; // 기본값
  }
};

/**
 * Senior 객체의 성별을 백엔드 형식으로 변환
 * @param senior - Senior 객체
 * @returns 성별이 백엔드 형식으로 변환된 Senior 객체
 */
export const convertSeniorGenderForBackend = (senior: any): any => {
  if (!senior) return senior;
  
  return {
    ...senior,
    gender: convertGenderToKorean(senior.gender)
  };
};

/**
 * Senior 배열의 모든 성별을 백엔드 형식으로 변환
 * @param seniors - Senior 배열
 * @returns 성별이 백엔드 형식으로 변환된 Senior 배열
 */
export const convertSeniorsGenderForBackend = (seniors: any[]): any[] => {
  if (!seniors || !Array.isArray(seniors)) return seniors;
  
  return seniors.map(senior => convertSeniorGenderForBackend(senior));
}; 