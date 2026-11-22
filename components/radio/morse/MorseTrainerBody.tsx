'use client';

import { MorseKeypad } from '../MorseKeypad';
import { SendPractice } from '../widgets/SendPractice';
import { Widget } from '../widgets/Widget';
import { TreeExplorer } from './TreeExplorer';
import { TreeRecognize } from './TreeRecognize';

/** The interactive part of each trainer page. */
export function MorseTrainerBody({ slug }: { slug: string }) {
  switch (slug) {
    case 'arbol': return <TreeExplorer />;
    case 'reconocer': return <TreeRecognize />;
    case 'transmitir': return <SendPractice />;
    case 'koch': return <Widget name="koch" />;
    case 'alfabeto': return <MorseKeypad />;
    case 'traductor': return <Widget name="morse" />;
    default: return null;
  }
}
