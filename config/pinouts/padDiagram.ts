import { MAX_SD_RIGHT_RESISTOR } from '../../lib/electronics/max98357.ts';
import type { ModuleDiagram } from '../../lib/padWiring/diagram.ts';

/**
 * PAD drawings, one per soldering module. Pin labels are the names printed on each
 * part. Pins are drawn in the order that keeps wires from crossing, so the label,
 * not the position on the drawing, is what to match on the real part.
 * Every joint key here is checked against the guide by scripts/assembly-selftest.ts.
 */
const sdRight = `${MAX_SD_RIGHT_RESISTOR / 1000}kΩ`;

const power: ModuleDiagram = {
  header: 'J1',
  cards: [
    { id: 'sw2', title: 'sw2', art: 'switch', x: 430, y: 280, w: 110, h: 44, pins: [
      { id: 'sw2a', label: '', side: 'in', at: 22, key: 'SW2#0' },
      { id: 'sw2b', label: '', side: 'out', at: 22, key: 'SW2#0' },
    ] },
    { id: 'buck', title: 'buck', art: 'buck', x: 400, y: 360, w: 150, h: 96, pins: [
      { id: 'outp', label: 'OUT+', side: 'in', at: 30, key: '5V#0' },
      { id: 'outn', label: 'OUT−', side: 'in', at: 70, key: 'GND#0' },
      { id: 'inp', label: 'IN+', side: 'out', at: 30, key: 'SW1#0' },
      { id: 'inn', label: 'IN−', side: 'out', at: 70, key: 'GND#0' },
    ] },
    { id: 'sw1', title: 'sw1', art: 'switch', x: 596, y: 368, w: 74, h: 44, pins: [
      { id: 'sw1a', label: '', side: 'in', at: 22, key: 'SW1#0' },
      { id: 'sw1b', label: '', side: 'out', at: 22, key: 'SW1#0' },
    ] },
    { id: 'cells', title: 'cells', art: 'cells', x: 712, y: 340, w: 130, h: 116, pins: [
      { id: 'batp', label: '+', side: 'in', at: 50, key: 'SW1#0' },
      { id: 'batn', label: '−', side: 'in', at: 90, key: 'GND#0' },
    ] },
  ],
  links: [
    { kind: 'esp', key: '3V3#0', pos: 1, to: [], end: { x: 330, text: 'rail3v3', rail: '3V3' } },
    { kind: 'esp', key: 'SW2#0', pos: 15, to: ['sw2a'] },
    { kind: 'tag', key: 'SW2#0', from: 'sw2b', text: 'tftLed', rail: '5V', len: 54 },
    { kind: 'esp', key: '5V#0', pos: 21, to: ['outp'], taps: [{ dx: 120, dy: -46, text: 'rail5v', rail: '5V' }] },
    { kind: 'esp', key: 'GND#0', pos: 22, to: ['outn'], taps: [{ dx: 120, dy: 28, text: 'GND', rail: 'GND' }] },
    { kind: 'wire', key: '5V#0', from: 'outp', to: 'outn', via: [[372, 390], [372, 430]], inline: { sym: 'cap', label: '470–1000µF' }, rail: '5V' },
    { kind: 'wire', key: 'SW1#0', from: 'inp', to: 'sw1a', rail: '5V' },
    { kind: 'wire', key: 'SW1#0', from: 'sw1b', to: 'batp', rail: '5V' },
    { kind: 'wire', key: 'GND#0', from: 'inn', to: 'batn', rail: 'GND' },
  ],
};

