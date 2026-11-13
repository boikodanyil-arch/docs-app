import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const icons = {
  scan: (
    <>
      <Path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <Path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <Path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <Path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <Path d="M7 12h10" />
    </>
  ),
  clock: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  lock: (
    <>
      <Rect x="4" y="11" width="16" height="10" rx="2" />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  bell: (
    <>
      <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  arrow: (
    <>
      <Path d="M5 12h14" />
      <Path d="m13 6 6 6-6 6" />
    </>
  ),
  sliders: (
    <>
      <Path d="M4 7h10" />
      <Path d="M18 7h2" />
      <Circle cx="16" cy="7" r="2" />
      <Path d="M4 17h4" />
      <Path d="M12 17h8" />
      <Circle cx="10" cy="17" r="2" />
    </>
  ),
  file: (
    <>
      <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <Path d="M14 3v5h5" />
    </>
  ),
  gear: (
    <>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  shield: (
    <>
      <Path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      <Path d="M12 9v6" />
      <Path d="M9 12h6" />
    </>
  ),
  home: (
    <>
      <Path d="M3 11 12 4l9 7" />
      <Path d="M5 10v10h14V10" />
      <Path d="M10 20v-6h4v6" />
    </>
  ),
  idCard: (
    <>
      <Rect x="3" y="5" width="18" height="14" rx="2" />
      <Circle cx="9" cy="11" r="2" />
      <Path d="M6 16c.6-1.5 1.7-2 3-2s2.4.5 3 2" />
      <Path d="M15 10h3" />
      <Path d="M15 14h3" />
    </>
  ),
  stamp: (
    <>
      <Rect x="4" y="3" width="16" height="18" rx="2" />
      <Circle cx="12" cy="10" r="3" />
      <Path d="M8 17h8" />
    </>
  ),
  book: (
    <>
      <Path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" />
      <Circle cx="12" cy="11" r="2.5" />
      <Path d="M9 17h6" />
    </>
  ),
  close: (
    <>
      <Path d="M6 6l12 12" />
      <Path d="M18 6 6 18" />
    </>
  ),
  flash: <Path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  gallery: (
    <>
      <Rect x="3" y="3" width="18" height="18" rx="3" />
      <Circle cx="9" cy="9" r="2" />
      <Path d="m21 15-5-5L5 21" />
    </>
  ),
  chevronLeft: <Path d="m15 6-6 6 6 6" />,
  chevronDown: <Path d="m6 9 6 6 6-6" />,
  dots: (
    <>
      <Circle cx="5" cy="12" r="1.8" />
      <Circle cx="12" cy="12" r="1.8" />
      <Circle cx="19" cy="12" r="1.8" />
    </>
  ),
  check: <Path d="m5 12 5 5 9-10" />,
  calendar: (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M16 3v4" />
      <Path d="M8 3v4" />
      <Path d="M3 10h18" />
    </>
  ),
  filePlus: (
    <>
      <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <Path d="M14 3v5h5" />
      <Path d="M12 12v6" />
      <Path d="M9 15h6" />
    </>
  ),
  pencil: (
    <>
      <Path d="M4 20h4L19 9l-4-4L4 16z" />
      <Path d="m13 7 4 4" />
    </>
  ),
  trash: (
    <>
      <Path d="M4 7h16" />
      <Path d="M9 7V4h6v3" />
      <Path d="M6 7l1 13h10l1-13" />
    </>
  ),
};

export type IconName = keyof typeof icons;

interface Props {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color, strokeWidth = 2 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </Svg>
  );
}
