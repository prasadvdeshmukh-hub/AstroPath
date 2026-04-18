'use strict';

const { nakshatraInfo, NAKSHATRA_SPAN } = require('./nakshatra');

const PERIOD_YEARS = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

const ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

function computeAntardashas(lordIdx, mahaDashaStartMs, mahaDashaYears) {
  const antardashas = [];
  let antIdx = lordIdx;
  let cursorMs = mahaDashaStartMs;

  for (let i = 0; i < 9; i++) {
    const antPlanet = ORDER[antIdx];
    const antYears = (mahaDashaYears * PERIOD_YEARS[antPlanet]) / 120;
    const antStartMs = cursorMs;
    const antEndMs = antStartMs + antYears * 365.25 * 86400 * 1000;

    antardashas.push({
      planet: antPlanet,
      startedOn: new Date(antStartMs).toISOString().slice(0, 10),
      endsOn: new Date(antEndMs).toISOString().slice(0, 10),
      totalYears: Number(antYears.toFixed(3)),
    });

    cursorMs = antEndMs;
    antIdx = (antIdx + 1) % 9;
  }

  return antardashas;
}

function buildDasha(birthDateIso, moonSiderealDeg) {
  const nak = nakshatraInfo(moonSiderealDeg);
  const lord = nak.lord;
  const period = PERIOD_YEARS[lord];
  const fractionElapsed = nak.offsetInNakshatra / NAKSHATRA_SPAN;
  const balanceYears = (1 - fractionElapsed) * period;

  const birth = new Date(birthDateIso);
  const birthMs = birth.getTime();

  const timeline = [];
  let cursor = new Date(birth.getTime());
  let idx = ORDER.indexOf(lord);
  const firstStart = new Date(cursor.getTime());
  const firstEnd = new Date(cursor.getTime() + balanceYears * 365.25 * 86400 * 1000);
  timeline.push({
    planet: lord,
    startedOn: firstStart.toISOString().slice(0, 10),
    endsOn: firstEnd.toISOString().slice(0, 10),
    totalYears: Number(period.toFixed(2)),
    balanceYears: Number(balanceYears.toFixed(3)),
    startMs: firstStart.getTime(),
    endMs: firstEnd.getTime(),
    lordIdx: idx,
  });
  cursor = firstEnd;

  for (let i = 1; i <= 8; i++) {
    idx = (idx + 1) % 9;
    const planet = ORDER[idx];
    const years = PERIOD_YEARS[planet];
    const start = new Date(cursor.getTime());
    const end = new Date(cursor.getTime() + years * 365.25 * 86400 * 1000);
    timeline.push({
      planet,
      startedOn: start.toISOString().slice(0, 10),
      endsOn: end.toISOString().slice(0, 10),
      totalYears: years,
      startMs: start.getTime(),
      endMs: end.getTime(),
      lordIdx: idx,
    });
    cursor = end;
  }

  const firstMahaDasha = timeline[0];
  const currentAntardashas = computeAntardashas(
    firstMahaDasha.lordIdx,
    birthMs,
    firstMahaDasha.balanceYears
  );

  const current = {
    planet: firstMahaDasha.planet,
    startedOn: firstMahaDasha.startedOn,
    endsOn: firstMahaDasha.endsOn,
    totalYears: firstMahaDasha.totalYears,
    balanceYears: firstMahaDasha.balanceYears,
    antardashas: currentAntardashas,
  };

  const upcoming = timeline.slice(1).map((maha) => {
    const allAntardashas = computeAntardashas(
      maha.lordIdx,
      maha.startMs,
      maha.totalYears
    );
    return {
      planet: maha.planet,
      endsOn: maha.endsOn,
      totalYears: maha.totalYears,
      antardashas: allAntardashas,
    };
  });

  const currentAntardasha = currentAntardashas.length > 0
    ? currentAntardashas[0]
    : null;

  return { current, upcoming, currentAntardasha };
}

module.exports = { PERIOD_YEARS, ORDER, buildDasha };
