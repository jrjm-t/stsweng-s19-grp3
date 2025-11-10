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
  { key: "Remarks", label: "Remarks" },
];

const ROWS_PER_PAGE = 9;

function Suppliers() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { query } = useSearch();

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
        
    )
}

export default Suppliers;
