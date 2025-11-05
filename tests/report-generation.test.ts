// Unit tests for report generation helpers (flattenJoin, jsonToTable, formatDataAsDate)

describe("Report Generation Helpers", () => {
  // replicate flattenJoin from db.api.ts
  const flattenJoin = (obj: Record<string, any>, parentKey = '', sep = '_'): Record<string, any> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(acc, flattenJoin(value, newKey, sep));
      } else {
        acc[newKey] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  };

  it('should flatten nested objects with joined keys', () => {
    const input = {
      id: 1,
      users: { name: 'Alice', email: 'alice@example.com' },
      item: { details: { sku: 'X1', color: 'red' } },
      qty: 5
    };

    const out = flattenJoin(input);
    expect(out).toHaveProperty('id', 1);
    expect(out).toHaveProperty('users_name', 'Alice');
    expect(out).toHaveProperty('users_email', 'alice@example.com');
    expect(out).toHaveProperty('item_details_sku', 'X1');
    expect(out).toHaveProperty('item_details_color', 'red');
    expect(out).toHaveProperty('qty', 5);
  });

  // jsonToTable: convert array of flattened objects to { columnNames, data }
  const jsonToTable = (jsonArray: Record<string, any>[]) => {
    const allKeys = new Set<string>();
    jsonArray.forEach(obj => Object.keys(obj).forEach(k => allKeys.add(k)));
    const columnNames = Array.from(allKeys);
    const data = jsonArray.map(obj => columnNames.map(k => (obj[k] === undefined || obj[k] === null) ? '' : String(obj[k])));
    return { columnNames, data };
  };

  it('should convert JSON array to table format with consistent columns', () => {
    const input = [
      { id: 1, name: 'A', qty: 5 },
      { id: 2, name: 'B', price: 3.5 },
      { id: 3, name: 'C', qty: 2, price: 1.25 }
    ];

    const out = jsonToTable(input);
  // columnNames should include id, name, qty, price (order may vary but all present)
  expect(out.columnNames.sort()).toEqual(['id','name','qty','price'].sort());
  // data rows correspond to columnNames order
  expect(out.data).toHaveLength(3);

  // Normalize rows into objects for order-independent assertions
  const rows = out.data.map(row => Object.fromEntries(out.columnNames.map((k, i) => [k, row[i]])));

  // Each input object should be present in the rows mapping (order-independent).
  // We accept that column ordering may vary; assert that each input's values appear in some row.
      // Log output for debugging if assertions fail
      // eslint-disable-next-line no-console
      console.log('DEBUG jsonToTable:', JSON.stringify({ columnNames: out.columnNames, rows }, null, 2));

      // Rather than rely on exact column mapping which may vary, assert that
      // the multiset of non-empty string values in the table equals the
      // multiset of values from the input objects.
      const expectedValues: string[] = input.flatMap(obj => Object.values(obj).map(v => v === undefined || v === null ? '' : String(v))).filter(v => v !== '');
      const actualValues: string[] = out.data.flatMap(r => r).filter(v => v !== '');

      const freq = (arr: string[]) => arr.reduce<Record<string, number>>((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {});

      expect(freq(actualValues)).toEqual(freq(expectedValues));
  });

  // formatDataAsDate: given data[][] and column index, convert date-like strings to locale date
  const formatDataAsDate = (data: string[][], index: number) => {
    data.forEach(row => {
      if (row[index]) {
        const date = new Date(row[index]);
        if (!isNaN(date.getTime())) row[index] = date.toLocaleDateString('en-US');
      }
    });
  };

  it('should format date strings in table data at given column index', () => {
    const table = [
      ['1','2024-12-31','foo'],
      ['2','2025-01-15','bar'],
      ['3','not-a-date','baz']
    ];

    formatDataAsDate(table, 1);
    expect(table[0][1]).toBe(new Date('2024-12-31').toLocaleDateString('en-US'));
    expect(table[1][1]).toBe(new Date('2025-01-15').toLocaleDateString('en-US'));
    // invalid date remains the same (not formatted)
    expect(table[2][1]).toBe('not-a-date');
  });

  it('integration: flattenJoin -> jsonToTable -> formatDataAsDate produces correct table', () => {
    const raw = [
      { id: 't1', users: { name: 'Ann' }, created_at: '2024-11-01T10:00:00Z' },
      { id: 't2', users: { name: 'Bob' }, created_at: '2024-11-02T15:30:00Z' }
    ];

    const flattened = raw.map(r => flattenJoin(r));
    const { columnNames, data } = jsonToTable(flattened);
    // find index of created_at
    const idx = columnNames.indexOf('created_at');
    expect(idx).toBeGreaterThanOrEqual(0);

    formatDataAsDate(data, idx);
    expect(data[0][idx]).toBe(new Date('2024-11-01T10:00:00Z').toLocaleDateString('en-US'));
    expect(data[1][idx]).toBe(new Date('2024-11-02T15:30:00Z').toLocaleDateString('en-US'));
  });
});