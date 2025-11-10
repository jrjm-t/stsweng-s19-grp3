import React, { use, useEffect, useState } from "react";
import SupplierTable from "../components/Supplier/SupplierTable";
import Button from "../components/General/Button";
import SupplierCard from "../components/Supplier/SupplierCard";
//import { getSuppliers } from "../api/supplierApi";
//import { Supplier } from "../types/Supplier";
import { useSearch } from "../contexts/SearchContext";

const columns = [
  { key: "name", label: "Supplier" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "emailAddress", label: "Email Address" },
  { key: "remarks", label: "Remarks" },
];

const ROWS_PER_PAGE = 9;

function Suppliers() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { query, setQuery } = useSearch();

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const suppliers = await getSuppliers(); // under assumption API exists
        setRawData(suppliers);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    let result = rawData;

    if (query.trim() !== "") {
      result = rawData.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(query.toLowerCase()) ||
          supplier.phoneNumber.toLowerCase().includes(query.toLowerCase()) ||
          supplier.emailAddress.toLowerCase().includes(query.toLowerCase())
      );
    }

    result.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredData(result);
    setPage(0);
  }, [query, rawData]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const startIdx = page * ROWS_PER_PAGE;
  const endIdx = startIdx + ROWS_PER_PAGE;
  const visibleRows = filteredData.slice(startIdx, endIdx);

  const paddedData =
    visibleRows.length < ROWS_PER_PAGE
      ? [
          ...visibleRows,
          ...Array.from({ length: ROWS_PER_PAGE - visibleRows.length }).map(
            () => ({
              name: "",
              phoneNumber: "",
              emailAddress: "",
              remarks: "",
            })
          ),
        ]
      : visibleRows;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen mt-3 p-4 gap-4">
      {/* Container */}
      <div className="w-full max-w-[1300px] border border-black/70 rounded-md overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-primary px-4 py-3">
          <div className="text-white text-lg font-semibold">Suppliers</div>

          {/* Right side - Search Bar */}
          <div className="w-full md:w-[200px] px-2 py-1 rounded text-sm text-black bg-white border border-gray-300">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          {loading ? (
            <div className="flex items-center justify-center h-[450px]">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : (
            <SupplierTable columns={columns} data={paddedData} />
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden w-full max-w-[1000px] mx-auto flex items-center flex-col gap-4 px-4">
          {loading ? (
            <div className="flex items-center justify-center h-[450px]">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : (
            visibleRows.map((supplier, idx) => (
              <SupplierCard key={idx} supplier={supplier} />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-6">
            <Button
              size="xs"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
            >
              Back
            </Button>
            <Button
              size="xs"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            >
              Next
            </Button>
          </div>
          <span className="text-sm text-black font-Work-Sans">
            Page {page + 1} of {totalPages || 1}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Suppliers;