const display: ModuleDiagram = {
  header: 'J1',
  cards: [{ id: 'tft', title: 'tft', art: 'tft', x: 390, y: 40, w: 300, h: 422, pins: [
    { id: 'led', label: 'LED', side: 'in', at: 262, key: '9#0' },
    { id: 'cs', label: 'CS', side: 'in', at: 280, key: '10#0' },
    { id: 'sdi', label: 'SDI (MOSI)', side: 'in', at: 298, key: '11#0' },
    { id: 'sck', label: 'SCK', side: 'in', at: 316, key: '12#0' },
    { id: 'dc', label: 'DC/RS', side: 'in', at: 334, key: '13#0' },
    { id: 'rst', label: 'RESET', side: 'in', at: 352, key: '14#0' },
    { id: 'vcc', label: 'VCC', side: 'in', at: 370, key: 'VCC#0' },
    { id: 'gnd', label: 'GND', side: 'in', at: 388, key: 'GND#0' },
    { id: 'sdo', label: 'SDO (MISO)', side: 'in', at: 406, key: '—#0' },
  ] }],
  links: [
    { kind: 'esp', key: '9#0', pos: 15, to: ['led'], inline: { sym: 'switch', label: 'SW2' } },
    { kind: 'esp', key: '10#0', pos: 16, to: ['cs'] },
    { kind: 'esp', key: '11#0', pos: 17, to: ['sdi'] },
    { kind: 'esp', key: '12#0', pos: 18, to: ['sck'] },
    { kind: 'esp', key: '13#0', pos: 19, to: ['dc'] },
    { kind: 'esp', key: '14#0', pos: 20, to: ['rst'] },
    { kind: 'tag', key: 'VCC#0', from: 'vcc', text: '5V', rail: '5V', warn: true },
    { kind: 'tag', key: 'GND#0', from: 'gnd', text: 'GND', rail: 'GND' },
    { kind: 'tag', key: '—#0', from: 'sdo', text: 'NC', nc: true },
  ],
};

const matrix: ModuleDiagram = {
  header: 'J1',
  caption: 'matrixBack',
  cards: [{ id: 'keys', title: 'keys', art: 'matrix', x: 360, y: 40, w: 470, h: 290, pins: [
    { id: 'f0', label: 'F0', side: 'in', at: 64, key: '4#0' },
    { id: 'f1', label: 'F1', side: 'in', at: 144, key: '5#0' },
    { id: 'c0', label: 'C0', side: 'in', at: 188, key: '6#0' },
    { id: 'c1', label: 'C1', side: 'in', at: 206, key: '7#0' },
    { id: 'c2', label: 'C2', side: 'in', at: 224, key: '15#0' },
    { id: 'c3', label: 'C3', side: 'in', at: 242, key: '16#0' },
    { id: 'c4', label: 'C4', side: 'in', at: 260, key: '17#0' },
  ] }],
  links: [
    { kind: 'esp', key: '4#0', pos: 4, to: ['f0'] },
    { kind: 'esp', key: '5#0', pos: 5, to: ['f1'] },
    { kind: 'esp', key: '6#0', pos: 6, to: ['c0'] },
    { kind: 'esp', key: '7#0', pos: 7, to: ['c1'] },
    { kind: 'esp', key: '15#0', pos: 8, to: ['c2'] },
    { kind: 'esp', key: '16#0', pos: 9, to: ['c3'] },
    { kind: 'esp', key: '17#0', pos: 10, to: ['c4'] },
  ],
};

const nav: ModuleDiagram = {
  header: 'J1',
  cards: [
    { id: 'alt1', title: 'alt1', art: 'button', x: 400, y: 170, w: 170, h: 90, pins: [
      { id: 'a1', label: '', side: 'in', at: 45, key: '18#0' },
      { id: 'a1g', label: '', side: 'out', at: 45, key: '18#0' },
    ] },
    { id: 'alt2', title: 'alt2', art: 'button', x: 400, y: 290, w: 170, h: 90, pins: [
      { id: 'a2', label: '', side: 'in', at: 45, key: '8#0' },
      { id: 'a2g', label: '', side: 'out', at: 45, key: '8#0' },
    ] },
  ],
  links: [
    { kind: 'esp', key: '18#0', pos: 11, to: ['a1'] },
    { kind: 'esp', key: '8#0', pos: 12, to: ['a2'] },
    { kind: 'tag', key: '18#0', from: 'a1g', text: 'GND', rail: 'GND' },
    { kind: 'tag', key: '8#0', from: 'a2g', text: 'GND', rail: 'GND' },
  ],
};

