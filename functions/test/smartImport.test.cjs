const test = require('node:test');
const assert = require('node:assert/strict');
const { parseSmartImportResponse, validateTravelDocument } = require('../lib/smartImport');

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

test('accepts supported travel documents and rejects unsafe payloads', () => {
  assert.deepEqual(validateTravelDocument('YWJj', 'application/pdf'), { data: 'YWJj', mimeType: 'application/pdf' });
  assert.throws(() => validateTravelDocument('YWJj', 'text/html'), /no permitido/i);
  assert.throws(() => validateTravelDocument('not base64!', 'image/png'), /inválido/i);
});

test('rejects malformed or empty model output', () => {
  assert.throws(() => parseSmartImportResponse('{"activities":[]}'), /no contiene actividades/i);
  assert.throws(() => parseSmartImportResponse('not-json'), /JSON válido/i);
});

test('allows missing times but rejects activity types outside the client domain', () => {
  const result = parseSmartImportResponse(JSON.stringify({
    activities: [{ date: '2026-09-20', time: '', title: 'Día libre', type: 'Relaxation' }],
  }));
  assert.equal(result.activities[0].time, '');
  assert.throws(
    () => parseSmartImportResponse(JSON.stringify({
      activities: [{ date: '2026-09-20', time: '10:00', title: 'Evento', type: 'Unknown' }],
    })),
    /tipo inválido/i,
  );
});
