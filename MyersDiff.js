/**
 * ---------------------------------------------------------------------------
 * Based on: An O(ND) Difference Algorithm and Its Variations; EUGENE W. MYERS
 * ---------------------------------------------------------------------------
 * /

/**
 * myersDiff
 * @param {String} oldText Old Text
 * @param {String} newText New Text
 */

const myersDiff = (oldText, newText) => {
  const old = oldText.split(' ');
  const actual = newText.split(' ');
  const N = old.length;
  const M = actual.length;
  const MAX = N + M;
  const trace = [];
  const V = [];
  V[1] = 0;
  for (let D = 0; D <= MAX + 1; D++) {
    if (D !== 0) {
      trace.push(copyVector(V));
    }
    for (let k = -(D - 2*Math.max(0, D-M)); k <= D - 2*Math.max(0, D-N) + 1; k = k + 2) {
      let x = 0;
      if ( k === -D || (k !== D && V[k - 1] < V[k + 1]) ) {
        x = V[k + 1];
      } else {
        x = V[k - 1] + 1;
      }
      let y = x - k;
      while (x < N && y < M && old[x] === actual[y]) {
        x = x + 1;
        y = y + 1;
      }
      V[k] = x;
      if (x >= N && y >= M) {
        trace.push(copyVector(V));
        return backTrace(old, actual, trace, D);
      }
    }
  }
};

/**
 * copyVector
 * @param {Array} V Trace
 * @returns {Array}
 */
const copyVector = V => {
  const VCopy = [];
  Object.keys(V).forEach(v => (VCopy[v] = V[v]));
  return VCopy;
};

/**
 * backTrace
 * @param {String} old Old Text
 * @param {String} actual New Text
 * @param {Array} trace Trace
 * @param {Number} distance Distance
 * @return {Array}
 */
const backTrace = (old, actual, trace, distance) => {
  const produce = [];
  if (distance === 0) {
    return produceDiff(old, actual, produce);
  }
  let x = old.length;
  let y = actual.length;
  for (let index = trace.length - 1; index > 0; index--) {
    const V = trace[index];
    const k = x - y;
    let prev_k = 1;
    let prev_x = 1;
    let prev_y = 1;
    if (k === -index || (k !== index && V[k - 1] < V[k + 1])) {
      prev_k = k + 1;
    } else {
      prev_k = k - 1;
    }
    prev_x = V[prev_k];
    prev_y = prev_x - prev_k;
    while (x > prev_x && y > prev_y) {
    produce.push([x - 1, y - 1, x, y]);  // EQU
      x = x - 1;
      y = y - 1;
    }
    if (index > 0) {
      produce.push([prev_x, prev_y, x, y]); // DIFF
    }
    x = prev_x;
    y = prev_y;
  }
  while (x > 0 && y > 0) {
    produce.push([x - 1, y - 1, x, y]);  // EQU
    x = x - 1;
    y = y - 1;
  }
  return produceDiff(old, actual, produce);
};

/**
 * produceDiff
 * @param {String} old Old Text
 * @param {String} actual New Text
 * @param {Array} produce Differences in coordinates
 * @returns {Object}
 */
const produceDiff = (old, actual, produce) => {
  const oldSet = [];
  const actualSet = [];
  let offset = 0;
  old.forEach((term, i) => {
    oldSet[i] = { text: term, offset, length: term.length, index: i };
    offset = offset + term.length + 1;
  });
  offset = 0;
  actual.forEach((term, i) => {
    actualSet[i] = { text: term, offset, length: term.length, index: i };
    offset = offset + term.length + 1;
  });
  let hasChanges = false;
  const del = [];
  const ins = [];
  if (produce.length !== 0) {
    produce.reverse();
    produce.forEach(p => {
      const [prev_x, prev_y, x, y] = p;
      if (x === prev_x) { // INS
        actualSet[prev_y].action = 'INS';
        ins.push(actualSet[prev_y]);
      } else if (y === prev_y) { // DEL
        oldSet[prev_x].action = 'DEL';
        del.push(oldSet[prev_x]);
      } else { // EQU
        actualSet[prev_y].action = 'EQU';
        oldSet[prev_x].action = 'EQU';
        ins.push(actualSet[prev_y]);
        del.push(oldSet[prev_x]);
      }
    });
    hasChanges = true;
  }
  const result = {
    hasChanges,
    newInsert: ins,
    newSet: actualSet,
    oldDelete: del,
    oldSet: oldSet,
  };
  return result;
};

export { myersDiff };
