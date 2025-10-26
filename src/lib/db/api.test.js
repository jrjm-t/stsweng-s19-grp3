import { inventoryApi } from "./db.api.ts";
import { logger } from "../utils/console.js";
import { supabase } from "./index";

/*
export async function runInventoryApiTests() {
  logger.test("Starting Inventory API Tests");

  let itemId: string | null = null;
  let lotId: string | null = null;

  try {
    // 1. CREATE an item
    logger.info("Testing createItem...");
    const newItemData = {
      name: `Test Item ${Date.now()}`,
      initialStock: {
        quantity: 100,
        expiryDate: "2025-12-31",
      },
    };
    const createdItem = await inventoryApi.createItem(newItemData);
    itemId = createdItem.id; // Save the ID for cleanup
    logger.success("createItem SUCCESS");

    // 2. READ all items
    logger.info("Testing getItems...");
    const allItems = await inventoryApi.getItems();
    logger.success(`getItems SUCCESS - Found ${allItems.length} items`);
    if (!allItems.some((item) => item.id === itemId)) {
      throw new Error("Created item not found in getItems list!");
    }

    // 3. READ a single item
    logger.info("Testing getItem...");
    if (!itemId) throw new Error("No item ID available");
    const singleItem = await inventoryApi.getItem(itemId);
    logger.success("getItem SUCCESS");
    if (singleItem.name !== newItemData.name) {
      throw new Error("getItem returned an item with the wrong name!");
    }

    // 4. GET stock by lot ID
    logger.info("Testing getStockByLotId...");
    if (singleItem.item_stocks && singleItem.item_stocks.length > 0) {
      lotId = singleItem.item_stocks[0].lot_id;
      if (lotId) {
        const stock = await inventoryApi.getStockByLotId(lotId);
        logger.success("getStockByLotId SUCCESS");
        if (stock.item_qty !== 100) {
          throw new Error("Stock quantity mismatch!");
        }
      }
    } else {
      logger.warning("No stock found for item, skipping getStockByLotId test");
    }

    // 5. UPDATE an item
    logger.info("Testing updateItem...");
    if (!itemId) throw new Error("No item ID available");
    const updatedItemData = { name: `${newItemData.name} (Updated)` };
    const updatedItem = await inventoryApi.updateItem(itemId, updatedItemData);
    logger.success("updateItem SUCCESS");
    if (updatedItem.name !== updatedItemData.name) {
      throw new Error("updateItem did not update the name correctly!");
    }

    // 6. CREATE TRANSACTION - test all transaction types
    logger.info("Testing createTransaction (DEPOSIT)...");
    if (lotId) {
      const userId = '7b49506c-426b-42de-9d04-3ad256441cb4';

      if (!userId) {
        logger.warning("createTransaction SKIPPED: Please provide a valid user ID in the test script.");
      } else {
        // DEPOSIT: Add 50 units (should go from 100 to 150)
        await inventoryApi.createTransaction({ lotId, userId, quantity: 50, type: 'DEPOSIT' });
        let itemAfterDeposit = await inventoryApi.getItem(itemId);
        logger.success("createTransaction DEPOSIT SUCCESS");
        if (itemAfterDeposit.item_stocks[0]?.item_qty !== 150) {
          throw new Error("createTransaction (DEPOSIT) did not update the quantity correctly!");
        }

        // DISTRIBUTE: Subtract 30 units (should go from 150 to 120)
        await inventoryApi.createTransaction({ lotId, userId, quantity: 30, type: 'DISTRIBUTE' });
        let itemAfterDistribute = await inventoryApi.getItem(itemId);
        logger.success("createTransaction DISTRIBUTE SUCCESS");
        if (itemAfterDistribute.item_stocks[0]?.item_qty !== 120) {
          throw new Error("createTransaction (DISTRIBUTE) did not update the quantity correctly!");
        }

        // DISPOSE: Subtract 20 units (should go from 120 to 100)
        await inventoryApi.createTransaction({ lotId, userId, quantity: 20, type: 'DISPOSE' });
        let itemAfterDispose = await inventoryApi.getItem(itemId);
        logger.success("createTransaction DISPOSE SUCCESS");
        if (itemAfterDispose.item_stocks[0]?.item_qty !== 100) {
          throw new Error("createTransaction (DISPOSE) did not update the quantity correctly!");
        }

        // INVALID DISTRIBUTE: Try to subtract more than available (should throw)
        let distributeErrorCaught = false;
        try {
          await inventoryApi.createTransaction({ lotId, userId, quantity: 200, type: 'DISTRIBUTE' });
        } catch (err) {
          logger.success("createTransaction DISTRIBUTE (invalid) correctly rejected overdraw");
          distributeErrorCaught = true;
        }
        if (!distributeErrorCaught) {
          throw new Error("createTransaction (DISTRIBUTE invalid) did not reject overdraw!");
        }

        // INVALID DISPOSE: Try to subtract more than available (should throw)
        let disposeErrorCaught = false;
        try {
          await inventoryApi.createTransaction({ lotId, userId, quantity: 200, type: 'DISPOSE' });
        } catch (err) {
          logger.success("createTransaction DISPOSE (invalid) correctly rejected overdraw");
          disposeErrorCaught = true;
        }
        if (!disposeErrorCaught) {
          throw new Error("createTransaction (DISPOSE invalid) did not reject overdraw!");
        }
      }
    } else {
      logger.warning("createTransaction SKIPPED: No lot_id found for the created item.");
    }

    // 7. CORRECTION: Apply corrections to item stock
    logger.info("Testing updateStocks (corrections)...");
    if (lotId) {
      const userId = '7b49506c-426b-42de-9d04-3ad256441cb4';
      if (!userId) {
        logger.warning("updateStocks SKIPPED: Please provide a valid user ID in the test script.");
      } else {
        // Set stock to 999
        await inventoryApi.updateStocks(lotId, userId, 999);
        let itemAfterCorrection = await inventoryApi.getItem(itemId);
        if (itemAfterCorrection.item_stocks[0]?.item_qty !== 999) {
          throw new Error("updateStocks did not set the quantity correctly!");
        }
        logger.success("updateStocks correction to 999 SUCCESS");

        // Set stock to 0
        await inventoryApi.updateStocks(lotId, userId, 0);
        itemAfterCorrection = await inventoryApi.getItem(itemId);
        if (itemAfterCorrection.item_stocks[0]?.item_qty !== 0) {
          throw new Error("updateStocks did not set the quantity to zero!");
        }
        logger.success("updateStocks correction to 0 SUCCESS");

        // Check item_qty_before in corrections
        const { data: lastCorrection, error } = await supabase
          .from("corrections")
          .select("*")
          .eq("lot_id", lotId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (error) throw error;
        if (lastCorrection.item_qty_before !== 999) {
          throw new Error("item_qty_before in corrections is not correct!");
        }
        logger.success("item_qty_before in corrections is correct");
      }
    } else {
      logger.warning("updateStocks SKIPPED: No lot_id found for the created item.");
    }

    // 8. TEST utility functions
    logger.info("Testing utility functions...");
    const lowStockItems = await inventoryApi.getLowStockItems();
    const expiringItems = await inventoryApi.getExpiringItems();
    logger.success(`Utility functions SUCCESS - Low stock: ${lowStockItems.length}, Expiring: ${expiringItems.length}`);

    // 9. DELETE the item
    logger.info("Testing deleteItem...");
    if (!itemId) throw new Error("No item ID available");
    await inventoryApi.deleteItem(itemId);
    logger.success("deleteItem SUCCESS");
    itemId = null;

    try {
      if (!itemId) throw new Error("No item ID to verify deletion");
      await inventoryApi.getItem(itemId);
      logger.error("VERIFY DELETE FAILED: Item still exists after deletion.");
    } catch (error) {
      logger.success("VERIFY DELETE SUCCESS: Item not found after deletion (this is expected).");
    }
  } catch (error) {
    logger.error("API Test Failed");
    console.error(error);
  } finally {
    // Cleanup
    if (itemId) {
      logger.info("Cleaning up created test item...");
      await inventoryApi.deleteItem(itemId);
      logger.success("Cleanup complete.");
    }
    logger.success("Inventory API Tests Finished");
  }
}
  */

