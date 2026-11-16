import { NavigationProp } from '@react-navigation/native';

export type UserType = 'caregiver' | 'guardian' | 'admin';

// 사용자 타입에 따른 메인 화면 이름 매핑
export const getUserMainScreen = (userType: UserType): string => {
  switch (userType) {
    case 'caregiver':
      return 'CareGiverNavigator';
    case 'guardian':
      return 'GuardianNavigator';
    case 'admin':
      return 'AdminNavigator'; // 관리자 네비게이터가 있다면
    default:
      return 'CareGiverNavigator'; // 기본값
  }
};

// 로그인 성공 후 네비게이션 처리
export const handleLoginSuccess = (
  navigation: NavigationProp<any>,
  userType: UserType,
  userData?: any
) => {
  const mainScreen = getUserMainScreen(userType);
  
  // 로그인 스택을 리셋하고 메인 화면으로 이동
  navigation.reset({
    index: 0,
    routes: [{ name: mainScreen }],
  });
  
  console.log(`${userType} 사용자 로그인 성공:`, userData);
};

// 로그아웃 처리
export const handleLogout = (navigation: NavigationProp<any>) => {
  // 로그인 화면으로 리셋
  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
  
  console.log('로그아웃 완료');
}; 