'use strict';
const { SIGNS_EN } = require('./rashi');
function signType(index) {
  if (index === 0 || index === 3 || index === 6 || index === 9) return 'movable';
  if (index === 1 || index === 4 || index === 7 || index === 10) return 'fixed';
  return 'dual';
}
function navamsaSign(siderealLongitudeDeg) {
  const n = ((siderealLongitudeDeg % 360) + 360) % 360;
  const rashiIndex = Math.floor(n / 30);
  const posInSign = n - rashiIndex * 30;
  const navamsaSize = 30 / 9;
  let partInSign = Math.trunc(posInSign / navamsaSize);
  if (partInSign < 0) partInSign = 0;
  if (partInSign > 8) partInSign = 8;
  let startOffset;
  const type = signType(rashiIndex);
  if (type === 'movable') {
    startOffset = 0;
  } else if (type === 'fixed') {
    startOffset = 8;
  } else {
    startOffset = 8;
  }
  const navamsaIndex = (rashiIndex + startOffset + partInSign) % 12;
  return {
    signIndex: navamsaIndex,
    signName: SIGNS_EN[navamsaIndex],
    partInSign: partInSign | 0,
  };
}
function dasamsaSign(siderealLongitudeDeg) {
  const n = ((siderealLongitudeDeg % 360) + 360) % 360;
  const rashiIndex = Math.floor(n / 30);
  const posInSign = n - rashiIndex * 30;
  let partInSign = Math.floor(posInSign / 3);
  if (partInSign > 9) partInSign = 9;
  let startOffset;
  if (rashiIndex % 2 === 0) {
    startOffset = 0;
  } else {
    startOffset = 8;
  }
  const dasamsaIndex = (rashiIndex + startOffset + partInSign) % 12;
  return {
    signIndex: dasamsaIndex,
    signName: SIGNS_EN[dasamsaIndex],
    partInSign,
  };
}
function computeDivisionals(siderealLongitudeDeg) {
  return {
    D9: navamsaSign(siderealLongitudeDeg),
    D10: dasamsaSign(siderealLongitudeDeg),
  };
}
module.exports = {
  navamsaSign,
  dasamsaSign,
  computeDivisionals,
};
