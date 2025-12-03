import { inventoryApi, userApi, validateString, validateNumber, supplierApi } from "./db.api";

// prevent Jest from crashing when it sees '\
// import.meta.env' which only Vite understands
jest.mock("./index", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      updateUser: jest.fn(), // <--- Added for Password Change TDD
    },
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

// mocks for create/update
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEqUpdate = jest.fn();
const mockSingle = jest.fn();

// mock for .from('...').insert('...').select().single()
const mockSelectAfterInsert = jest.fn(() => ({ single: mockSingle }));
const mockInsertWithSelect = jest.fn(() => ({
  select: mockSelectAfterInsert,
}));

// mock for .from('...').update('...').eq('...')
const mockEqAfterUpdate = jest.fn();
const mockUpdateWithEq = jest.fn(() => ({ eq: mockEqAfterUpdate }));

// spy on inventoryApi.createTransaction to prevent it from running
let mockCreateTransaction: jest.SpyInstance;

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

    mockInsert.mockClear();
    mockUpdate.mockClear();
    mockEqUpdate.mockClear();
    mockSingle.mockClear();
    mockSelectAfterInsert.mockClear();
    mockInsertWithSelect.mockClear();
    mockEqAfterUpdate.mockClear();
    mockUpdateWithEq.mockClear();

    mockCreateTransaction = jest
      .spyOn(inventoryApi, "createTransaction")
      .mockResolvedValue({} as any);
  });

  afterEach(() => {
    mockCreateTransaction.mockRestore();
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

    it("should return 0.00 for items with 0 quantity", async () => {
      const mockActiveStocks = [
        {
          name: "Item 1",
          item_stocks: [{ item_qty: 0, unit_price: 50.0 }],
        },
      ];
      
      const mockExpiredStocks = [
        { item_qty: 0, unit_price: 100.0 },
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
      expect(summary.totalInventoryValue).toBe("0.00");
      expect(summary.totalExpirationValue).toBe("0.00");
    });

    it("should return 0.00 for items with 0 price", async () => {
      const mockActiveStocks = [
        {
          name: "Item 1",
          item_stocks: [{ item_qty: 10, unit_price: 0 }],
        },
      ];
      const mockExpiredStocks = [
        { item_qty: 5, unit_price: 0 },
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
      expect(summary.totalInventoryValue).toBe("0.00");
      expect(summary.totalExpirationValue).toBe("0.00");
    });
  });

  describe('item price validation', () => {
    it("createItem should set a valid unitPrice", async () => {
      const goodItem = {
        name: "Good Item",
        initialStock: {
          lotId: "L1",
          quantity: 10,
          userId: "U1",
          unitPrice: 10.5,
        },
      };

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsertWithSelect,
      });
      mockSingle.mockResolvedValueOnce({
        data: { id: "item-123", name: "Good Item" },
        error: null,
      });

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsert,
      });
      mockInsert.mockResolvedValueOnce({ error: null });

      await inventoryApi.createItem(goodItem as any);

      expect(mockedSupabase.from).toHaveBeenCalledWith("item_stocks");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          unit_price: 10.5,
          item_id: "item-123",
        })
      );
    });

    it("createItemStockForItem should set a valid unitPrice", async () => {
      const goodStock = {
        itemId: "I1",
        lotId: "L1",
        quantity: 10,
        userId: "U1",
        unitPrice: 5.25,
      };

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsert,
      });
      mockInsert.mockResolvedValueOnce({ error: null });

      await inventoryApi.createItemStockForItem(goodStock as any);

      expect(mockedSupabase.from).toHaveBeenCalledWith("item_stocks");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          unit_price: 5.25,
          item_id: "I1",
          lot_id: "L1",
        })
      );
    });

    it("updateItemStockDetails should update to a valid unitPrice", async () => {
      const goodUpdate = {
        itemId: "I1",
        oldLotId: "L1",
        unitPrice: 7.77,
        userId: "U1",
      };

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        update: mockUpdateWithEq,
      });
      mockEqAfterUpdate.mockResolvedValueOnce({ error: null });

      await inventoryApi.updateItemStockDetails(goodUpdate as any);

      expect(mockedSupabase.from).toHaveBeenCalledWith("item_stocks");
      expect(mockUpdateWithEq).toHaveBeenCalledWith(
        expect.objectContaining({
          unit_price: 7.77,
        })
      );
      expect(mockEqAfterUpdate).toHaveBeenCalledWith("lot_id", "L1");
    });

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

    it("should throw an error if createItem is called with an invalid unitPrice type", async () => {
      const badItem = {
        name: "Bad Item",
        initialStock: {
          lotId: "L1",
          quantity: 10,
          userId: "U1",
          unitPrice: "invalid-string",
        },
      };

      await expect(inventoryApi.createItem(badItem as any)).rejects.toThrow("initialStock.unitPrice must be a number");
    });

    it("should throw an error if createItemStockForItem is called with an invalid unitPrice type", async () => {
      const badStock = {
        itemId: "I1",
        lotId: "L1",
        quantity: 10,
        userId: "U1",
        unitPrice: "not-a-number",
      };

      await expect(inventoryApi.createItemStockForItem(badStock as any)).rejects.toThrow("unitPrice must be a number");
    });

    it("should throw an error if updateItemStockDetails is called with an invalid unitPrice type", async () => {
      const badUpdate = {
        itemId: "I1",
        oldLotId: "L1",
        unitPrice: "false",
        userId: "U1",
      };

      await expect(inventoryApi.updateItemStockDetails(badUpdate as any)).rejects.toThrow("unitPrice must be a number");
    });
  });
});

