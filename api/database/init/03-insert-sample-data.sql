-- ==========================================
-- Sinabro 데이터베이스 초기화 스크립트 3/3
-- 해커톤용 샘플 데이터 삽입
-- ==========================================

-- 샘플 가디언 (해외 거주 자녀) 삽입
INSERT INTO guardians (id, full_name, email, country, city, language_preference, timezone) VALUES
('550e8400-e29b-41d4-a716-446655440001', '가디언A', 'guardian.a@example.com', 'USA', 'New York', 'ko', 'America/New_York'),
('550e8400-e29b-41d4-a716-446655440002', '가디언B', 'guardian.b@example.com', 'Canada', 'Toronto', 'en', 'America/Toronto'),
('550e8400-e29b-41d4-a716-446655440003', '가디언C', 'guardian.c@example.com', 'Japan', 'Tokyo', 'ko', 'Asia/Tokyo');

-- 샘플 케어기버 (간병인) 삽입
INSERT INTO caregivers (id, full_name, email, phone_number, license_number, experience_years, languages, specialties) VALUES
('550e8400-e29b-41d4-a716-446655440004', '케어기버A', 'caregiver.a@example.com', '010-0000-1111', 'LIC123456', 5, 
 '["ko", "en"]', '["dementia", "diabetes", "hypertension"]'),
('550e8400-e29b-41d4-a716-446655440005', '케어기버B', 'caregiver.b@example.com', '010-0000-2222', 'LIC789012', 8, 
 '["ko", "zh", "en"]', '["mobility", "heart_disease", "depression"]'),
('550e8400-e29b-41d4-a716-446655440006', '케어기버C', 'caregiver.c@example.com', '010-0000-3333', 'LIC456789', 3, 
 '["ko", "jp"]', '["arthritis", "nutrition", "rehabilitation"]');

-- 샘플 시니어 (돌봄 대상) 삽입
INSERT INTO seniors (id, full_name, birth_date, gender, nationality, emergency_contact_name, emergency_contact_phone, 
                     medical_conditions, allergies, medications, mobility_level, cognitive_level, 
                     preferred_language, dietary_restrictions, cultural_preferences, notes) VALUES
('550e8400-e29b-41d4-a716-446655440007', '시니어A', '1940-05-15', 'female', 'Korean', '가디언A', '010-0000-1111',
 '["hypertension", "diabetes", "mild_arthritis"]', '["shellfish", "peanuts"]', 
 '[{"name": "혈압약", "dosage": "1일 1회 아침", "time": "08:00"}, {"name": "당뇨약", "dosage": "1일 2회 식후", "time": "12:00,19:00"}]',
 'assisted', 'mild_impairment', 'ko', '["low_sodium", "low_sugar"]', 
 '{"religion": "buddhist", "food_preference": "korean_traditional", "hobby": "trot_music"}', 
 '트로트 음악을 좋아하시고, 가족 생각을 자주 하십니다.'),
('550e8400-e29b-41d4-a716-446655440008', '시니어B', '1938-12-03', 'female', 'Korean', '가디언B', '010-0000-2222',
 '["osteoporosis", "high_cholesterol"]', '["dairy"]', 
 '[{"name": "칼슘제", "dosage": "1일 1회", "time": "20:00"}, {"name": "콜레스테롤약", "dosage": "1일 1회 저녁", "time": "19:00"}]',
 'wheelchair', 'normal', 'ko', '["dairy_free", "low_fat"]', 
 '{"religion": "christian", "food_preference": "light_meals", "hobby": "reading"}', 
 '독서를 좋아하시고 기억력이 아주 좋으십니다.'),
('550e8400-e29b-41d4-a716-446655440009', '시니어C', '1935-08-20', 'male', 'Korean', '가디언C', '010-0000-3333',
 '["dementia", "hypertension"]', '[]', 
 '[{"name": "치매약", "dosage": "1일 1회", "time": "08:00"}, {"name": "혈압약", "dosage": "1일 1회", "time": "08:00"}]',
 'assisted', 'severe_impairment', 'ko', '["soft_food"]', 
 '{"religion": "none", "food_preference": "simple", "hobby": "walking"}', 
 '산책을 좋아하시지만 기억력에 문제가 있어 주의가 필요합니다.');

-- 샘플 채널 (가디언-케어기버-시니어 연결) 삽입
INSERT INTO channels (id, channel_name, guardian_id, caregiver_id, senior_id, start_date) VALUES
('550e8400-e29b-41d4-a716-446655440010', '시니어A 케어채널', 
 '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 
 '2024-01-01'),
