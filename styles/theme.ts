import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';
import { DEFAULT_ACCENT } from '@/lib/themes/config';
import type { SkinId } from '@/lib/themes/skins';

/**
 * Tema antd derivado del accent configurable del usuario + skin activo.
 *
 * Única fuente de verdad de color de marca: `--accent` (ThemeContext).
 * antd necesita hex reales para computar sus paletas derivadas, así que
 * `getAntdTheme` recibe el accent resuelto en vez de leer la CSS var.
 * Las paletas por skin espejan los bloques [data-skin] de globals.css —
 * si tocás una, tocá la otra.
 */

// Las fuentes llegan como CSS vars desde next/font (app/[locale]/layout.tsx).
export const FONT_SANS =
    "var(--font-sans, 'Inter'), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const FONT_MONO =
    "var(--font-mono, 'IBM Plex Mono'), ui-monospace, SFMono-Regular, Menlo, monospace";

const baseTokens = {
    fontFamily: FONT_SANS,
    fontFamilyCode: FONT_MONO,
    fontSize: 14,
    borderRadius: 10,
    borderRadiusSM: 6,
    borderRadiusLG: 18,
};

interface SkinPalette {
    bg: string;
    bgSecondary: string;
    bgElevated: string;
    text: string;
    textSecondary: string;
    border: string;
    borderSecondary: string;
}

/** Espeja los bloques [data-skin] de globals.css. */
const SKIN_PALETTES: Record<SkinId, { light: SkinPalette; dark: SkinPalette }> = {
    datasheet: {
        light: {
            bg: '#ffffff',
            bgSecondary: '#f6f7f9',
            bgElevated: '#ffffff',
            text: '#16181d',
            textSecondary: '#5c6470',
            border: 'rgba(2, 6, 23, 0.10)',
            borderSecondary: 'rgba(2, 6, 23, 0.06)',
        },
        dark: {
            bg: '#0b0e14',
            bgSecondary: '#11151d',
            bgElevated: '#151a24',
            text: '#e8eaed',
            textSecondary: '#9aa4b2',
            border: 'rgba(255, 255, 255, 0.10)',
            borderSecondary: 'rgba(255, 255, 255, 0.06)',
        },
    },
    terminal: {
        light: {
            bg: '#f7f6f1',
            bgSecondary: '#efede4',
            bgElevated: '#fbfaf6',
            text: '#1d211d',
            textSecondary: '#47513f',
            border: 'rgba(29, 33, 29, 0.16)',
            borderSecondary: 'rgba(29, 33, 29, 0.10)',
        },
        dark: {
            bg: '#050805',
            bgSecondary: '#0b120b',
            bgElevated: '#101910',
            text: '#cde5cd',
            textSecondary: '#9dbf9d',
            border: 'rgba(140, 200, 140, 0.18)',
            borderSecondary: 'rgba(140, 200, 140, 0.10)',
        },
    },
    neon: {
        light: {
            bg: '#fbf5ff',
            bgSecondary: '#f1e5fa',
            bgElevated: '#fffaff',
            text: '#281338',
            textSecondary: '#593566',
            border: '#bca0ce',
            borderSecondary: '#bca0ce',
        },
        dark: {
            bg: '#110c20',
            bgSecondary: '#23132f',
            bgElevated: '#312044',
            text: '#fcf2ff',
            textSecondary: '#e1c4ef',
            border: '#624678',
            borderSecondary: '#624678',
        },
    },
    pastel: {
        light: {
            bg: '#fff8f5',
            bgSecondary: '#f1e5ee',
            bgElevated: '#fffbfe',
            text: '#382c42',
            textSecondary: '#624961',
            border: '#c5adbf',
            borderSecondary: '#c5adbf',
        },
        dark: {
            bg: '#211d2c',
            bgSecondary: '#342a40',
            bgElevated: '#40384b',
            text: '#fbf1f7',
            textSecondary: '#dfccdd',
            border: '#64526b',
            borderSecondary: '#64526b',
        },
    },
    win98: {
        light: {
            bg: '#ced9d8',
            bgSecondary: '#d4d0c8',
            bgElevated: '#eae8e2',
            text: '#121b24',
            textSecondary: '#364550',
            border: '#747b80',
            borderSecondary: '#747b80',
        },
        dark: {
            bg: '#172729',
            bgSecondary: '#2d383b',
            bgElevated: '#394447',
            text: '#f2f5f1',
            textSecondary: '#c5d5d2',
            border: '#758681',
            borderSecondary: '#758681',
        },
    },
    blueprint: {
        light: {
            bg: '#f4f8fd',
            bgSecondary: '#e9f0fa',
            bgElevated: '#fdfeff',
            text: '#132c4e',
            textSecondary: '#3d5578',
            border: 'rgba(19, 44, 78, 0.18)',
            borderSecondary: 'rgba(19, 44, 78, 0.10)',
        },
        dark: {
            bg: '#0a1f3f',
            bgSecondary: '#10294f',
            bgElevated: '#16305a',
            text: '#eaf1fb',
            textSecondary: '#b9c9e0',
            border: 'rgba(255, 255, 255, 0.16)',
            borderSecondary: 'rgba(255, 255, 255, 0.09)',
        },
    },
};

export function getAntdTheme(
    mode: 'light' | 'dark',
    accent: string,
    skin: SkinId = 'datasheet',
): ThemeConfig {
    const dark = mode === 'dark';
    const palette = SKIN_PALETTES[skin][mode];
    const terminal = skin === 'terminal';
    return {
        // ThemeLayout hydrates with the server theme before applying preferences.
        // Separate scopes prevent extracted dark CSS from overriding live tokens.
        cssVar: { key: `hios-${mode}-${skin}-${accent.replace('#', '')}` },
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
            ...baseTokens,
            ...(terminal
                ? { fontFamily: FONT_MONO, borderRadius: 4, borderRadiusSM: 2, borderRadiusLG: 6 }
                : {}),
            ...(skin === 'win98'
                ? { fontFamily: 'Tahoma, Verdana, sans-serif', borderRadius: 0, borderRadiusSM: 0, borderRadiusLG: 0 }
                : {}),
            colorPrimary: accent,
            colorInfo: accent,
            colorLink: accent,
            colorSuccess: dark ? '#34d399' : '#0e9f6e',
            colorWarning: dark ? '#fbbf24' : '#d97706',
            colorError: dark ? '#f87171' : '#dc2626',
            colorBgContainer: palette.bgSecondary === palette.bg ? palette.bg : (dark ? palette.bgSecondary : palette.bgElevated),
            colorBgElevated: palette.bgElevated,
            colorBgLayout: dark ? palette.bg : palette.bgSecondary,
            colorText: palette.text,
            colorTextSecondary: palette.textSecondary,
            colorBorder: palette.border,
            colorBorderSecondary: palette.borderSecondary,
        },
        components: {
            Layout: {
                bodyBg: palette.bg,
                headerBg: palette.bg,
            },
            Card: {
                colorBgContainer: dark ? palette.bgSecondary : palette.bgElevated,
            },
            Button: {
                fontWeight: 600,
                controlHeight: 38,
                controlHeightLG: 46,
            },
        },
    };
}

// Legacy exports for compatibility
export const lightTheme = getAntdTheme('light', DEFAULT_ACCENT);
export const darkTheme = getAntdTheme('dark', DEFAULT_ACCENT);
export const theme = lightTheme;
