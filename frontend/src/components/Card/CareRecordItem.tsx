// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { fonts } from '../../styles/fonts';
// import { useNavigation } from '@react-navigation/native';
// import CareStartBtn from "../../components/Btn/CareStartBtn.tsx";
// import { currentUser } from '../../data/currentUser';
// import {borderRadiusSizes} from "../../styles/globalStyles.tsx";
//
// interface CareRecordItemProps {
//     date: string;
//     day: string;
//     recordNumber: string;
// }
//
// const CareRecordItem: React.FC<CareRecordItemProps> = ({ date, day, recordNumber }) => {
//     const navigation = useNavigation();
//
//
//     const handleChecklist = () => {
//         navigation.navigate('CheckList' as never);
//     };
//
//     const handleCareNote = (senior: any) => {
//         if (currentUser.role === 'CareGiver') {
//             navigation.navigate('CareNote' as never);
//         } else if (currentUser.role === 'Guardian') {
//             navigation.navigate('CareNoteDetailEach' as never, { senior } as never);
//         }
//     };
//
//     return (
//         <View style={styles.container}>
//             <View style={styles.dateSection}>
//                 <Text style={styles.date}>{parseInt(date, 10)}</Text>
//                 <Text style={styles.day}>{day}</Text>
//             </View>
//             <View style={styles.contentSection}>
//                 <Text style={styles.recordNumber}>{recordNumber}</Text>
//
//                 <View style={styles.buttonContainer}>
//                     {currentUser.role === 'CareGiver' && (
//                         <CareStartBtn style={{
//                             paddingVertical: 8,
//                             paddingHorizontal: 12,
//                         }}/>
//                     )}
//
//
//                     <TouchableOpacity style={styles.button} onPress={handleChecklist}>
//                         <Text style={styles.buttonText}>체크리스트</Text>
//                     </TouchableOpacity>
//
//                     <TouchableOpacity style={styles.button} onPress={handleCareNote}>
//                         <Text style={styles.buttonText}>돌봄노트</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     container: {
//         backgroundColor: '#F4F6F6',
//         borderRadius: 12,
//         padding: 15,
//
//         justifyContent:'space-between',
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     dateSection: {
//         alignItems: 'center',
//         marginRight: 20,
//         flex:1,
//     },
//     date: {
//         fontSize: 30,
//         fontFamily:fonts.bold,
//     },
//     day: {
//         fontSize: 14,
//         marginTop: 2,
//         fontFamily:fonts.bold,
//     },
//     contentSection: {
//         flex: 4,
//     },
//     recordNumber: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 10,
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         //justifyContent:'flex-end',
//         gap: 8,
//         //backgroundColor:'red'
//     },
//     button: {
//         backgroundColor: '#ffffff',
//         borderRadius: borderRadiusSizes.medium,
//         maxWidth:100,
//         justifyContent:'center',
//
//         paddingVertical: 8,
//         paddingHorizontal: 12,
//         alignItems: 'center',
//     },
//     buttonText: {
//         fontFamily:fonts.medium,
//         color: '#26252c',
//         fontSize: 14,
//     },
// });
//
// export default CareRecordItem;