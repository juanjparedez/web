'use client';

import { useState } from 'react';

export function useDrillScore() {
  const [score, setScore] = useState({ ok: 0, tries: 0, streak: 0 });
  const record = (correct: boolean) => setScore((prev) => ({
    ok: prev.ok + (correct ? 1 : 0), tries: prev.tries + 1, streak: correct ? prev.streak + 1 : 0,
  }));
  const reset = () => setScore({ ok: 0, tries: 0, streak: 0 });
  return { ...score, record, reset };
}