const encoder: ModuleDiagram = {
  header: 'J3',
  cards: [{ id: 'enc', title: 'ky040', art: 'ky040', x: 400, y: 250, w: 200, h: 140, pins: [
    { id: 'gnd', label: 'GND', side: 'in', at: 34, key: 'GND#0' },
    { id: 'vcc', label: '+', side: 'in', at: 52, key: '+#0' },
    { id: 'sw', label: 'SW', side: 'in', at: 70, key: '48#0' },
    { id: 'dt', label: 'DT', side: 'in', at: 88, key: '47#0' },
    { id: 'clk', label: 'CLK', side: 'in', at: 106, key: '21#0' },
  ] }],
  links: [
    { kind: 'esp', key: '48#0', pos: 16, to: ['sw'] },
    { kind: 'esp', key: '47#0', pos: 17, to: ['dt'] },
    { kind: 'esp', key: '21#0', pos: 18, to: ['clk'] },
    { kind: 'tag', key: '+#0', from: 'vcc', text: '3V3', rail: '3V3' },
    { kind: 'tag', key: 'GND#0', from: 'gnd', text: 'GND', rail: 'GND' },
  ],
};

const stick: ModuleDiagram = {
  header: 'J3',
  cards: [{ id: 'stick', title: 'hw504', art: 'hw504', x: 400, y: 40, w: 210, h: 150, pins: [
    { id: 'gnd', label: 'GND', side: 'in', at: 28, key: 'GND#0' },
    { id: 'vcc', label: '+5V', side: 'in', at: 46, key: '+5V#0' },
    { id: 'vrx', label: 'VRx', side: 'in', at: 64, key: '1#0' },
    { id: 'vry', label: 'VRy', side: 'in', at: 82, key: '2#0' },
    { id: 'sw', label: 'SW', side: 'in', at: 100, key: '42#0' },
  ] }],
  links: [
    { kind: 'esp', key: '1#0', pos: 4, to: ['vrx'] },
    { kind: 'esp', key: '2#0', pos: 5, to: ['vry'] },
    { kind: 'esp', key: '42#0', pos: 6, to: ['sw'] },
    { kind: 'tag', key: '+5V#0', from: 'vcc', text: '3V3', rail: '3V3', warn: true },
    { kind: 'tag', key: 'GND#0', from: 'gnd', text: 'GND', rail: 'GND' },
  ],
};

const amp = (side: 'L' | 'R', y: number): ModuleDiagram['cards'][number] => ({
  id: `amp${side}`, title: `amp${side}`, art: 'max98357', x: 420, y, w: 210, h: 160, pins: [
    { id: `bclk${side}`, label: 'BCLK', side: 'in', at: 28, key: '41#0' },
    { id: `lrc${side}`, label: 'LRC', side: 'in', at: 46, key: '40#0' },
    { id: `din${side}`, label: 'DIN', side: 'in', at: 64, key: '39#0' },
    { id: `gain${side}`, label: 'GAIN', side: 'in', at: 82, key: 'GAIN#0' },
    { id: `sd${side}`, label: 'SD', side: 'in', at: 100, key: side === 'L' ? 'SD#0' : 'SD#1' },
    { id: `gnd${side}`, label: 'GND', side: 'in', at: 118, key: 'GND#0' },
    { id: `vin${side}`, label: 'Vin', side: 'in', at: 136, key: 'Vin#0' },
    { id: `p${side}`, label: '+', side: 'out', at: 60, key: side === 'L' ? '+#0' : '+#1' },
    { id: `n${side}`, label: '−', side: 'out', at: 100, key: side === 'L' ? '−#0' : '−#1' },
  ],
});
const speaker = (side: 'L' | 'R', y: number): ModuleDiagram['cards'][number] => ({
  id: `spk${side}`, title: `speaker${side}`, art: 'speaker', x: 700, y, w: 130, h: 110, pins: [
    { id: `sp${side}`, label: '+', side: 'in', at: 30, key: side === 'L' ? '+#0' : '+#1' },
    { id: `sn${side}`, label: '−', side: 'in', at: 70, key: side === 'L' ? '−#0' : '−#1' },
  ],
});
const ampTags = (side: 'L' | 'R'): ModuleDiagram['links'] => [
  { kind: 'tag', key: 'GAIN#0', from: `gain${side}`, text: 'NC', nc: true },
  side === 'L'
    ? { kind: 'tag', key: 'SD#0', from: 'sdL', text: 'Vin', rail: '5V' }
    : { kind: 'tag', key: 'SD#1', from: 'sdR', text: 'Vin', rail: '5V', inline: { sym: 'res', label: sdRight }, len: 150 },
  { kind: 'tag', key: 'GND#0', from: `gnd${side}`, text: 'GND', rail: 'GND' },
  { kind: 'tag', key: 'Vin#0', from: `vin${side}`, text: '5V', rail: '5V', ...(side === 'L' ? { shunt: { sym: 'cap' as const, label: '1000µF' } } : {}) },
  { kind: 'wire', key: side === 'L' ? '+#0' : '+#1', from: `p${side}`, to: `sp${side}`, rail: '5V' },
  { kind: 'wire', key: side === 'L' ? '−#0' : '−#1', from: `n${side}`, to: `sn${side}`, rail: 'GND' },
];

