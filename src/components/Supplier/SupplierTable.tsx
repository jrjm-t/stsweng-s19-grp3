import React from "react";

type Column = {
  key: string;
  label: string;
};

type TableProps = {
  columns: Column[];
  data: Record<string, React.ReactNode>[]; // data must contain keys like lotId, name, expDate, etc.
};

function SupplierTable({ columns, data }: TableProps) {
  return (
    <div className="w-full rounded-md overflow-hidden">
      <table className="w-full table-fixed border-collapse text-center min-w-[800px]">
        <colgroup>
          <col className="w-[160px]" />
          <col className="w-[180px]" />
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
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="bg-white h-[50px] text-black font-Work-Sans text-sm border-b border-border"
            >
              {columns.map((col, index) => (
                <td
                  key={col.key}
                  className={`align-middle p-2 truncate ${
                    index !== columns.length - 1 ? "border-r border-border" : ""
                  }`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SupplierTable;
