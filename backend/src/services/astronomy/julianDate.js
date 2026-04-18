'use strict';

// Julian Date computation.
// Meeus, "Astronomical Algorithms", Chapter 7.
//
// Inputs come from the user as local date/time plus a timezone offset in
// minutes (east of UTC). We convert to UT first, then to JD.

function julianDateUT(yearUT, monthUT, dayUT, hoursUT) {
  let Y = yearUT;
  let M = monthUT;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  // Gregorian calendar correction (all valid dates after 1582-10-15).
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD0 =
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    dayUT +
    B -
    1524.5;
  // Add fractional day from hours UT.
  return JD0 + hoursUT / 24;
}

// Convert ISO date (YYYY-MM-DD), time (HH:MM or HH:MM:SS), and timezone offset
// (minutes east of UTC) into a Julian Date.
function julianDateFromBirth({ birthDate, birthTime, tzOffsetMinutes }) {
  const [yStr, moStr, dStr] = birthDate.split('-');
  const year = Number(yStr);
  const month = Number(moStr);
  const day = Number(dStr);

  const timeParts = birthTime.split(':');
  const hour = Number(timeParts[0]);
  const minute = Number(timeParts[1] || 0);
  const second = Number(timeParts[2] || 0);

  // Local time in hours.
  const localHours = hour + minute / 60 + second / 3600;

  // Convert to UT by subtracting the offset (east-of-UTC is positive).
  const utHours = localHours - (tzOffsetMinutes || 0) / 60;

  // utHours might be < 0 or >= 24; build a UTC Date and re-extract.
  const ms = Date.UTC(year, month - 1, day, 0, 0, 0) + utHours * 3600 * 1000;
  const utcDate = new Date(ms);
  const Y = utcDate.getUTCFullYear();
  const M = utcDate.getUTCMonth() + 1;
  const D = utcDate.getUTCDate();
  const H =
    utcDate.getUTCHours() +
    utcDate.getUTCMinutes() / 60 +
    utcDate.getUTCSeconds() / 3600 +
    utcDate.getUTCMilliseconds() / 3_600_000;

  return julianDateUT(Y, M, D, H);
}

module.exports = { julianDateUT, julianDateFromBirth };
