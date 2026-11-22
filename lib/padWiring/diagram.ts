import type { SolderWire } from './assembly.ts';

/**
 * A wiring drawing for one module: the ESP32 board, the real parts, and a wire
 * for every joint. Coordinates use one frame for every module: the ESP32 sits on
 * the left and its used header (J1 or J3) faces right at x = HEADER_X. Modules
 * on J1 are mirrored at render time so the wires leave from the correct side.
 */
export type Rail = '5V' | '3V3' | 'GND';
export type SymbolKind = 'res' | 'diode' | 'switch' | 'cap';
export type PartArt =
  | 'tft' | 'matrix' | 'button' | 'ky040' | 'hw504' | 'max98357' | 'neopixel4'
  | 'speaker' | 'cells' | 'charger' | 'buck' | 'switch';

export interface InlineSymbol { sym: SymbolKind; label: string }

/** A pin on a part. `side` is the edge the lead leaves from; `at` is the offset along that edge. */
export interface DiagramPin {
  id: string;
  label: string;
  side: 'in' | 'out' | 'bottom';
  at: number;
  /** wireKey() of the joint this pin belongs to; '' for context parts that are not a joint */
  key: string;
}

export interface DiagramCard {
  id: string;
  /** message key under Assembly.part */
  title: string;
  art: PartArt;
  x: number;
  y: number;
  w: number;
  h: number;
  pins: DiagramPin[];
  /** context part drawn dashed: not soldered in this module */
  ghost?: boolean;
}

export interface Tap { dx: number; dy: number; text: string; rail: Rail; shunt?: InlineSymbol }

export type DiagramLink =
  /** ESP32 header pin → one or more part pins (more than one = shared bus) */
  | { kind: 'esp'; key: string; pos: number; to: string[]; inline?: InlineSymbol; taps?: Tap[]; end?: { x: number; text: string; rail: Rail } }
  /** part pin → labelled rail/net tag */
  | { kind: 'tag'; key: string; from: string; text: string; rail?: Rail; nc?: boolean; inline?: InlineSymbol; shunt?: InlineSymbol; len?: number; warn?: boolean }
  /** part pin → part pin, through optional corner points */
  | { kind: 'wire'; key: string; from: string; to: string; via?: Array<[number, number]>; inline?: InlineSymbol; rail?: Rail }
  /** several pins joined on one horizontal bus that ends in a tag */
  | { kind: 'bus'; key: string; pins: string[]; y: number; endX: number; text: string; rail: Rail; inline?: InlineSymbol; shunt?: InlineSymbol };

export interface ModuleDiagram {
  header: 'J1' | 'J3';
  cards: DiagramCard[];
  links: DiagramLink[];
  /** message key under Assembly for a short caption drawn on the canvas */
  caption?: string;
}

export const DIAGRAM_W = 860;
export const DIAGRAM_H = 470;
export const BOARD_W = 150;
export const HEADER_X = 164;
export const PIN_PITCH = 18;
export const PIN_TOP = 50;

export const pinY = (pos: number) => PIN_TOP + (pos - 1) * PIN_PITCH;

/**
 * Stable, locale-free key for a joint inside its module: the guide pin plus how
 * many times that pin already appeared ("SD#0" = left amp, "SD#1" = right amp).
 */
export function wireKeys(wires: SolderWire[]): Map<string, SolderWire> {
  const seen = new Map<string, number>();
  const out = new Map<string, SolderWire>();
  for (const wire of wires) {
    const n = seen.get(wire.pin) ?? 0;
    seen.set(wire.pin, n + 1);
    out.set(`${wire.pin}#${n}`, wire);
  }
  return out;
}

/** Every joint key a diagram draws. Used by the self-test: a drawing may never drop a joint. */
export function diagramKeys(diagram: ModuleDiagram): Set<string> {
  const keys = new Set<string>();
  diagram.cards.forEach(card => card.pins.forEach(pin => { if (pin.key) keys.add(pin.key); }));
  diagram.links.forEach(link => keys.add(link.key));
  return keys;
}
