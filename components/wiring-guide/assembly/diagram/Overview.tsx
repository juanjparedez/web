'use client';

import { useTranslations } from 'next-intl';
import type { WiringGuide } from '@/config/pinouts/wiring';
import { MAX_SD_RIGHT_RESISTOR } from '@/lib/electronics/max98357';
import { Art } from './Art';
import { Feed, Ground, OverviewCard } from './OverviewCard';
import { InlineSym, NetTag, ShuntCap } from './Symbols';
import styles from './diagram.module.css';

const V5 = 'var(--pw-role-pwr5)';
const V33 = 'var(--pw-role-pwr33)';
const R5 = 210;
const R33 = 400;
const END = 945;

/**
 * The whole PAD on one sheet: where the power comes from, the two rails, and every
 * part hanging from them. Signals are not drawn as wires here: each part lists its
 * GPIOs and opens its own module drawing.
 */
export function Overview({ guide, onOpen }: { guide: WiringGuide; onOpen: (moduleId: string) => void }) {
  const t = useTranslations('Assembly');
  const step = (id: string) => guide.modules.find(m => m.id === id)?.step;
  const gpios = (id: string) => `IO ${guide.pins.filter(p => p.mod === id).map(p => p.gpio).sort((a, b) => a - b).join('·')}`;
  const card = (id: string) => ({ step: step(id), gpios: gpios(id), onOpen: () => onOpen(id) });
  const sdR = `${MAX_SD_RIGHT_RESISTOR / 1000}kΩ`;

  return <svg viewBox="0 0 1000 550" className={`${styles.svg} ${styles.overview}`} role="img" aria-label={t('overviewTitle')}>
    {/* power source */}
    <OverviewCard x={20} y={28} w={160} h={58} title={t('part.charger')} ghost />
    <Feed d="M70,86 V110" color={V5} /><Feed d="M130,86 V110" color="var(--pw-role-gnd)" />
    <OverviewCard x={20} y={110} w={160} h={90} title={t('part.cells')} art="cells" />
    <Feed d="M70,200 V250" color={V5} />
    <InlineSym sym={{ sym: 'switch', label: 'SW1' }} x={70} y={225} color={V5} vertical />
    <Ground x={150} y={200} />
    <OverviewCard x={20} y={250} w={160} h={90} title={t('part.buck')} art="buck" />
    <Feed d="M180,280 H200 V210" color={V5} />
    <Ground x={100} y={340} />

    {/* rails */}
    <Feed d={`M200,${R5} H${END}`} color={V5} />
    <NetTag x={END + 2} y={R5} text="5V" color={V5} anchor="left" />
    <text x={206} y={R5 - 8} className="ovRail" style={{ fill: V5 }}>{t('tag.rail5v')}</text>
    <ShuntCap x={240} y={R5} label="470–1000µF" color={V5} />
    <Feed d={`M520,350 V${R33} H${END}`} color={V33} dot={[520, 350]} />
    <NetTag x={END + 2} y={R33} text="3V3" color={V33} anchor="left" />
    <text x={530} y={R33 + 18} className="ovRail" style={{ fill: V33 }}>{t('tag.rail3v3')}</text>

    {/* 5V consumers */}
    <OverviewCard x={230} y={28} w={190} h={142} title={t('part.tft')} {...card('display')}>
      <rect x={244} y={52} width={162} height={62} rx={4} className="dgGlass" />
      <InlineSym sym={{ sym: 'switch', label: '' }} x={262} y={136} color="var(--pw-role-pwm)" />
      <text x={280} y={140} className="ovSmall">SW2 · IO9 → LED</text>
    </OverviewCard>
    <Feed d={`M300,170 V${R5}`} color={V5} dot={[300, R5]} /><Ground x={400} y={170} />

    <OverviewCard x={440} y={28} w={170} h={142} title={t('part.leds')} {...card('led')}>
      <text x={452} y={68} className="ovSmall">A</text>
      <Art art="neopixel4" x={462} y={48} w={140} h={30} flip={false} />
      <text x={452} y={104} className="ovSmall">B</text>
      <Art art="neopixel4" x={462} y={84} w={140} h={30} flip={false} />
      <text x={456} y={132} className="ovSmall">A → B · 330Ω · 1N400x</text>
    </OverviewCard>
    <Feed d={`M500,170 V${R5}`} color={V5} dot={[500, R5]} />
    <InlineSym sym={{ sym: 'diode', label: '1N400x' }} x={500} y={190} color={V5} vertical dir={-1} />
    <Ground x={590} y={170} />

    {(['L', 'R'] as const).map((side, i) => {
      const x = 630 + i * 170;
      return <g key={side}>
        <OverviewCard x={x} y={28} w={150} h={142} title={t(`part.amp${side}`)} {...card('audio')}>
          <Art art="max98357" x={x + 8} y={50} w={80} h={56} flip={false} />
          <Art art="speaker" x={x + 92} y={44} w={54} h={56} flip={false} />
          <text x={x + 119} y={110} textAnchor="middle" className="ovSmall">4–8Ω</text>
          <text x={x + 10} y={128} className="ovSmall">{side === 'L' ? 'SD → Vin' : `SD → ${sdR} → Vin`}</text>
        </OverviewCard>
        <Feed d={`M${x + 30},170 V${R5}`} color={V5} dot={[x + 30, R5]} />
        <Ground x={x + 130} y={170} />
      </g>;
    })}
    <ShuntCap x={785} y={R5} label="1000µF" color={V5} />

    {/* ESP32 */}
    <OverviewCard x={300} y={250} w={250} h={100} title="ESP32-S3 DevKitC-1">
      <rect x={312} y={272} width={226} height={56} rx={4} className="dgPcb" />
      <rect x={318} y={280} width={70} height={40} rx={3} className="dgShield" />
      <text x={470} y={304} textAnchor="middle" className="ovPcbText">{t('ov.allGpio')}</text>
    </OverviewCard>
    <Feed d={`M330,${R5} V250`} color={V5} dot={[330, R5]} />
    <text x={336} y={244} className="ovSmall">5V</text>
    <text x={526} y={364} className="ovSmall">3V3</text>
    <Ground x={420} y={350} />

    {/* signal-only parts */}
    <OverviewCard x={580} y={250} w={190} h={110} title={t('part.keys')} {...card('matrix')}>
      {[0, 1].map(r => [0, 1, 2, 3, 4].map(c => <rect key={`${r}${c}`} x={600 + c * 32} y={276 + r * 30} width={24} height={24} rx={4} className="dgKey" />))}
    </OverviewCard>
    <OverviewCard x={800} y={250} w={145} h={110} title={t('part.alts')} {...card('nav')}>
      {[0, 1].map(i => <g key={i}><rect x={826 + i * 50} y={278} width={36} height={36} rx={5} className="dgPartDark" /><circle cx={844 + i * 50} cy={296} r={11} className="dgCap" /></g>)}
    </OverviewCard>
    <Ground x={935} y={360} />

    {/* 3V3 consumers */}
    <OverviewCard x={580} y={430} w={170} h={110} title={t('part.hw504')} art="hw504" {...card('stick')} />
    <Feed d={`M620,${R33} V430`} color={V33} dot={[620, R33]} />
    <text x={626} y={424} className="ovWarn">+5V → 3V3 ⚠</text>
    <Ground x={740} y={540 - 14} />
    <OverviewCard x={775} y={430} w={170} h={110} title={t('part.ky040')} art="ky040" {...card('encoder')} />
    <Feed d={`M815,${R33} V430`} color={V33} dot={[815, R33]} />

    {/* legend */}
    <g className="ovLegend">
      <Feed d="M30,420 H60" color={V5} /><text x={68} y={424}>{t('ov.legend5v')}</text>
      <Feed d="M30,446 H60" color={V33} /><text x={68} y={450}>{t('ov.legend3v3')}</text>
      <Ground x={45} y={464} /><text x={68} y={478}>{t('ov.legendGnd')}</text>
      <text x={30} y={506}>{t('ov.legendGpio')}</text>
      <text x={30} y={528}>{t('ov.legendOpen')}</text>
    </g>
  </svg>;
}
