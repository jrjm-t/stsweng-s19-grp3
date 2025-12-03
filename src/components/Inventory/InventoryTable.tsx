import React from "react";
import NumberStepper from "../General/NumberStepper";
import { useItemSelection } from "../../contexts/ItemSelectionContext";

type Column = {
  key: string;
  label: string;
};

type TableProps = {
  columns: Column[];
  data: Record<string, React.ReactNode>[]; // data must contain keys like lotId, name, expDate, etc.
};

function InventoryTable({ columns, data }: TableProps) {
  const { selectedItems, updateItemQty } = useItemSelection();

  return (
    <div className="w-full rounded-md overflow-hidden">
      <table className="w-full table-fixed border-collapse text-center min-w-[800px]">
        <colgroup>
          <col className="w-[160px]" />
          <col className="w-[180px]" />
          <col className="w-[140px]" />
          <col className="w-[60px]" />
          <col className="w-[100px]" />
          <col className="w-[100px]" />
          <col className="w-[100px]" />
          <col className="w-[100px]" />
          <col className="w-[100px]" />
        </colgroup>

        <thead>
          <tr className="bg-white h-[50px] text-black">
            {columns.map((col, index) => (
              <th
                key={col.key}
                className={`font-bold font-Poppins text-sm border-b border-border ${
                  index !== columns.length - 1 ? "border-r border-border" : ""
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => {
            const isEmpty = Object.values(row).every((val) => val === "");
            const lotId = row["lotId"] as string;
            const initialQty = selectedItems[lotId]?.qtyTaken || 0;

            return (
              <tr
                key={idx}
                className="bg-white h-[50px] text-black font-Work-Sans text-sm border-b border-border"
              >
                {columns.map((col, index) => (
                  <td
                    key={col.key}
                    className={`align-middle ${
                      index !== columns.length - 1
                        ? "border-r border-border"
                        : ""
                    }`}
                  >
                    {col.key === "action" ? (
                      isEmpty ? null : (
                        <div className="flex justify-center items-center">
                          <NumberStepper
                            key={lotId}
                            min={0}
                            max={999}
                            initial={initialQty}
                            onChange={(val) => {
                              const name = row["name"] as string;
                              const supplier = row["supplier"] as string;
                              const expDate = row["expDate"] as string;
                              const lastModified = row[
                                "lastModified"
                              ] as string;
                              const totalQty = row["qty"] as number;

                              updateItemQty(lotId, {
                                lotId,
                                name,
                                expDate,
                                lastModified,
                                totalQty,
                                qtyTaken: val,
                              });
                            }}
                          />
                        </div>
                      )
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;
