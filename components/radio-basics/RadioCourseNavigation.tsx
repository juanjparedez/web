'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import { radioCoursePath } from '@/config/radio-course';
import { RadioOfflineButton } from '@/components/radio/RadioOfflineButton';
import { RADIO_NAV_GROUPS, radioNavGroupOf, type RadioNavItem, type RadioNavPageId } from './radioNavGroups';
import styles from './radioCourse.module.css';

export type { RadioNavPageId } from './radioNavGroups';

export function RadioCourseNavigation({ page = 'home' }: { page?: RadioNavPageId }) {
  const t = useTranslations('RadioCourse');
  const locale = useLocale();
  const router = useRouter();
  const activeGroup = radioNavGroupOf(page) ?? 'learn';
  const labelOf = (item: RadioNavItem) => item.label ?? t(`pages.${item.id}.title`);
  const allItems = RADIO_NAV_GROUPS.flatMap((group) => group.items);

  const handleMobileChange = (id: string) => {
    const item = allItems.find((entry) => entry.id === id);
    router.push(`/${locale}${item ? item.path : radioCoursePath}`);
  };

  return (
    <aside className={styles.sidebar} data-testid="radio-sidebar">
      <div className={styles.desktopNavigation}>
        <Link
          href={`/${locale}${radioCoursePath}`}
          className={styles.navHome}
          aria-current={page === 'home' ? 'page' : undefined}
        >
          <span>Radioaficionado</span>
          <small>{t('backToCourse')}</small>
        </Link>
        <nav aria-label={t('navigation')} className={styles.navGroups}>
          {RADIO_NAV_GROUPS.map((group) => (
            <details key={group.id} className={styles.navSection} data-tone={group.id} open={group.id === activeGroup}>
              <summary>
                <span className={styles.navSectionTitle}>{group.title}</span>
                <span className={styles.navSectionHint}>{group.hint}</span>
              </summary>
              <div className={styles.navItems}>
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${locale}${item.path}`}
                    prefetch={false}
                    aria-current={page === item.id ? 'page' : undefined}
                  >
                    {item.marker ? <span className={styles.navMarker}>{item.marker}</span> : null}
                    <span>{labelOf(item)}</span>
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </nav>
        <RadioOfflineButton />
      </div>
      <div className={styles.mobileNavigation}>
        <label htmlFor="radio-course-topic">{t('jump')}</label>
        <Select
          id="radio-course-topic"
          virtual={false}
          value={page === 'home' ? '' : page}
          aria-label={t('jump')}
          onChange={handleMobileChange}
          options={[
            { value: '', label: t('backToCourse') },
            ...RADIO_NAV_GROUPS.map((group) => ({
              label: group.title,
              options: group.items.map((item) => ({
                value: item.id,
                label: item.marker ? `${item.marker} · ${labelOf(item)}` : labelOf(item),
              })),
            })),
          ]}
        />
        {page === 'home' ? <RadioOfflineButton /> : null}
      </div>
    </aside>
  );
}
