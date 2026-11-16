// trendAnalysis를 렌더링하는 함수
import {AICareNoteDetailDto} from "../dto/AIreportDto.tsx";
import {StyleSheet, Text, View} from "react-native";
import React from "react";
import {borderRadiusSizes, colorPallet, fontSizes, marginSizes} from "../styles/globalStyles.tsx";
import {fonts} from "../styles/fonts.tsx";

export const RenderTrendAnalysis = (trendAnalysis: AICareNoteDetailDto['trendAnalysis']) => {
    if (!trendAnalysis || trendAnalysis.length === 0) {
        return (
            <Text style={styles.noDataText}>추이 분석 데이터가 없습니다.</Text>
        );
    }

    return trendAnalysis.map((trend, index) => (
        <View key={index} style={styles.trendItem}>
            <View style={styles.trendHeader}>
                <Text style={styles.trendCategory}>{trend.category}</Text>
                <View style={[
                    styles.changeIndicator,
                    { backgroundColor: getChangeColor(trend.iconType) }
                ]}>
                    <Text style={styles.changeAmount}>{trend.changeAmount}</Text>
                </View>
            </View>

            <View style={styles.chartContainer}>
                {renderLineChart(trend.chartData, getChangeColor(trend.iconType))}
            </View>
        </View>
    ));
};

// 라인 차트 렌더링 함수
const renderLineChart = (chartData: number[], color: string) => {
    if (chartData.length < 2) return null;

    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);
    const valueRange = maxValue - minValue || 1; // 0으로 나누기 방지

    const chartHeight = 80; // 차트 높이
    const padding = 10; // 여백

    const points = chartData.map((value, index) => {
        const x = 50 + (index / (chartData.length - 1)) * 50; // x 위치를 50%~100% 범위로
        // 값이 클수록 위로 올라가도록 Y축 계산 수정
        const y = chartHeight - padding - ((value - minValue) / valueRange) * (chartHeight - 2 * padding);
        return { x, y, value };
    });

    return (
        <View style={styles.lineChartContainer}>
            {/* 실제 데이터 포인트들을 연결하는 점선들 */}
            {points.slice(0, -1).map((point, index) => {
                const nextPoint = points[index + 1];
                const distance = Math.sqrt(
                    Math.pow((nextPoint.x - point.x) * 3, 2) +
                    Math.pow(nextPoint.y - point.y, 2)
                );
                const angle = Math.atan2(nextPoint.y - point.y, (nextPoint.x - point.x) * 3) * 180 / Math.PI;
                
                // 점선을 여러 개의 작은 선분으로 나누어 그리기
                const dashLength = 4; // 점선의 길이
                const gapLength = 2; // 점선 사이의 간격
                const totalDashLength = dashLength + gapLength;
                const numDashes = Math.floor(distance / totalDashLength);
                
                return Array.from({ length: numDashes }, (_, dashIndex) => {
                    const dashStart = (dashIndex * totalDashLength) / distance;
                    const dashEnd = Math.min((dashIndex * totalDashLength + dashLength) / distance, 1);
                    const actualDashLength = (dashEnd - dashStart) * distance;
                    
                    const dashX = point.x + (nextPoint.x - point.x) * dashStart;
                    const dashY = point.y + (nextPoint.y - point.y) * dashStart;
                    
                    return (
                        <View
                            key={`${index}-${dashIndex}`}
                            style={[
                                styles.dataLine,
                                {
                                    width: actualDashLength,
                                    height: 2,
                                    left: `${dashX}%`,
                                    top: dashY,
                                    transform: [{ rotate: `${angle}deg` }],
                                    transformOrigin: 'left center',
                                    backgroundColor: color,
                                }
                            ]}
                        />
                    );
                });
            }).flat()}

            {/* 데이터 포인트들을 원으로 표시 */}
            {points.map((point, index) => (
                <View
                    key={`point-${index}`}
                    style={[
                        styles.dataPoint,
                        {
                            backgroundColor: color,
                            left: `${point.x}%`,
                            top: point.y - 4, // 원의 반지름만큼 위로 조정
                        }
                    ]}
                />
            ))}
        </View>
    );
};

// 고정 색상 반환 함수
const getChangeColor = (_iconType: 'positive' | 'negative' | 'neutral') => {
    return '#0084FF'; // 모든 경우에 동일한 파란색 사용
};

const styles = StyleSheet.create({
    trendSection: {
        marginTop: marginSizes.large,
    },
    trendItem: {
        backgroundColor: colorPallet.subColor,
        borderRadius: borderRadiusSizes.large,
        padding: marginSizes.medium,
        marginBottom: marginSizes.medium,
    },
    trendHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: marginSizes.medium,
    },
    trendCategory: {
        fontSize: fontSizes.medium,
        fontFamily: fonts.bold,
        color: colorPallet.defaultText,
    },
    changeIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadiusSizes.medium,
    },
    changeAmount: {
        fontSize: fontSizes.small,
        fontFamily: fonts.bold,
        color: '#fff',
    },
    chartContainer: {
        height: 90,
        width: '100%',
        position: 'relative',
    },
    lineChartContainer: {
        height: 80,
        width: '100%',
        position: 'relative',
        marginTop: 20,
    },
    dataLine: {
        position: 'absolute',
    },
    dataPoint: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    noDataText: {
        textAlign: 'center',
        color: colorPallet.des,
        fontFamily: fonts.medium,
        padding: marginSizes.medium,
    },
});