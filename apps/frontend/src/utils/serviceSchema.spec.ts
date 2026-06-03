import { buildLocalBusinessSchema, buildServiceSchema } from './seo';
import { describe, expect, it } from 'vitest';

describe('service schema helpers', () => {
  it('builds service schema with optional area served and provider', () => {
    expect(
      buildServiceSchema({
        name: 'Cho thuê xe nâng TPHCM',
        description: 'Dịch vụ cho thuê xe nâng tại TP.HCM',
        url: 'https://example.test/dich-vu/cho-thue-xe-nang-tphcm',
        image: 'https://example.test/thumb.jpg',
        areaServed: 'TP.HCM',
        providerName: 'MGA Vietnam',
      }),
    ).toMatchObject({
      '@type': 'Service',
      areaServed: {
        '@type': 'Place',
        name: 'TP.HCM',
      },
      provider: {
        '@type': 'Organization',
        name: 'MGA Vietnam',
      },
    });
  });

  it('builds local business schema for tphcm service coverage', () => {
    expect(
      buildLocalBusinessSchema({
        name: 'MGA Vietnam',
        url: 'https://example.test/dich-vu/sua-xe-nang-tphcm',
        telephone: '0918865060',
        areaServed: 'TP.HCM',
        address: '37/6 Khu Pho Tay, Phuong Lai Thieu, Thanh Pho Ho Chi Minh',
      }),
    ).toMatchObject({
      '@type': 'LocalBusiness',
      telephone: '0918865060',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '37/6 Khu Pho Tay',
        addressLocality: 'Phuong Lai Thieu',
        addressRegion: 'Thanh Pho Ho Chi Minh',
        addressCountry: 'VN',
      },
      areaServed: {
        '@type': 'Place',
        name: 'TP.HCM',
      },
    });
  });

  it('skips local business schema when address is missing', () => {
    expect(
      buildLocalBusinessSchema({
        name: 'MGA Vietnam',
        url: 'https://example.test/dich-vu/sua-xe-nang-tphcm',
        telephone: '0918865060',
        areaServed: 'TP.HCM',
      }),
    ).toBeNull();
  });
});
