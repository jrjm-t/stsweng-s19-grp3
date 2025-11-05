// Unit tests for notification generation logic

describe("Notification Generation Logic", () => {
  // generateExpirationAlerts: returns items that expire within `daysThreshold` days (inclusive)
  const generateExpirationAlerts = (items: { name: string; expiryDate: string | Date }[], daysThreshold: number) => {
    const now = new Date();
    return items
      .map((it) => ({ ...it, daysToExpiry: Math.ceil((new Date(it.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) }))
      .filter((it) => !isNaN(it.daysToExpiry) && it.daysToExpiry <= daysThreshold)
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  };

  // generateLowStockNotifications: returns items where qty <= threshold
  const generateLowStockNotifications = (stocks: { name: string; qty: number; reorderLevel?: number }[], threshold?: number) => {
    return stocks
      .filter(s => typeof s.qty === 'number' && s.qty <= (threshold ?? s.reorderLevel ?? 0))
      .map(s => ({ name: s.name, qty: s.qty, reorderLevel: s.reorderLevel ?? null }));
  };

  it("should generate expiration alerts for items within threshold", () => {
    const now = new Date();
    const in3 = new Date(now);
    in3.setDate(now.getDate() + 3);
    const in10 = new Date(now);
    in10.setDate(now.getDate() + 10);
    const past = new Date(now);
    past.setDate(now.getDate() - 2);

    const items = [
      { name: 'A', expiryDate: in3.toISOString() },
      { name: 'B', expiryDate: in10.toISOString() },
      { name: 'C', expiryDate: past.toISOString() }
    ];

    const alerts = generateExpirationAlerts(items, 5);
    expect(alerts.find(a => a.name === 'A')).toBeDefined();
    expect(alerts.find(a => a.name === 'C')).toBeDefined(); // already expired -> daysToExpiry negative -> included
    expect(alerts.find(a => a.name === 'B')).toBeUndefined();
    // Alerts should be ordered by daysToExpiry ascending
    expect(alerts[0].name === 'C' || alerts[0].name === 'A').toBe(true);
  });

  it("should return empty array when no items within threshold", () => {
    const now = new Date();
    const in30 = new Date(now);
    in30.setDate(now.getDate() + 30);
    const items = [{ name: 'X', expiryDate: in30.toISOString() }];

    const alerts = generateExpirationAlerts(items, 7);
    expect(Array.isArray(alerts)).toBe(true);
    expect(alerts).toHaveLength(0);
  });

  it("should handle invalid dates gracefully", () => {
    const items = [
      { name: 'Bad', expiryDate: 'invalid-date' },
      { name: 'Good', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() }
    ];

    const alerts = generateExpirationAlerts(items, 7);
    expect(alerts.some(a => a.name === 'Good')).toBe(true);
    expect(alerts.some(a => a.name === 'Bad')).toBe(false);
  });

  it("should generate low stock notifications using explicit threshold", () => {
    const stocks = [
      { name: 'Item1', qty: 2, reorderLevel: 5 },
      { name: 'Item2', qty: 10, reorderLevel: 5 },
      { name: 'Item3', qty: 5 }
    ];

    const low = generateLowStockNotifications(stocks, 5);
    expect(low.map(l => l.name).sort()).toEqual(['Item1','Item3'].sort());
  });

  it("should generate low stock notifications using reorderLevel when threshold omitted", () => {
    const stocks = [
      { name: 'Alpha', qty: 1, reorderLevel: 3 },
      { name: 'Beta', qty: 4, reorderLevel: 3 },
      { name: 'Gamma', qty: 0 }
    ];

    const low = generateLowStockNotifications(stocks);
    // Gamma has no reorderLevel; default treated as 0 so qty 0 <= 0 -> included
    expect(low.map(s => s.name).sort()).toEqual(['Alpha','Gamma'].sort());
  });

  it("should prioritize critical alerts (expired first) when sorting", () => {
    const now = new Date();
    const past = new Date(now); past.setDate(now.getDate() - 1);
    const soon = new Date(now); soon.setDate(now.getDate() + 1);
    const later = new Date(now); later.setDate(now.getDate() + 5);

    const items = [
      { name: 'Soon', expiryDate: soon.toISOString() },
      { name: 'Past', expiryDate: past.toISOString() },
      { name: 'Later', expiryDate: later.toISOString() }
    ];

    const alerts = generateExpirationAlerts(items, 10);
    // Past (expired) should come before Soon and Later
    expect(alerts[0].name).toBe('Past');
  });

  it("should batch notifications into groups of specified size", () => {
    // Example batching helper
    const batch = (arr: any[], size: number) => {
      const out = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    };

    const samples = Array.from({ length: 7 }, (_, i) => ({ id: i + 1 }));
    const grouped = batch(samples, 3);
    expect(grouped).toHaveLength(3);
    expect(grouped[0]).toHaveLength(3);
    expect(grouped[1]).toHaveLength(3);
    expect(grouped[2]).toHaveLength(1);
  });
});