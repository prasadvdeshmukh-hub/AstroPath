'use strict';

// Classical dosha detection. Inputs are the planet/house summary produced
// by kundliService (an array of { planet, house, sign, siderealLong }).
// Rules chosen are the widely-taught ones - more sophisticated traditions
// have refinements we can layer in later without breaking the contract.

const MANGLIK_HOUSES = new Set([1, 2, 4, 7, 8, 12]);

function findPlanet(positions, name) {
  return positions.find((p) => p.planet === name);
}

// Manglik: Mars occupies houses 1, 2, 4, 7, 8, or 12 from Lagna.
function detectManglik(positions) {
  const mars = findPlanet(positions, 'Mars');
  if (!mars) return { present: false, reason: 'Mars position unavailable.' };
  const present = MANGLIK_HOUSES.has(mars.house);
  return {
    present,
    reason: present
      ? `Mars is in house ${mars.house} from the Lagna, considered Manglik.`
      : `Mars is in house ${mars.house}, outside the Manglik houses.`,
  };
}

// Kaal Sarp: all seven traditional planets (Sun, Moon, Mars, Mercury, Jupiter,
// Venus, Saturn) lie on one side of the Rahu-Ketu axis along the zodiac.
// Implementation: rotate so Rahu is at 0°, then check if all 7 lie in either
// (0°, 180°) or (180°, 360°).
function detectKaalSarp(positions) {
  const rahu = findPlanet(positions, 'Rahu');
  if (!rahu) return { present: false, reason: 'Rahu position unavailable.' };
  const rahuLong = rahu.siderealLong;
  const sevenNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const sevens = sevenNames
    .map((n) => findPlanet(positions, n))
    .filter(Boolean)
    .map((p) => {
      const rel = (p.siderealLong - rahuLong + 360) % 360;
      return rel;
    });
  if (sevens.length !== 7) {
    return { present: false, reason: 'Not all classical planets available.' };
  }
  const allFirstHalf = sevens.every((x) => x > 0 && x < 180);
  const allSecondHalf = sevens.every((x) => x > 180 && x < 360);
  const present = allFirstHalf || allSecondHalf;
  return {
    present,
    reason: present
      ? 'All seven classical planets fall on one side of the Rahu-Ketu axis.'
      : 'Planets straddle the Rahu-Ketu axis; no Kaal Sarp.',
  };
}

// Pitra Dosha (simplified widely-taught form): Sun is afflicted by Rahu or
// Saturn - taken here as "within 10° of Rahu or Saturn" OR the Sun is
// placed in the 9th house with either Rahu or Saturn also in the 9th.
function detectPitra(positions) {
  const sun = findPlanet(positions, 'Sun');
  const rahu = findPlanet(positions, 'Rahu');
  const saturn = findPlanet(positions, 'Saturn');
  if (!sun || !rahu || !saturn) {
    return { present: false, reason: 'Sun/Rahu/Saturn position unavailable.' };
  }
  const sep = (a, b) => {
    const d = Math.abs(a - b) % 360;
    return Math.min(d, 360 - d);
  };
  const closeToRahu = sep(sun.siderealLong, rahu.siderealLong) <= 10;
  const closeToSaturn = sep(sun.siderealLong, saturn.siderealLong) <= 10;
  const ninthStack =
    sun.house === 9 && (rahu.house === 9 || saturn.house === 9);
  const present = closeToRahu || closeToSaturn || ninthStack;
  const parts = [];
  if (closeToRahu) parts.push('Sun within 10° of Rahu');
  if (closeToSaturn) parts.push('Sun within 10° of Saturn');
  if (ninthStack) parts.push('Sun shares the 9th house with Rahu or Saturn');
  return {
    present,
    reason: present ? parts.join('; ') : 'No classical Pitra affliction detected.',
  };
}

function detectAll(positions) {
  const manglik = detectManglik(positions);
  const kaalSarp = detectKaalSarp(positions);
  const pitra = detectPitra(positions);
  return {
    manglik: manglik.present,
    kaalSarp: kaalSarp.present,
    pitra: pitra.present,
    explanations: {
      manglik: manglik.reason,
      kaalSarp: kaalSarp.reason,
      pitra: pitra.reason,
    },
  };
}

module.exports = { detectAll, detectManglik, detectKaalSarp, detectPitra };