describe("Inventory API (e2e)", () => {
  let itemId = null;
  let lotId = null;
  const testUserId = "7b49506c-426b-42de-9d04-3ad256441cb4";

  afterAll(async () => {
    if (itemId) {
      try {
        await inventoryApi.deleteItem(itemId);
      } catch {
        /* ignore cleanup errors */
      }
      itemId = null;
    }
  });

  test(
    "full create -> read -> update -> transactions -> corrections -> delete flow",
    async () => {
      logger.test("Starting Inventory API Tests");

      // 1. CREATE an item
      const newItemData = {
        name: `Test Item ${Date.now()}`,
        initialStock: { quantity: 100, expiryDate: "2025-12-31" },
      };
      const created = await inventoryApi.createItem(newItemData);
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      itemId = created.id;
      logger.success("createItem SUCCESS");

      // 2. READ all items
      const allItems = await inventoryApi.getItems();
      expect(Array.isArray(allItems)).toBe(true);
      expect(allItems.some((i) => i.id === itemId)).toBe(true);
      logger.success("getItems SUCCESS");

      // 3. READ single item
      const single = await inventoryApi.getItem(itemId);
      expect(single).toBeDefined();
      expect(single.name).toBe(newItemData.name);
      logger.success("getItem SUCCESS");

      // 4. GET stock by lot id (if exists)
      if (single.item_stocks && single.item_stocks.length > 0) {
        lotId = single.item_stocks[0].lot_id;
        if (lotId) {
          const stock = await inventoryApi.getStockByLotId(lotId);
          expect(stock).toBeDefined();
          expect(stock.item_qty).toBe(100);
          logger.success("getStockByLotId SUCCESS");
        }
      } else {
        logger.warning("No stock found for created item — skipping lot-based tests");
      }

      // 5. UPDATE item
      const updated = await inventoryApi.updateItem(itemId, { name: `${newItemData.name} (Updated)` });
      expect(updated.name).toBe(`${newItemData.name} (Updated)`);
      logger.success("updateItem SUCCESS");

      // 6. TRANSACTIONS (only if lotId found)
      if (lotId) {
        // DEPOSIT + DISTRIBUTE + DISPOSE happy paths
        await inventoryApi.createTransaction({ lotId, userId: testUserId, quantity: 50, type: "DEPOSIT" });
        let after = await inventoryApi.getItem(itemId);
        expect(after.item_stocks?.[0]?.item_qty).toBe(150);

        await inventoryApi.createTransaction({ lotId, userId: testUserId, quantity: 30, type: "DISTRIBUTE" });
        after = await inventoryApi.getItem(itemId);
        expect(after.item_stocks?.[0]?.item_qty).toBe(120);

        await inventoryApi.createTransaction({ lotId, userId: testUserId, quantity: 20, type: "DISPOSE" });
        after = await inventoryApi.getItem(itemId);
        expect(after.item_stocks?.[0]?.item_qty).toBe(100);

        // Overdraw attempts should be rejected
        await expect(
          inventoryApi.createTransaction({ lotId, userId: testUserId, quantity: 200, type: "DISTRIBUTE" })
        ).rejects.toThrow();
        await expect(
          inventoryApi.createTransaction({ lotId, userId: testUserId, quantity: 200, type: "DISPOSE" })
        ).rejects.toThrow();

        logger.success("createTransaction tests SUCCESS");
      }

      // 7. CORRECTIONS (updateStocks)
      if (lotId) {
        await inventoryApi.updateStocks(lotId, testUserId, 999);
        let corrected = await inventoryApi.getItem(itemId);
        expect(corrected.item_stocks?.[0]?.item_qty).toBe(999);

        await inventoryApi.updateStocks(lotId, testUserId, 0);
        corrected = await inventoryApi.getItem(itemId);
        expect(corrected.item_stocks?.[0]?.item_qty).toBe(0);

        // verify last correction record
        const { data: lastCorrection, error } = await supabase
          .from("corrections")
          .select("*")
          .eq("lot_id", lotId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (error) throw error;
        expect(lastCorrection.item_qty_before).toBe(999);

        logger.success("updateStocks corrections SUCCESS");
      }

      // 8. Utility functions
      const lowStock = await inventoryApi.getLowStockItems();
      const expiring = await inventoryApi.getExpiringItems();
      expect(Array.isArray(lowStock)).toBe(true);
      expect(Array.isArray(expiring)).toBe(true);
      logger.success("Utility function checks SUCCESS");

      // 9. DELETE
      await inventoryApi.deleteItem(itemId);
      logger.success("deleteItem SUCCESS");

      await expect(inventoryApi.getItem(itemId)).rejects.toThrow();
      itemId = null;
      logger.success("VERIFY DELETE SUCCESS");

      logger.success("Inventory API Tests Finished");
    },
    30000
  );
});