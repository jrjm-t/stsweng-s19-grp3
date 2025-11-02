import { inventoryApi } from "./db.api";

// prevent Jest from crashing when it sees '\
// import.meta.env' which only Vite understands
jest.mock("./index", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from "./index";
const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

// MOCKS FOR SUPABASE CHAINS

// mock getItems() call
// .from("items").select(...).order("name")
const mockOrder = jest.fn();
const mockSelect = jest.fn(() => ({ order: mockOrder }));

// mock getExpiredItems() call
// .from("item_stocks").select().not().lt().eq().order()
const mockOrderExpired = jest.fn();
const mockEqExpired = jest.fn(() => ({ order: mockOrderExpired }));
const mockLtExpired = jest.fn(() => ({ eq: mockEqExpired }));
const mockNotExpired = jest.fn(() => ({ lt: mockLtExpired }));
const mockSelectExpired = jest.fn(() => ({ not: mockNotExpired }));

describe("inventoryApi - Cost Tracking", () => {
  beforeEach(() => {
    mockOrder.mockClear();
    mockSelect.mockClear();
    mockOrderExpired.mockClear();
    mockEqExpired.mockClear();
    mockLtExpired.mockClear();
    mockNotExpired.mockClear();
    mockSelectExpired.mockClear();
    (mockedSupabase.from as jest.Mock).mockClear();
  });

  describe("getFinancialSummary", () => {
    it("should correctly calculate total inventory and expiration value", async () => {

      const mockActiveStocks = [
        {
          name: "Item 1",
          item_stocks: [
            { item_qty: 10, unit_price: 5.0, is_deleted: false }, // value is 50 since 10 x 5
            { item_qty: 20, unit_price: 2.5, is_deleted: false }, // value is 50 since 20 x 2.5
          ],
        },
        {
          name: "Item 2",
          item_stocks: [
            { item_qty: 5, unit_price: null, is_deleted: false }, // value is 0 since unit_price is null
          ],
        },
      ];
      
      const mockExpiredStocks = [
        { item_qty: 5, unit_price: 10.0 },  // value is 50 since 5 x 10
        { item_qty: 1, unit_price: 15.75 }, // value is 15.75 since 1 x 15.75
      ];

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelect,
      });
      mockOrder.mockResolvedValueOnce({ data: mockActiveStocks, error: null });

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectExpired,
      });
      mockOrderExpired.mockResolvedValueOnce({
        data: mockExpiredStocks,
        error: null,
      });

      const summary = await inventoryApi.getFinancialSummary();

      expect(summary.totalInventoryValue).toBe("100.00"); // total of 100 since 50 + 50 + 0 from active stocks
      expect(summary.totalExpirationValue).toBe("65.75"); // total of 65.75 since 50 + 15.75 from expired stocks
    });

    it("should return 0 for all values when there are no items", async () => {
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelect,
      });
      mockOrder.mockResolvedValueOnce({ data: [], error: null });

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectExpired,
      });
      mockOrderExpired.mockResolvedValueOnce({ data: [], error: null });

      const summary = await inventoryApi.getFinancialSummary();

      expect(summary.totalInventoryValue).toBe("0.00");  // no active stocks
      expect(summary.totalExpirationValue).toBe("0.00"); // no expired stocks
    });
  });

  describe('negative price validation', () => {
    it('should throw an error if createItem is called with a negative unitPrice', async () => {
      const badItem = {
        name: 'Bad Item',
        initialStock: {
          lotId: 'L1',
          quantity: 10,
          userId: 'U1',
          unitPrice: -5.00,
        },
      };

      await expect(inventoryApi.createItem(badItem as any)).rejects.toThrow('initialStock.unitPrice must be >= 0');
    });

    it('should throw an error if updateItemStockDetails is called with a negative unitPrice', async () => {
      const badUpdate = {
        itemId: 'I1',
        oldLotId: 'L1',
        unitPrice: -10.00,
        userId: 'U1',
      };

      await expect(inventoryApi.updateItemStockDetails(badUpdate as any)).rejects.toThrow('unitPrice must be >= 0');
    });
  });
});