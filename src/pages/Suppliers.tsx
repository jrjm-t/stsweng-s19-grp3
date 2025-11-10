import React, { use, useEffect, useState } from "react";
import SupplierTable from "../components/Supplier/SupplierTable";
import SupplierCard from "../components/Supplier/SupplierCard";
//import { getSuppliers } from "../api/supplierApi";
//import { Supplier } from "../types/Supplier";

const columns = [
  { key: "name", label: "Supplier" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "emailAddress", label: "Email Address" },
  { key: "Remarks", label: "Remarks" },
];

const ROWS_PER_PAGE = 9;

function Suppliers() {}

export default Suppliers;
