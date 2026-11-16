-- ORM 모델로 생성되지 않지만 라우터의 raw SQL이 사용하는 테이블·뷰입니다.
-- 원래 운영 DB에서 수동으로 만들었던 객체를 코드 사용처를 기준으로 복원했습니다.

CREATE TABLE IF NOT EXISTS care_calendar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    senior_id INT NOT NULL,
    caregiver_id INT NOT NULL,
    care_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    category_code VARCHAR(50) NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_care_calendar_caregiver_date (caregiver_id, care_date),
    INDEX idx_care_calendar_senior_date (senior_id, care_date),
    CONSTRAINT fk_care_calendar_senior FOREIGN KEY (senior_id) REFERENCES seniors(id),
    CONSTRAINT fk_care_calendar_caregiver FOREIGN KEY (caregiver_id) REFERENCES caregivers(id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS weekly_category_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    senior_id INT NOT NULL,
    caregiver_id INT NOT NULL,
    category_id INT NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    total_score DECIMAL(8,2) NOT NULL,
    max_possible_score DECIMAL(8,2) NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    question_count INT NOT NULL,
    completed_questions INT NOT NULL,
    previous_week_score DECIMAL(5,2) NULL,
    score_change DECIMAL(5,2) NULL,
    trend_direction VARCHAR(20) NULL,
    risk_level VARCHAR(20) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wcs_senior FOREIGN KEY (senior_id) REFERENCES seniors(id),
    CONSTRAINT fk_wcs_caregiver FOREIGN KEY (caregiver_id) REFERENCES caregivers(id),
    CONSTRAINT fk_wcs_category FOREIGN KEY (category_id) REFERENCES checklist_categories(id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category_trend_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    senior_id INT NOT NULL,
    category_code VARCHAR(50) NOT NULL,
    analysis_date DATE NOT NULL,
    current_score DECIMAL(5,2) NOT NULL,
    previous_score DECIMAL(5,2) NULL,
    change_amount DECIMAL(5,2) NULL,
    change_direction VARCHAR(20) NULL,  -- up, stable, down
    status_level VARCHAR(20) NULL,      -- good, caution, warning
    avatar_emotion VARCHAR(20) NULL,    -- happy, worried, dizzy
    avatar_color VARCHAR(20) NULL,      -- blue, green, red
    status_message TEXT NULL,
    trend_data TEXT NULL,
    ai_recommendation TEXT NULL,
    family_action TEXT NULL,
    -- 관리자 분석 API(admin.py)가 쓰는 컬럼. 같은 테이블을 두 가지 이름으로 읽는다.
    category_name VARCHAR(50) NULL,
    trend_direction VARCHAR(20) NULL,  -- improving, stable, declining
    score_change DECIMAL(5,2) NULL,
    category_insights TEXT NULL,
    recommendations TEXT NULL,
    ui_data TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cta_senior_category_date (senior_id, category_code, analysis_date),
    CONSTRAINT fk_cta_senior FOREIGN KEY (senior_id) REFERENCES seniors(id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 시니어별 카테고리(영양·고혈압·우울) 최신 분석 결과를 한 행으로 펼친 뷰
CREATE OR REPLACE VIEW v_latest_category_status AS
SELECT
    s.id AS senior_id,
    MAX(CASE WHEN c.category_code = 'nutrition' THEN c.current_score END) AS nutrition_percentage,
    MAX(CASE WHEN c.category_code = 'nutrition' THEN CONCAT(IF(c.change_amount > 0, '+', ''), COALESCE(c.change_amount, 0)) END) AS nutrition_change_display,
    MAX(CASE WHEN c.category_code = 'nutrition' THEN c.avatar_color END) AS nutrition_color,
    MAX(CASE WHEN c.category_code = 'nutrition' THEN c.avatar_emotion END) AS nutrition_emotion,
    MAX(CASE WHEN c.category_code = 'nutrition' THEN c.status_message END) AS nutrition_message,
    MAX(CASE WHEN c.category_code = 'hypertension' THEN c.current_score END) AS hypertension_percentage,
    MAX(CASE WHEN c.category_code = 'hypertension' THEN CONCAT(IF(c.change_amount > 0, '+', ''), COALESCE(c.change_amount, 0)) END) AS hypertension_change_display,
    MAX(CASE WHEN c.category_code = 'hypertension' THEN c.avatar_color END) AS hypertension_color,
    MAX(CASE WHEN c.category_code = 'hypertension' THEN c.avatar_emotion END) AS hypertension_emotion,
    MAX(CASE WHEN c.category_code = 'hypertension' THEN c.status_message END) AS hypertension_message,
    MAX(CASE WHEN c.category_code = 'depression' THEN c.current_score END) AS depression_percentage,
    MAX(CASE WHEN c.category_code = 'depression' THEN CONCAT(IF(c.change_amount > 0, '+', ''), COALESCE(c.change_amount, 0)) END) AS depression_change_display,
    MAX(CASE WHEN c.category_code = 'depression' THEN c.avatar_color END) AS depression_color,
    MAX(CASE WHEN c.category_code = 'depression' THEN c.avatar_emotion END) AS depression_emotion,
    MAX(CASE WHEN c.category_code = 'depression' THEN c.status_message END) AS depression_message
FROM seniors s
LEFT JOIN category_trend_analysis c
    ON c.senior_id = s.id
   AND c.analysis_date = (
        SELECT MAX(c2.analysis_date) FROM category_trend_analysis c2
        WHERE c2.senior_id = c.senior_id AND c2.category_code = c.category_code
   )
GROUP BY s.id;
