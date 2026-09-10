import { describe, it, expect, beforeEach } from "vitest";
import { useOperationalFormStore } from "../hooks/useOperationalFormStore";

describe("useOperationalFormStore - syncItemsFromPicker & clearAllLines", () => {
  beforeEach(() => {
    useOperationalFormStore.getState().initNew("purchase");
  });

  it("should clear all lines back to 1 empty line", () => {
    const store = useOperationalFormStore.getState();
    store.addItemsBulk([
      { id: "item-1", sku: "SKU1", itemName: "Item 1" },
      { id: "item-2", sku: "SKU2", itemName: "Item 2" },
    ]);

    expect(useOperationalFormStore.getState().lines.length).toBe(2);

    useOperationalFormStore.getState().clearAllLines("purchase");
    const lines = useOperationalFormStore.getState().lines;

    expect(lines.length).toBe(1);
    expect(lines[0].inventory_item_id || "").toBe("");
    expect(lines[0].item_name).toBe("");
  });

  it("should sync items from picker while preserving manual/service lines and existing modified values", () => {
    const store = useOperationalFormStore.getState();

    // 1. Setup initial lines with 1 manual service line and 1 inventory line
    store.setLines([
      {
        tempId: "manual-1",
        item_code: "SRV-01",
        item_name: "Phí vận chuyển",
        description: "Giao tận kho",
        qty: "1",
        unit_price: "200000",
        amount: "200000",
        notes: "Ghi chú giao hàng",
        line_type: "SERVICE",
        inventory_item_id: "",
      },
      {
        tempId: "inv-1",
        item_code: "PART-1",
        item_name: "Linh kiện A",
        description: "Mô tả linh kiện A",
        qty: "5", // modified qty
        unit_price: "100000",
        amount: "500000",
        notes: "Lô hàng 1",
        line_type: "PART",
        inventory_item_id: "item-1",
      },
    ]);

    // 2. Sync from picker: item-1 still selected, item-2 newly selected
    useOperationalFormStore.getState().syncItemsFromPicker(
      [
        {
          id: "item-1",
          sku: "PART-1",
          itemName: "Linh kiện A",
          itemType: "PART",
        },
        {
          id: "item-2",
          sku: "PART-2",
          itemName: "Linh kiện B",
          itemType: "GOODS",
          costPrice: 50000,
        },
      ],
      "purchase",
    );

    const lines = useOperationalFormStore.getState().lines;

    // Manual line + 2 inventory lines = 3 lines
    expect(lines.length).toBe(3);

    // Manual line preserved
    const manualLine = lines.find((l) => l.tempId === "manual-1");
    expect(manualLine).toBeDefined();
    expect(manualLine?.item_name).toBe("Phí vận chuyển");

    // Existing item-1 keeps modified qty and notes
    const item1Line = lines.find((l) => l.inventory_item_id === "item-1");
    expect(item1Line).toBeDefined();
    expect(item1Line?.qty).toBe("5");
    expect(item1Line?.amount).toBe("500000");
    expect(item1Line?.notes).toBe("Lô hàng 1");

    // New item-2 created with initial values
    const item2Line = lines.find((l) => l.inventory_item_id === "item-2");
    expect(item2Line).toBeDefined();
    expect(item2Line?.item_code).toBe("PART-2");
    expect(item2Line?.item_name).toBe("Linh kiện B");
    expect(item2Line?.qty).toBe("1");
    expect(item2Line?.unit_price).toBe("50000");
    expect(item2Line?.line_type).toBe("PRODUCT");
  });

  it("should remove unselected inventory items when syncing from picker", () => {
    const store = useOperationalFormStore.getState();

    store.setLines([
      {
        tempId: "inv-1",
        item_code: "PART-1",
        item_name: "Linh kiện A",
        description: "",
        qty: "2",
        unit_price: "100000",
        amount: "200000",
        notes: "",
        line_type: "PART",
        inventory_item_id: "item-1",
      },
      {
        tempId: "inv-2",
        item_code: "PART-2",
        item_name: "Linh kiện B",
        description: "",
        qty: "3",
        unit_price: "50000",
        amount: "150000",
        notes: "",
        line_type: "PART",
        inventory_item_id: "item-2",
      },
    ]);

    // Picker only has item-2 (item-1 unselected/removed)
    useOperationalFormStore.getState().syncItemsFromPicker(
      [
        {
          id: "item-2",
          sku: "PART-2",
          itemName: "Linh kiện B",
          itemType: "PART",
        },
      ],
      "purchase",
    );

    const lines = useOperationalFormStore.getState().lines;
    expect(lines.length).toBe(1);
    expect(lines[0].inventory_item_id).toBe("item-2");
    expect(lines[0].qty).toBe("3");
  });

  it("should update qty and calculate amount when items have custom qty from picker", () => {
    const store = useOperationalFormStore.getState();

    store.setLines([
      {
        tempId: "inv-1",
        item_code: "PART-1",
        item_name: "Linh kiện A",
        description: "",
        qty: "2",
        unit_price: "100000",
        amount: "200000",
        notes: "",
        line_type: "PART",
        inventory_item_id: "item-1",
      },
    ]);

    // Picker passes custom qty: 10 for existing item-1, and 4 for new item-2
    useOperationalFormStore.getState().syncItemsFromPicker(
      [
        {
          id: "item-1",
          sku: "PART-1",
          itemName: "Linh kiện A",
          itemType: "PART",
          qty: 10,
        },
        {
          id: "item-2",
          sku: "PART-2",
          itemName: "Linh kiện B",
          itemType: "PART",
          costPrice: 50000,
          qty: 4,
        },
      ],
      "purchase",
    );

    const lines = useOperationalFormStore.getState().lines;
    expect(lines.length).toBe(2);

    const item1 = lines.find((l) => l.inventory_item_id === "item-1");
    expect(item1?.qty).toBe("10");
    expect(item1?.amount).toBe("1000000"); // 10 * 100000

    const item2 = lines.find((l) => l.inventory_item_id === "item-2");
    expect(item2?.qty).toBe("4");
    expect(item2?.unit_price).toBe("50000");
    expect(item2?.amount).toBe("200000"); // 4 * 50000
  });
});
