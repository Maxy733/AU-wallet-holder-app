import type { ImageSourcePropType } from 'react-native';

type IssuerArtwork = {
  image?: ImageSourcePropType;
  initials: string;
  resizeMode?: 'contain' | 'cover';
};

const artworkByIssuerCode: Record<string, IssuerArtwork> = {
  'assumption-university': {
    image: require('../../assets/Assumption_University_of_Thailand_(logo).png'),
    initials: 'AU',
  },
  thaid: {
    image: require('../../assets/ThaID.png'),
    initials: 'TH',
  },
  'dlt-qr-licence': {
    image: require('../../assets/DLTQRLicence.png'),
    initials: 'DLT',
    resizeMode: 'cover',
  },
};

export function getIssuerArtwork(issuerCode: string, displayName: string): IssuerArtwork {
  return artworkByIssuerCode[issuerCode] ?? {
    initials: displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?',
  };
}
