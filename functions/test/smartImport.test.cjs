const test = require('node:test');
const assert = require('node:assert/strict');
const { parseSmartImportResponse } = require('../lib/smartImport');

test('parses and normalizes structured travel activities', () => {
  const result = parseSmartImportResponse(JSON.stringify({
    activities: [
      {
        date: '2026-09-20',
        time: '10:30',
        title: 'Llegada en tren',
        description: 'Presentarse en el andén 4.',
        location: 'Estación central',
        type: 'Transportation',
      },
    ],
  }));

  assert.deepEqual(result.activities, [
    {
      date: '2026-09-20',
      time: '10:30',
      title: 'Llegada en tren',
      description: 'Presentarse en el andén 4.',
      location: 'Estación central',
      type: 'Transportation',
    },
  ]);
});

test('rejects malformed or empty model output', () => {
  assert.throws(() => parseSmartImportResponse('{"activities":[]}'), /no contiene actividades/i);
  assert.throws(() => parseSmartImportResponse('not-json'), /JSON válido/i);
});
