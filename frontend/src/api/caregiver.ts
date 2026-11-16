import axiosClient from './axiosClient';
import {API_BASE_URL, API_ENDPOINTS, getDefaultHeaders} from './config';
import { 
  CheckInRequest, 
  CheckOutRequest,
  ChecklistRequest,
  CareNoteRequest,
  ApiResponse,
  Senior
} from '../types/database';
import axios from "axios";
import {getToken} from "../utils/tokenManager.ts";

// 케어기버 홈 화면 조회 @get
export const fetchCaregiverHome = async (accessToken: string) => {
  try {
    const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.CAREGIVER.HOME}`,
        {
          headers: getDefaultHeaders(accessToken),
        }
    );
    console.log(response.data)
    return response.data; // ApiResponse 형식이면 response.data.data 사용
  } catch (error) {
    console.error('케어기버 홈 요청 실패:', error);
    throw error;
  }
};

// 출근 체크 post
export const checkIn = async (data: CheckInRequest): Promise<ApiResponse<any>> => {
  const token = await getToken();
  try {
    const response = await axiosClient.post(
        `${API_BASE_URL}${API_ENDPOINTS.CAREGIVER.CHECK_IN}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
    return {
      success: true,
      data: response.data,
      message: '출근 체크 성공'
    };
  } catch (error) {
    return {
      success: false,
      error: '출근 체크 실패'
    };
  }
};

// 퇴근 체크
export const checkOut = async (data: CheckOutRequest): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosClient.post(API_ENDPOINTS.CAREGIVER.CHECK_OUT, data);
    return {
      success: true,
      data: response.data,
      message: '퇴근 체크 성공'
    };
  } catch (error) {
    return {
      success: false,
      error: '퇴근 체크 실패'
    };
  }
};

// 체크리스트 제출
export const submitChecklist = async (data: ChecklistRequest): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosClient.post(API_ENDPOINTS.CAREGIVER.CHECKLIST, data);
    return {
      success: true,
      data: response.data,
      message: '체크리스트 제출 성공'
    };
  } catch (error) {
    return {
      success: false,
      error: '체크리스트 제출 실패'
    };
  }
};

// 돌봄노트 제출
export const submitCareNote = async (data: CareNoteRequest): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosClient.post(API_ENDPOINTS.CAREGIVER.CARE_NOTE, data);
    return {
      success: true,
      data: response.data,
      message: '돌봄노트 제출 성공'
    };
  } catch (error) {
    return {
      success: false,
      error: '돌봄노트 제출 실패'
    };
  }
};

// 케어기버 담당 시니어 목록 조회
export const getCaregiverSeniors = async (): Promise<ApiResponse<Senior[]>> => {
  try {
    const response = await axiosClient.get(API_ENDPOINTS.CAREGIVER.SENIORS);
    
    // 백엔드에서 받은 데이터의 성별을 프론트엔드 형식으로 변환
    const convertedData = response.data.map((senior: any) => ({
      ...senior,
      gender: senior.gender === '남성' ? 'male' : 
              senior.gender === '여성' ? 'female' : 
              senior.gender
    }));
    
    return {
      success: true,
      data: convertedData,
      message: '시니어 목록 조회 성공'
    };
  } catch (error) {
    console.error('❌ 백엔드 API 호출 실패:', error);
    return {
      success: false,
      error: '시니어 목록 조회 실패'
    };
  }
};

// 오늘의 돌봄 세션 조회
export const getTodaySessions = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosClient.get(API_ENDPOINTS.CAREGIVER.SENIORS, {
      params: { 
        date: new Date().toISOString().split('T')[0],
        status: 'active'
      }
    });
    return {
      success: true,
      data: response.data,
      message: '세션 조회 성공'
    };
  } catch (error) {
    return {
      success: false,
      error: '세션 조회 실패'
    };
  }
}; 