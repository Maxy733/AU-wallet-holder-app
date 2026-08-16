import type { ImageSourcePropType } from 'react-native';

type IssuerArtwork = {
  image?: ImageSourcePropType;
  initials: string;
};

const artworkByIssuerCode: Record<string, IssuerArtwork> = {
  'assumption-university': {
    image: require('../../assets/Assumption_University_of_Thailand_(logo).png'),
    initials: 'AU',
  },
  'demo-issuer-alpha': { initials: 'A' },
  'demo-issuer-beta': { initials: 'B' },
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