describe('string validation', () => {
  it('should throw an error if given an empty string', async () => {
    expect(() => validateString("", "name")).toThrow();
  });

  it('should throw an error if given a string with only spaces', async () => {
    expect(() => validateString("     ", "name")).toThrow();
  })

  it('should throw an error if value received was not a string', async () => {
    expect(() => validateString(123, "name")).toThrow();
  })

  it('should pass when given a valid string', async () => {
    expect(() => validateString("good string", "name")).not.toThrow();
  })
});

describe('number validation', () => {
  it('should throw an error when receiving a number below given range', async () => {
    expect(() => validateNumber(-1, "name", { min: 0, max: 99999 })).toThrow();
  })

  it('should throw an error when receivinga non-number like a string', async () => {
    expect(() => validateNumber("string", "name")).toThrow();
  })

  it('should throw an error when receiving a number above given range', async () => {
    expect(() => validateNumber(9001, "name", { min: 0, max: 9000 })).toThrow();
  })

  it('should accept an integer within range', async () => {
    expect(() => validateNumber(67, "name", { min: 0, max: 99999 })).not.toThrow();
  })
});

describe("change password validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("changePassword should call supabase.auth.updateUser with new password", async () => {
    //mock success response
    (mockedSupabase.auth.updateUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "123" } },
      error: null,
    });

    //api call
    const newPass = "securePass123";
    await userApi.changePassword(newPass);

    //assertion
    expect(mockedSupabase.auth.updateUser).toHaveBeenCalledWith({
      password: newPass,
    });
  });

  it("changePassword should throw error for short password", async () => {
    await expect(userApi.changePassword("123")).rejects.toThrow(
      "Password must be at least 6 characters"
    );
    expect(mockedSupabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it("changePassword should throw error if Supabase fails", async () => {
    //mock fail
    (mockedSupabase.auth.updateUser as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Weak password" },
    });

    //assert error
    await expect(userApi.changePassword("weakpass")).rejects.toThrow(
      "Weak password"
    );
  });
});

// @ts-nocheck
// TDD tests for Supplier Management - these will fail until implementation exists

// ADDITIONAL MOCKS FOR SUPPLIER CHAINS
const mockOrderSup = jest.fn();
const mockNeqSup = jest.fn();
const mockEqSup = jest.fn();
const mockIlikeSup = jest.fn();
const mockMaybeSingleSup = jest.fn();
const mockSingleSup = jest.fn();
const mockInsertSup = jest.fn();
const mockUpdateSup = jest.fn();
const mockDeleteSup = jest.fn();
const mockSelectSup = jest.fn(() => ({
  order: mockOrderSup,
  eq: mockEqSup,
  neq: mockNeqSup,
  ilike: mockIlikeSup,
  maybeSingle: mockMaybeSingleSup,
  single: mockSingleSup,
}));