('550e8400-e29b-41d4-a716-446655440011', '시니어B 케어채널',
 '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008',
 '2024-01-15'),
('550e8400-e29b-41d4-a716-446655440012', '박할아버지 케어채널',
 '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440009',
 '2024-02-01');

-- 해커톤용 접속 코드 삽입
INSERT INTO access_codes (code, user_type, user_id, channel_id, expires_at) VALUES
-- 가디언 접속 코드
('GUARD001', 'guardian', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', NOW() + INTERVAL '1 year'),
('GUARD002', 'guardian', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', NOW() + INTERVAL '1 year'),
('GUARD003', 'guardian', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440012', NOW() + INTERVAL '1 year'),
-- 케어기버 접속 코드
('CARE001', 'caregiver', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', NOW() + INTERVAL '1 year'),
('CARE002', 'caregiver', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440011', NOW() + INTERVAL '1 year'),
('CARE003', 'caregiver', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440012', NOW() + INTERVAL '1 year');

-- 샘플 체크리스트 템플릿 삽입
INSERT INTO checklist_templates (name, category, items) VALUES
('기본 건강관리 체크리스트', 'health', '{
  "items": [
    {"id": 1, "text": "혈압 측정", "required": true, "type": "measurement"},
    {"id": 2, "text": "체온 측정", "required": true, "type": "measurement"},
    {"id": 3, "text": "약물 복용 확인", "required": true, "type": "medication"},
    {"id": 4, "text": "식사량 체크", "required": false, "type": "nutrition"},
    {"id": 5, "text": "수분 섭취 확인", "required": false, "type": "nutrition"},
    {"id": 6, "text": "운동 및 활동", "required": false, "type": "activity"}
  ]
}'),
('일상생활 관리 체크리스트', 'daily_care', '{
  "items": [
    {"id": 1, "text": "개인위생 관리", "required": true, "type": "hygiene"},
    {"id": 2, "text": "옷 갈아입기", "required": true, "type": "hygiene"},
    {"id": 3, "text": "사회적 상호작용", "required": false, "type": "social"},
    {"id": 4, "text": "수면 패턴 확인", "required": true, "type": "sleep"},
    {"id": 5, "text": "안전 확인", "required": true, "type": "safety"}
  ]
}');

-- 샘플 관리자 질문 삽입
INSERT INTO admin_questions (question_text, question_type, target_audience) VALUES
('어르신의 오늘 전반적인 컨디션은 어떠셨나요?', 'daily', 'caregiver'),
('식사는 잘 드셨나요? 특별한 변화가 있었나요?', 'daily', 'caregiver'),
('복용하신 약물에 대해 특이사항이 있었나요?', 'daily', 'caregiver'),
('어르신의 기분이나 감정 상태는 어떠셨나요?', 'daily', 'caregiver'),
('케어 서비스에 만족하시나요?', 'weekly', 'guardian'),
('개선이 필요한 부분이 있다면 알려주세요.', 'weekly', 'guardian'),
('어르신과의 소통에서 어려운 점은 없으셨나요?', 'weekly', 'caregiver');

-- 샘플 일일 체크리스트 기록 (최근 3일)
INSERT INTO daily_checklists (channel_id, template_id, checked_items, additional_notes, completion_rate, created_date, created_by) VALUES
-- 김영희님 케어 (어제)
('550e8400-e29b-41d4-a716-446655440010', 
 (SELECT id FROM checklist_templates WHERE name = '기본 건강관리 체크리스트' LIMIT 1),
 '{
   "items": [
     {"id": 1, "checked": true, "time": "09:00", "value": "130/80", "notes": "정상 범위"},
     {"id": 2, "checked": true, "time": "09:15", "value": "36.5°C", "notes": "정상"},
     {"id": 3, "checked": true, "time": "08:30", "notes": "혈압약, 당뇨약 복용 완료"},
     {"id": 4, "checked": true, "time": "12:00", "value": "80%", "notes": "평소보다 적게 드심"},
     {"id": 5, "checked": true, "notes": "물 6잔 정도 드심"},
     {"id": 6, "checked": false, "reason": "날씨가 추워서 실내에서만 활동"}
   ]
 }', 
 '트로트 음악을 들으며 기분 좋게 지내셨습니다.', 85.00, CURRENT_DATE - 1, 
 '550e8400-e29b-41d4-a716-446655440004'),

-- 김영희님 케어 (오늘)
('550e8400-e29b-41d4-a716-446655440010', 
 (SELECT id FROM checklist_templates WHERE name = '기본 건강관리 체크리스트' LIMIT 1),
 '{
   "items": [
     {"id": 1, "checked": true, "time": "09:00", "value": "125/78", "notes": "좋음"},
     {"id": 2, "checked": true, "time": "09:10", "value": "36.3°C", "notes": "정상"},
     {"id": 3, "checked": true, "time": "08:30", "notes": "모든 약물 정시 복용"},
     {"id": 4, "checked": true, "time": "12:30", "value": "90%", "notes": "미역국을 맛있게 드심"},
     {"id": 5, "checked": true, "notes": "충분한 수분 섭취"},
     {"id": 6, "checked": true, "time": "15:00", "notes": "실내에서 가벼운 스트레칭"}
   ]
 }', 
 '오늘은 컨디션이 매우 좋으셨고, 아들 이야기를 하며 웃으셨습니다.', 100.00, CURRENT_DATE, 
 '550e8400-e29b-41d4-a716-446655440004');

-- 샘플 돌봄노트 삽입
INSERT INTO care_notes (channel_id, caregiver_id, note_type, content, related_date, tags) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'daily_summary',
 '김영희 할머니께서 오늘 하루 매우 좋은 컨디션을 보이셨습니다. 아침 혈압이 125/78로 안정적이었고, 약물도 거부감 없이 잘 복용해주셨습니다. 
 
점심시간에는 평소 좋아하시는 미역국과 잡곡밥을 준비해드렸는데, "아들이 어릴 때 자주 끓여줬던 맛이 난다"며 매우 기뻐하셨습니다. 90% 정도 드셨고, 특히 미역국을 완전히 드셨습니다.

오후에는 트로트 음악을 들으며 손뼉을 치시는 모습이 인상적이었습니다. "진짜 사나이" 노래를 듣고 젊은 시절 이야기를 해주셨는데, 남편분과 처음 만났을 때 이야기를 들려주셨습니다.

저녁 약물 시간을 7시로 조정한 것이 효과적이었습니다. 거부감 없이 복용하셨고, "시간이 맞으니 좋다"고 말씀하셨습니다.', 
 CURRENT_DATE, '["good_condition", "medication_compliance", "family_memory", "music_therapy"]'),

('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440005', 'daily_summary',
 '이순자 할머니는 오늘도 독서에 집중하며 하루를 보내셨습니다. 휠체어 이동에 큰 불편함이 없으셨고, 스스로 원하시는 위치로 이동하셨습니다.

아침에 성경 말씀을 읽으시는 시간을 가지셨고, 오늘은 시편을 읽으셨다고 하십니다. 평소보다 더 차분한 모습이셨습니다.

칼슘제와 콜레스테롤 약물 복용도 정시에 잘해주셨습니다. 유제품 알레르기 때문에 두유로 칼슘제를 복용하시는데, "맛이 고소하다"며 만족해하셨습니다.

저녁에는 딸 이야기를 하시며 "캐나다는 지금 추울 텐데"라고 걱정하는 모습을 보이셨습니다. 가족에 대한 애정이 깊으시다는 것을 다시 한번 느꼈습니다.',
 CURRENT_DATE, '["reading", "religious_activity", "medication_compliance", "family_concern"]');

-- 샘플 AI 리포트 삽입 (해커톤 데모용)
INSERT INTO ai_reports (channel_id, report_date, checklist_ids, care_note_ids, summary_text, family_comment, 
                        mood_analysis, health_status, recommendations, generation_time_ms, confidence_score) VALUES
('550e8400-e29b-41d4-a716-446655440010', CURRENT_DATE,
 ARRAY[(SELECT id FROM daily_checklists WHERE channel_id = '550e8400-e29b-41d4-a716-446655440010' AND created_date = CURRENT_DATE LIMIT 1)],
 ARRAY[(SELECT id FROM care_notes WHERE channel_id = '550e8400-e29b-41d4-a716-446655440010' AND related_date = CURRENT_DATE LIMIT 1)],
 '김영희 할머니께서 오늘 건강상태가 매우 양호하셨습니다. 혈압 125/78로 안정적이고 약물 복용도 완벽했습니다. 트로트 음악을 들으며 즐거워하는 모습이 인상적이었고, 미역국을 맛있게 드시며 아들 이야기를 하셨습니다.',
 '할머니께서 트로트 음악을 좋아하신다는 것을 오늘 새롭게 알게 되었네요. 이번 주말 영상통화 때 함께 좋아하시는 노래를 들어보는 건 어떨까요? 할머니가 드신 미역국은 철수님 어릴 때 자주 끓여주던 그 맛이라고 하셨어요.',
 '{"mood": "positive", "score": 85, "keywords": ["happy", "nostalgic", "comfortable"], "energy_level": "good"}',
 '{"blood_pressure": "stable", "medication_compliance": "excellent", "appetite": "good", "mobility": "assisted_stable", "overall": "very_good"}',
 '["continue_trot_music_therapy", "maintain_current_medication_schedule", "encourage_family_video_calls", "prepare_traditional_korean_soups"]',
 2850, 0.92),

('550e8400-e29b-41d4-a716-446655440011', CURRENT_DATE,
 ARRAY[]::UUID[], ARRAY[(SELECT id FROM care_notes WHERE channel_id = '550e8400-e29b-41d4-a716-446655440011' AND related_date = CURRENT_DATE LIMIT 1)],
 '이순자 할머니는 오늘도 독서와 기도 시간을 가지며 평온한 하루를 보내셨습니다. 휠체어 이동에 불편함 없으셨고 약물 복용도 정시에 잘 지켜주셨습니다. 딸에 대한 걱정과 사랑이 깊으시다는 것을 다시 느꼈습니다.',
 '할머니가 캐나다 날씨를 걱정하며 영희님을 생각하고 계신다고 하네요. 할머니께 따뜻한 안부 영상을 보내주시면 정말 기뻐하실 것 같아요. 성경 읽기를 좋아하시니 함께 기도하는 시간도 의미있을 것 같습니다.',
 '{"mood": "peaceful", "score": 78, "keywords": ["calm", "caring", "thoughtful"], "energy_level": "stable"}',
 '{"mobility": "wheelchair_stable", "medication_compliance": "excellent", "cognitive": "very_good", "spiritual_wellness": "strong", "overall": "stable"}',
 '["encourage_family_video_prayer", "maintain_reading_routine", "consider_weather_updates_from_canada", "continue_spiritual_activities"]',
 2640, 0.89);

-- 샘플 질문 답변 삽입
INSERT INTO question_responses (channel_id, question_id, responder_id, responder_type, response_text, response_date) VALUES
('550e8400-e29b-41d4-a716-446655440010', 
 (SELECT id FROM admin_questions WHERE question_text LIKE '%전반적인 컨디션%' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440004', 'caregiver',
 '오늘 김영희 할머니께서는 아주 좋은 컨디션을 보이셨습니다. 특히 트로트 음악을 들으며 손뼉을 치시고 웃으시는 모습이 오랜만에 보는 즐거운 모습이었어요.',
 CURRENT_DATE),

('550e8400-e29b-41d4-a716-446655440010',
 (SELECT id FROM admin_questions WHERE question_text LIKE '%식사는%' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440004', 'caregiver',
 '미역국을 매우 맛있게 드셨습니다. 아들 어릴 때 해주던 그 맛이라며 정말 기뻐하셨어요. 90% 정도 드시고 특히 국물을 다 드셨습니다.',
 CURRENT_DATE);

-- ==========================================
-- 샘플 데이터 삽입 완료 메시지
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ Sinabro 샘플 데이터 삽입 완료!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '👥 생성된 사용자:';
    RAISE NOTICE '  • 가디언 3명 (김철수, 이영희, 박민수)';
    RAISE NOTICE '  • 케어기버 3명 (최간병, 정돌봄, 한간호)';
    RAISE NOTICE '  • 시니어 3명 (김영희, 이순자, 박할아버지)';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 해커톤용 접속 코드:';
    RAISE NOTICE '  가디언: GUARD001, GUARD002, GUARD003';
    RAISE NOTICE '  케어기버: CARE001, CARE002, CARE003';
    RAISE NOTICE '';
    RAISE NOTICE '📋 테스트 데이터:';
    RAISE NOTICE '  • 체크리스트 템플릿 2개';
    RAISE NOTICE '  • 일일 체크리스트 기록 2개';
    RAISE NOTICE '  • 돌봄노트 2개';
    RAISE NOTICE '  • AI 리포트 2개';
    RAISE NOTICE '  • 관리자 질문 7개';
    RAISE NOTICE '  • 질문 답변 2개';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 데모 추천 시나리오:';
    RAISE NOTICE '  1. CARE001로 로그인 → 체크리스트 작성';
    RAISE NOTICE '  2. 돌봄노트 작성 및 사진 업로드';
    RAISE NOTICE '  3. AI 리포트 생성';
    RAISE NOTICE '  4. GUARD001로 로그인 → 리포트 확인';
    RAISE NOTICE '  5. 피드백 작성';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '🎉 해커톤 준비 완료! 화이팅! 🚀';
    RAISE NOTICE '==========================================';
END $$;