const audio: ModuleDiagram = {
  header: 'J3',
  cards: [amp('L', 120), amp('R', 305), speaker('L', 150), speaker('R', 335)],
  links: [
    { kind: 'esp', key: '41#0', pos: 7, to: ['bclkL', 'bclkR'] },
    { kind: 'esp', key: '40#0', pos: 8, to: ['lrcL', 'lrcR'] },
    { kind: 'esp', key: '39#0', pos: 9, to: ['dinL', 'dinR'] },
    ...ampTags('L'),
    ...ampTags('R'),
  ],
};

const led: ModuleDiagram = {
  header: 'J3',
  cards: [
    { id: 'ledA', title: 'ledA', art: 'neopixel4', x: 430, y: 170, w: 190, h: 84, pins: [
      { id: 'dinA', label: 'DIN', side: 'in', at: 42, key: '38#0' },
      { id: 'doutA', label: 'DOUT', side: 'out', at: 42, key: '—#0' },
      { id: 'vA', label: '5V', side: 'bottom', at: 50, key: '5V#0' },
      { id: 'gA', label: 'GND', side: 'bottom', at: 100, key: 'GND#0' },
    ] },
    { id: 'ledB', title: 'ledB', art: 'neopixel4', x: 660, y: 170, w: 170, h: 84, pins: [
      { id: 'dinB', label: 'DIN', side: 'in', at: 42, key: '—#0' },
      { id: 'vB', label: '5V', side: 'bottom', at: 50, key: '5V#0' },
      { id: 'gB', label: 'GND', side: 'bottom', at: 100, key: 'GND#0' },
    ] },
  ],
  links: [
    { kind: 'esp', key: '38#0', pos: 10, to: ['dinA'], inline: { sym: 'res', label: '330Ω' } },
    { kind: 'wire', key: '—#0', from: 'doutA', to: 'dinB' },
    { kind: 'bus', key: '5V#0', pins: ['vA', 'vB'], y: 300, endX: 300, text: '5V', rail: '5V', inline: { sym: 'diode', label: '1N400x' } },
    { kind: 'bus', key: 'GND#0', pins: ['gA', 'gB'], y: 340, endX: 300, text: 'GND', rail: 'GND' },
  ],
};

export const PAD_DIAGRAMS: Record<string, ModuleDiagram> = { power, display, matrix, nav, encoder, stick, audio, led };

/** Guides that have drawings. Others keep the classic header map + list. */
export const MODULE_DIAGRAMS: Record<string, Record<string, ModuleDiagram>> = { pad: PAD_DIAGRAMS };
