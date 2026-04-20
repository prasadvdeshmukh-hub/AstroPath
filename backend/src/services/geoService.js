'use strict';

// Geo service: India pincode / state / city master.
//
// Loads a curated India Post pincode CSV on startup and builds in-memory
// indexes for O(1) lookup. The CSV lives at `backend/src/data/pincodes.csv`
// with columns: pincode,office,district,state.
//
// In production you can drop the full ~150K row India Post dataset at the
// same path and the loader will handle it without code changes (startup
// cost is one-time; lookups stay constant-time).
//
// Exposed API:
//   loadOnce()           — idempotent loader; safe to call many times.
//   lookupPincode(code)  — { pincode, office, district, state, cities[] } | null
//   listStates()         — [ 'Delhi', 'Maharashtra', ... ] sorted
//   listCities(state)    — [ 'Mumbai', 'Pune', ... ] sorted, de-duped
//   listDistricts(state) — [ 'Pune', 'Mumbai', ... ]
//   allCountries()       — [ { code: 'IN', name: 'India' } ]  (India-only by product decision)

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'data', 'pincodes.csv');

let loaded = false;
let rows = []; // { pincode, office, district, state }
const pincodeIndex = new Map(); // pincode → row
const stateToCities = new Map(); // state → Set(cities)
const stateToDistricts = new Map(); // state → Set(districts)
const statesSet = new Set();

function splitCsvLine(line) {
  // Our CSV is simple (no quoted commas), so a plain split is safe.
  // If the full India Post dataset (which *can* contain quotes) is ever
  // dropped in, upgrade to a real CSV parser.
  return line.split(',').map((s) => s.trim());
}

function loadOnce() {
  if (loaded) return;
  loaded = true;

  if (!fs.existsSync(CSV_PATH)) {
    // eslint-disable-next-line no-console
    console.warn('[geoService] pincodes.csv missing at', CSV_PATH);
    return;
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = raw.split(/\r?\n/);
  if (lines.length === 0) return;

  // Header: pincode,office,district,state
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const colIdx = {
    pincode: header.indexOf('pincode'),
    office: header.indexOf('office'),
    district: header.indexOf('district'),
    state: header.indexOf('state'),
  };

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const parts = splitCsvLine(line);
    const pincode = parts[colIdx.pincode];
    const office = parts[colIdx.office];
    const district = parts[colIdx.district];
    const state = parts[colIdx.state];
    if (!pincode || !state) continue;

    const row = {
      pincode: String(pincode).trim(),
      office: String(office || '').trim(),
      district: String(district || '').trim(),
      state: String(state).trim(),
    };
    rows.push(row);

    // First occurrence wins (head office for that code usually appears first).
    if (!pincodeIndex.has(row.pincode)) pincodeIndex.set(row.pincode, row);

    statesSet.add(row.state);

    if (!stateToCities.has(row.state)) stateToCities.set(row.state, new Set());
    if (!stateToDistricts.has(row.state)) stateToDistricts.set(row.state, new Set());

    // Treat district as the canonical "city" for onboarding. It matches how
    // most users describe their city (e.g. Pune, Mumbai, Bengaluru Urban).
    if (row.district) stateToCities.get(row.state).add(row.district);
    if (row.district) stateToDistricts.get(row.state).add(row.district);
  }

  // eslint-disable-next-line no-console
  console.log(
    `[geoService] loaded ${rows.length} pincodes across ${statesSet.size} states`
  );
}

function lookupPincode(code) {
  loadOnce();
  const key = String(code || '').trim();
  if (!/^\d{6}$/.test(key)) return null;
  const row = pincodeIndex.get(key);
  if (!row) return null;
  const cities = Array.from(stateToCities.get(row.state) || []).sort();
  return { ...row, cities };
}

function listStates() {
  loadOnce();
  return Array.from(statesSet).sort();
}

function listCities(state) {
  loadOnce();
  const set = stateToCities.get(state);
  if (!set) return [];
  return Array.from(set).sort();
}

function listDistricts(state) {
  loadOnce();
  const set = stateToDistricts.get(state);
  if (!set) return [];
  return Array.from(set).sort();
}

function allCountries() {
  // Product decision (2026-04-20): India-only onboarding.
  return [{ code: 'IN', name: 'India' }];
}

module.exports = {
  loadOnce,
  lookupPincode,
  listStates,
  listCities,
  listDistricts,
  allCountries,
};
