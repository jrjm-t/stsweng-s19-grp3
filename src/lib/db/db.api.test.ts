import { inventoryApi, supplierApi } from "./db.api";

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

// @ts-nocheck
// TDD tests for Supplier Management - these will fail until implementation exists

// ADDITIONAL MOCKS FOR SUPPLIER CHAINS
const mockOrderSup = jest.fn();
const mockEqSup = jest.fn();
const mockIlikeSup = jest.fn();
const mockInsertSup = jest.fn();
const mockUpdateSup = jest.fn();
const mockDeleteSup = jest.fn();
const mockSelectSup = jest.fn(() => ({
  order: mockOrderSup,
  eq: mockEqSup,
  ilike: mockIlikeSup,
}));

describe("supplierApi - Supplier Management", () => {
  beforeEach(() => {
    mockOrder.mockClear();
    mockSelect.mockClear();
    mockOrderExpired.mockClear();
    mockEqExpired.mockClear();
    mockLtExpired.mockClear();
    mockNotExpired.mockClear();
    mockSelectExpired.mockClear();
    
    mockOrderSup.mockClear();
    mockEqSup.mockClear();
    mockIlikeSup.mockClear();
    mockInsertSup.mockClear();
    mockUpdateSup.mockClear();
    mockDeleteSup.mockClear();
    mockSelectSup.mockClear();
    
    (mockedSupabase.from as jest.Mock).mockClear();
  });

  describe("CREATE - Add New Supplier", () => {
    it("should create supplier successfully with valid input", async () => {
      const supplierInput = {
        name: "ABC Medical Supplies",
        remarks: "quick to deliver",
        phone: "+1234567890",
        email: "contact@abcmedical.com"
      };

      // Mock name uniqueness check (no existing supplier)
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockResolvedValueOnce({ data: null, error: null });

      // Mock successful insert
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsertSup,
      });
      mockInsertSup.mockResolvedValueOnce({
        data: [{ id: "sup-1", ...supplierInput }],
        error: null,
      });

      const result = await supplierApi.createSupplier(supplierInput);

      expect(result).toBeDefined();
      expect(result.name).toBe("ABC Medical Supplies");
      expect(mockedSupabase.from).toHaveBeenCalledWith("suppliers");
    });

    it("should reject when name is missing or blank", async () => {
      await expect(supplierApi.createSupplier({ name: "" }))
        .rejects.toThrow("Supplier name is required");
        
      await expect(supplierApi.createSupplier({ name: "   " }))
        .rejects.toThrow("Supplier name is required");
    });

    it("should reject duplicate supplier names", async () => {
      const supplierInput = { name: "Existing Supplier" };

      // Mock existing supplier found
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockResolvedValueOnce({
        data: [{ id: "existing-1", name: "Existing Supplier" }],
        error: null,
      });

      await expect(supplierApi.createSupplier(supplierInput))
        .rejects.toThrow("Supplier name must be unique");
    });

    it("should reject invalid email format", async () => {
      const supplierInput = {
        name: "Test Supplier",
        email: "invalid-email"
      };

      await expect(supplierApi.createSupplier(supplierInput))
        .rejects.toThrow("Email is invalid");
    });

    it("should allow supplier with no items", async () => {
      const supplierInput = { name: "Standalone Supplier" };

      // Mock name uniqueness check
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockResolvedValueOnce({ data: null, error: null });

      // Mock successful insert
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsertSup,
      });
      mockInsertSup.mockResolvedValueOnce({
        data: [{ id: "sup-2", name: "Standalone Supplier" }],
        error: null,
      });

      const result = await supplierApi.createSupplier(supplierInput);
      expect(result.name).toBe("Standalone Supplier");
    });

    it("should reject invalid email format", async () => {
      const adminUser = { role: "admin" };
      const supplierInput = {
        name: "Test Supplier",
        email: "invalid-email"
      };

      await expect(supplierApi.createSupplier(adminUser, supplierInput))
        .rejects.toThrow("Email is invalid");
    });

    it("should allow supplier with no items", async () => {
      const adminUser = { role: "admin" };
      const supplierInput = { name: "Standalone Supplier" };

      // Mock name uniqueness check
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockResolvedValueOnce({ data: null, error: null });

      // Mock successful insert
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsertSup,
      });
      mockInsertSup.mockResolvedValueOnce({
        data: [{ id: "sup-2", name: "Standalone Supplier" }],
        error: null,
      });

      const result = await supplierApi.createSupplier(supplierInput);
      expect(result.name).toBe("Standalone Supplier");
    });

  });

  describe("UPDATE - Edit Supplier", () => {
    it("should update supplier remarks/phone/email", async () => {
      const supplierId = "sup-1";
      const updateData = {
        remarks: "slow delivery",
        phone: "+0987654321",
        email: "new@supplier.com"
      };

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        update: mockUpdateSup,
      });
      mockUpdateSup.mockReturnValueOnce({ eq: mockEqSup });
      mockEqSup.mockResolvedValueOnce({
        data: [{ id: supplierId, ...updateData }],
        error: null,
      });

      const result = await supplierApi.updateSupplier(supplierId, updateData);
      
      expect(result.remarks).toBe("slow delivery");
      expect(mockUpdateSup).toHaveBeenCalledWith(updateData);
      expect(mockEqSup).toHaveBeenCalledWith("id", supplierId);
    });

    it("should reject changing name to duplicate", async () => {
      const supplierId = "sup-1";
      const updateData = { name: "Existing Name" };

      // Mock duplicate name check
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockResolvedValueOnce({
        data: [{ id: "different-id", name: "Existing Name" }],
        error: null,
      });

      await expect(supplierApi.updateSupplier(supplierId, updateData))
        .rejects.toThrow("Supplier name must be unique");
    });

    it("should reject invalid email format", async () => {
      const updateData = { email: "bad@email" };

      await expect(supplierApi.updateSupplier("sup-1", updateData))
        .rejects.toThrow("Email is invalid");
    });
  });

  describe("DELETE - Remove Supplier (Hard Delete)", () => {
    it("should hard delete existing supplier", async () => {
      const supplierId = "sup-1";

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        delete: mockDeleteSup,
      });
      mockDeleteSup.mockReturnValueOnce({ eq: mockEqSup });
      mockEqSup.mockResolvedValueOnce({ data: null, error: null });

      await supplierApi.deleteSupplier(supplierId);

      expect(mockDeleteSup).toHaveBeenCalled();
      expect(mockEqSup).toHaveBeenCalledWith("id", supplierId);
    });

    it("should work even if supplier has no items", async () => {
      const supplierId = "sup-orphan";

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        delete: mockDeleteSup,
      });
      mockDeleteSup.mockReturnValueOnce({ eq: mockEqSup });
      mockEqSup.mockResolvedValueOnce({ data: null, error: null });

      await expect(supplierApi.deleteSupplier(supplierId))
        .resolves.not.toThrow();
    });
  });

    it("should reject invalid email format", async () => {
      const adminUser = { role: "admin" };
      const updateData = { email: "bad@email" };

      await expect(supplierApi.updateSupplier(adminUser, "sup-1", updateData))
        .rejects.toThrow("Email is invalid");
    });

  describe("DELETE - Remove Supplier (Hard Delete)", () => {
    it("should hard delete existing supplier for admin", async () => {
      const adminUser = { role: "admin" };
      const supplierId = "sup-1";

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        delete: mockDeleteSup,
      });
      mockDeleteSup.mockReturnValueOnce({ eq: mockEqSup });
      mockEqSup.mockResolvedValueOnce({ data: null, error: null });

      await supplierApi.deleteSupplier(adminUser, supplierId);

      expect(mockDeleteSup).toHaveBeenCalled();
      expect(mockEqSup).toHaveBeenCalledWith("id", supplierId);
    });

    it("should reject non-admin users", async () => {
      const regularUser = { role: "user" };

      await expect(supplierApi.deleteSupplier(regularUser, "sup-1"))
        .rejects.toThrow("Forbidden: admin only");
    });

    it("should work even if supplier has no items", async () => {
      const adminUser = { role: "admin" };
      const supplierId = "sup-orphan";

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        delete: mockDeleteSup,
      });
      mockDeleteSup.mockReturnValueOnce({ eq: mockEqSup });
      mockEqSup.mockResolvedValueOnce({ data: null, error: null });

      await expect(supplierApi.deleteSupplier(adminUser, supplierId))
        .resolves.not.toThrow();
    });

  });

  describe("GET - Correct Fetching of Data", () => {
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
      expect(mockOrderSup).toHaveBeenCalledWith("name");
    });

    it("should return empty array when no suppliers exist", async () => {
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockOrderSup.mockResolvedValueOnce({ data: [], error: null });

      const result = await supplierApi.getSuppliers();

      expect(result).toEqual([]);
    });

    it("should return supplier by ID or null", async () => {
      const mockSupplier = { id: "sup-1", name: "Test Supplier" };

      // Test found case
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockResolvedValueOnce({
        data: [mockSupplier],
        error: null,
      });

      const result = await supplierApi.getSupplierById("sup-1");
      expect(result).toEqual(mockSupplier);

      // Test not found case
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockResolvedValueOnce({ data: [], error: null });

      const nullResult = await supplierApi.getSupplierById("nonexistent");
      expect(nullResult).toBeNull();
    });
  });

  describe("FILTER - Filter Suppliers (List)", () => {
    it("should filter by nameContains using substring search", async () => {
      const mockFilteredSuppliers = [
        { id: "sup-1", name: "Medical Supply Co", remarks: "fast" },
      ];

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockIlikeSup.mockResolvedValueOnce({
        data: mockFilteredSuppliers,
        error: null,
      });

      const result = await supplierApi.filterSuppliers({ nameContains: "Medical" });

      expect(result).toEqual(mockFilteredSuppliers);
      expect(mockIlikeSup).toHaveBeenCalledWith("name", "%Medical%");
    });

    it("should filter by remarks using exact match", async () => {
      const mockFilteredSuppliers = [
        { id: "sup-2", name: "Fast Delivery Inc", remarks: "quick to deliver" },
      ];

      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockEqSup.mockResolvedValueOnce({
        data: mockFilteredSuppliers,
        error: null,
      });

      const result = await supplierApi.filterSuppliers({ remarks: "quick to deliver" });

      expect(result).toEqual(mockFilteredSuppliers);
      expect(mockEqSup).toHaveBeenCalledWith("remarks", "quick to deliver");
    });

    it("should combine multiple filters", async () => {
      const mockCombinedResults = [
        { id: "sup-3", name: "Medical Express", remarks: "fast" },
      ];

      // Mock chained filters: ilike for name, then eq for remarks
      const mockEqChained = jest.fn();
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockIlikeSup.mockReturnValueOnce({ eq: mockEqChained });
      mockEqChained.mockResolvedValueOnce({
        data: mockCombinedResults,
        error: null,
      });

      const result = await supplierApi.filterSuppliers({
        nameContains: "Medical",
        remarks: "fast"
      });

      expect(result).toEqual(mockCombinedResults);
      expect(mockIlikeSup).toHaveBeenCalledWith("name", "%Medical%");
      expect(mockEqChained).toHaveBeenCalledWith("remarks", "fast");
    });

    it("should return empty array if no matches", async () => {
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelectSup,
      });
      mockIlikeSup.mockResolvedValueOnce({ data: [], error: null });

      const result = await supplierApi.filterSuppliers({ nameContains: "NonExistent" });

      expect(result).toEqual([]);
    });

  });
});