describe("supplierApi - Supplier Management with Admin Auth", () => {
  beforeEach(() => {
    mockOrder.mockClear();
    mockSelect.mockClear();
    mockOrderExpired.mockClear();
    mockEqExpired.mockClear();
    mockLtExpired.mockClear();
    mockNotExpired.mockClear();
    mockSelectExpired.mockClear();
    
    mockOrderSup.mockClear();
    mockNeqSup.mockClear();
    mockEqSup.mockClear();
    mockIlikeSup.mockClear();
    mockMaybeSingleSup.mockClear();
    mockSingleSup.mockClear();
    mockInsertSup.mockClear();
    mockUpdateSup.mockClear();
    mockDeleteSup.mockClear();
    mockSelectSup.mockClear();
    
    (mockedSupabase.from as jest.Mock).mockClear();
  });

  describe("CREATE - Add New Supplier (Admin Only)", () => {
    it("should create supplier successfully when user is admin", async () => {
      const supplierInput = {
        userId: "admin-user-1",
        name: "ABC Medical Supplies",
        remarks: "quick to deliver",
        phone: "+1234567890",
        email: "contact@abcmedical.com"
      };

      // Mock admin check
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockReturnValueOnce({ single: mockSingleSup });
      mockSingleSup.mockResolvedValueOnce({
        data: { id: "admin-user-1", is_admin: true },
        error: null,
      });

      // Mock name uniqueness check
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockReturnValueOnce({ maybeSingle: mockMaybeSingleSup });
      mockMaybeSingleSup.mockResolvedValueOnce({ data: null, error: null });

      // Mock successful insert
      const mockSelectChain = jest.fn();
      const mockSingleChain = jest.fn();
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsertSup,
      });
      mockInsertSup.mockReturnValueOnce({ select: mockSelectChain });
      mockSelectChain.mockReturnValueOnce({ single: mockSingleChain });
      mockSingleChain.mockResolvedValueOnce({
        data: { id: "sup-1", name: supplierInput.name },
        error: null,
      });

      const result = await supplierApi.createSupplier(supplierInput);

      expect(result).toBeDefined();
      expect(result.name).toBe("ABC Medical Supplies");
    });

    it("should reject when user is not admin", async () => {
      const supplierInput = {
        userId: "regular-user-1",
        name: "Test Supplier",
      };

      // Mock non-admin user
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockReturnValueOnce({ single: mockSingleSup });
      mockSingleSup.mockResolvedValueOnce({
        data: { id: "regular-user-1", is_admin: false },
        error: null,
      });

      await expect(supplierApi.createSupplier(supplierInput))
        .rejects.toThrow("Forbidden");
    });

    it("should reject when name is missing or blank", async () => {
      // Mock admin check
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockReturnValueOnce({ single: mockSingleSup });
      mockSingleSup.mockResolvedValueOnce({
        data: { id: "admin-1", is_admin: true },
        error: null,
      });

      await expect(supplierApi.createSupplier({ userId: "admin-1", name: "" }))
        .rejects.toThrow();
    });

    it("should reject invalid email format", async () => {
      const supplierInput = {
        userId: "admin-1",
        name: "Test Supplier",
        email: "invalid-email"
      };

      // Mock admin check
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockReturnValueOnce({ single: mockSingleSup });
      mockSingleSup.mockResolvedValueOnce({
        data: { id: "admin-1", is_admin: true },
        error: null,
      });

      await expect(supplierApi.createSupplier(supplierInput))
        .rejects.toThrow("Email is invalid");
    });
  });

  describe("UPDATE - Edit Supplier (Admin Only)", () => {
    it("should update supplier when user is admin", async () => {
      const updateData = {
        userId: "admin-1",
        supplierId: "sup-1",
        remarks: "slow delivery",
        phone: "+0987654321",
        email: "new@supplier.com"
      };

      // Mock admin check
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockReturnValueOnce({ single: mockSingleSup });
      mockSingleSup.mockResolvedValueOnce({
        data: { id: "admin-1", is_admin: true },
        error: null,
      });

      // Mock the update chain
      const mockEqChain = jest.fn();
      const mockSelectChain = jest.fn();
      const mockSingleChain = jest.fn();
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        update: mockUpdateSup,
      });
      mockUpdateSup.mockReturnValueOnce({ eq: mockEqChain });
      mockEqChain.mockReturnValueOnce({ select: mockSelectChain });
      mockSelectChain.mockReturnValueOnce({ single: mockSingleChain });
      mockSingleChain.mockResolvedValueOnce({
        data: { id: "sup-1", remarks: "slow delivery" },
        error: null,
      });

      const result = await supplierApi.updateSupplier(updateData);
      
      expect(result.remarks).toBe("slow delivery");
    });

    it("should reject when user is not admin", async () => {
      const updateData = {
        userId: "regular-user-1",
        supplierId: "sup-1",
        name: "New Name"
      };

      // Mock non-admin user
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockReturnValueOnce({ single: mockSingleSup });
      mockSingleSup.mockResolvedValueOnce({
        data: { id: "regular-user-1", is_admin: false },
        error: null,
      });

      await expect(supplierApi.updateSupplier(updateData))
        .rejects.toThrow("Forbidden");
    });
  });

  describe("DELETE - Remove Supplier (Admin Only)", () => {
    it("should delete supplier when user is admin", async () => {
      const deleteData = {
        userId: "admin-1",
        supplierId: "sup-1"
      };

      // Mock admin check
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockReturnValueOnce({ single: mockSingleSup });
      mockSingleSup.mockResolvedValueOnce({
        data: { id: "admin-1", is_admin: true },
        error: null,
      });

      // Mock delete chain
      const mockEqChain = jest.fn();
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        delete: mockDeleteSup,
      });
      mockDeleteSup.mockReturnValueOnce({ eq: mockEqChain });
      mockEqChain.mockResolvedValueOnce({ error: null });

      await supplierApi.deleteSupplier(deleteData);

      expect(mockDeleteSup).toHaveBeenCalled();
    });

    it("should reject when user is not admin", async () => {
      const deleteData = {
        userId: "regular-user-1",
        supplierId: "sup-1"
      };

      // Mock non-admin user
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockReturnValueOnce({ single: mockSingleSup });
      mockSingleSup.mockResolvedValueOnce({
        data: { id: "regular-user-1", is_admin: false },
        error: null,
      });

      await expect(supplierApi.deleteSupplier(deleteData))
        .rejects.toThrow("Forbidden");
    });
  });

  describe("GET - Fetching Data (All Users)", () => {
    it("should return all suppliers ordered by name", async () => {
      const mockSuppliers = [
        { id: "sup-1", name: "Alpha Supplies", remarks: "fast" },
        { id: "sup-2", name: "Beta Medical", remarks: "reliable" },
      ];

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockOrderSup.mockResolvedValueOnce({
        data: mockSuppliers,
        error: null,
      });

      const result = await supplierApi.getSuppliers();

      expect(result).toEqual(mockSuppliers);
    });

    it("should return supplier by ID", async () => {
      const mockSupplier = { id: "sup-1", name: "Test Supplier" };

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockReturnValueOnce({ maybeSingle: mockMaybeSingleSup });
      mockMaybeSingleSup.mockResolvedValueOnce({
        data: mockSupplier,
        error: null,
      });

      const result = await supplierApi.getSupplierById("sup-1");
      expect(result).toEqual(mockSupplier);
    });
  });

  describe("FILTER - Filter Suppliers (All Users)", () => {
    it("should filter by nameContains", async () => {
      const mockFiltered = [
        { id: "sup-1", name: "Medical Supply Co" },
      ];

      const mockOrderChain = jest.fn();
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockIlikeSup.mockReturnValueOnce({ order: mockOrderChain });
      mockOrderChain.mockResolvedValueOnce({
        data: mockFiltered,
        error: null,
      });

      const result = await supplierApi.filterSuppliers({ nameContains: "Medical" });

      expect(result).toEqual(mockFiltered);
    });
  });
});