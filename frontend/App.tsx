import * as React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from "@react-navigation/stack";
import {
    CareGiverCareNoteStack,
    CareGiverMainStack,
    CareGiverMyPageStack
} from "./src/screens/Navigator/CareGiverNavigator.tsx";
import { GuardianCareNoteStack, GuardianMainStack, GuardianChallengeStack,GuardianMyPageStack } from "./src/screens/Navigator/GuardianNavigator.tsx";
import LoginScreen from "./src/screens/LoginScreen.tsx";
import { getToken, getUserRole, isAuthenticated } from './src/utils/tokenManager';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 새로고침 Context 생성
interface RefreshContextType {
  refreshApp: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

// 새로고침 훅
export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};

// 기존 앱 컴포넌트
export function MainApp() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const token = await getToken();
        const role = await getUserRole();
        
        if (token && role) {
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('사용자 역할 로드 실패:', error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, []);

  // 로딩 중이거나 역할이 없으면 기본값 사용
  if (isLoading || !userRole) {
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#4fabfd',
          height: 120,
          borderRadius: 10,
          paddingTop: 3,
          paddingHorizontal: 30,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#ffffff',
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen
        name="홈"
        component={userRole === 'caregiver' ? CareGiverMainStack : GuardianMainStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('./assets/images/icons/mainpageiconhover.png')
                  : require('./assets/images/icons/mainpageicon.png')
              }
              style={{ width: 21, height: 21 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="돌봄노트"
        component={userRole === 'caregiver' ? CareGiverCareNoteStack : GuardianCareNoteStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('./assets/images/icons/CareNoteHover.png')
                  : require('./assets/images/icons/CareNoteIcon.png')
              }
              style={{ width: 21, height: 21 }}
              resizeMode="contain"
            />
          ),
          title: '돌봄노트',
        }}
      />
      {userRole === 'guardian' && (
        <Tab.Screen
          name="챌린지"
          component={GuardianChallengeStack}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('./assets/images/icons/ChallengeHoverICon.png')
                    : require('./assets/images/icons/ChallengeIcon.png')
                }
                style={{ width: 21, height: 21 }}
                resizeMode="contain"
              />
            ),
            title: '챌린지',
          }}
        />
      )}
      <Tab.Screen
        name="내정보"
        component={userRole === 'caregiver' ? CareGiverMyPageStack : GuardianMyPageStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('./assets/images/icons/mypageiconhover.png')
                  : require('./assets/images/icons/mypageicon.png')
              }
              style={{ width: 21, height: 21 }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      setIsAuth(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 새로고침 함수
  const refreshApp = () => {
    console.log('앱 새로고침 시작...');
    checkAuthStatus();
  };

  // 로딩 중이면 null 반환
  if (isAuth === null) {
    return null;
  }

  return (
    <RefreshContext.Provider value={{ refreshApp }}>
      <NavigationContainer>
        <Stack.Navigator>
          {!isAuth ? (
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />
          ) : (
            <Stack.Screen
              name="MainApp"
              component={MainApp}
              options={{
                headerShown: false,
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </RefreshContext.Provider>
  );
}


