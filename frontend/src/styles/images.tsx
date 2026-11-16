import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface IconProps {
    size?: number;
    style?: ImageStyle;
}

const iconSize = 15
const imageSize = 20

export const PreIcon = ({ size = iconSize, style }: IconProps) => (
    <Image
        source={require('../../assets/images/icons/preIcon.png')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
    />
);

export const PostIcon = ({ size = iconSize, style }: IconProps) => (
    <Image
        source={require('../../assets/images/icons/postIcon.png')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
    />
);

export const UpIcon = ({ size = iconSize, style }: IconProps) => (
    <Image
        source={require('../../assets/images/icons/upIcon.png')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
    />
);

export const DownIcon = ({ size = iconSize, style }: IconProps) => (
    <Image
        source={require('../../assets/images/icons/downIcon.png')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
    />
);

export const FireIcon = ({ size = iconSize, style }: IconProps) => (
    <Image
        source={require('../../assets/images/icons/conditionIcon.png')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
    />
);

export const ChallengeIcon = ({ size = iconSize, style }: IconProps) => (
    <Image
        source={require('../../assets/images/icons/ChallengeIcon.png')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
    />
);

export const ChallengeHoverIcon = ({ size = iconSize, style }: IconProps) => (
    <Image
        source={require('../../assets/images/icons/ChallengeHoverICon.png')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
    />
);

export const SeniorImage1 = ({ style }: IconProps) => (
    <Image
        source={require('../../assets/images/imageGrand.png')}
        style={[{}, style]}
    />
);

export const SeniorImage2 = ({ size = imageSize, style }: IconProps) => (
    <Image
        source={require('../../assets/images/imageGrand.png')}
        style={[{ width: size, height: size }, style]}
    />
);

export const AIstarIcon = ({ size = iconSize, style }: IconProps) => (
    <Image
        source={require('../../assets/images/icons/AIstar.png')}
        style={[{ width: size, height: size }, style]}
    />
);

export const SubmitIcon = ({ size = iconSize, style }: IconProps) => (
    <Image
        source={require('../../assets/images/icons/submitIcon.png')}
        style={[{ width: size, height: size }, style]}
    />
);