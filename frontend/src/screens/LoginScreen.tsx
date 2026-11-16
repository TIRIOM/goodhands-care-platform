import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from "axios";
import { API_BASE_URL } from '../api/config';
import { saveToken, saveUserData, saveUserRole } from '../utils/tokenManager';
import {useRefresh} from "../../App.tsx";

interface LoginScreenProps {
  onLoginSuccess?: (userData: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { refreshApp } = useRefresh();

  const login = async (userCode: string, password: string) => {
    setLoading(true);
    const url = `${API_BASE_URL}/auth/login`;
    const params = {
      user_code: userCode,
      password: password,
    };

    try {
      const res = await axios.post(url, params);
      const { access_token, user_type, ...userData } = res.data;

      console.log("User Type:", user_type); // caregiver, guardian 등
      console.log("User Type:", access_token); // caregiver, guardian 등
      console.log("User Type:", res); // caregiver, guardian 등

      if (access_token) {
        // 토큰, 사용자 데이터, 역할 모두 저장
        await saveToken(access_token);
        await saveUserData({ user_type, ...userData });
        await saveUserRole(user_type);

        
        // 로그인 성공 콜백 호출
        if (onLoginSuccess) {
          onLoginSuccess({ user_type, ...userData });
        }
        console.log(user_type)

        refreshApp();
        // 로그인 성공 시 MainApp으로 이동 (바텀바가 있는 메인 화면)
        //navigation.navigate('MainApp' as never);
        // navigation.navigate('MainApp' as never);
      }
    } catch (error) {
      console.error('Login failed:', error);
      // 에러 처리 (필요시 Alert 추가)
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>로그인 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>시나브로</Text>
      <Text style={styles.subtitle}>간편 로그인</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.caregiverButton]}
          onPress={() => login('CG001','password123')}
        >
          <Text style={styles.buttonText}>케어기버 로그인</Text>
          <Text style={styles.buttonSubtext}>CG001 / password123</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.guardianButton]}
          onPress={() => login('GD001','password123')}
        >
          <Text style={styles.buttonText}>가디언 로그인</Text>
          <Text style={styles.buttonSubtext}>GD001 / password123</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  caregiverButton: {
    backgroundColor: '#17a2b8',
  },
  guardianButton: {
    backgroundColor: '#6f42c1',
  },
  adminButton: {
    backgroundColor: '#fd7e14',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default LoginScreen; 