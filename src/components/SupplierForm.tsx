import { useEffect, useState } from "react";
import { Heading } from "./General/Heading";

import Button from "./General/Button";
import Toast from "./General/Toast";
// import { supplierApi } from "../api/supplierApi";
// import { useAuth } from "../lib/db/db.auth"; // not sure about this import

interface SupplierFormProps {
  mode: "add" | "edit" | "delete";
}

function SupplierFormProps { mode }: SupplierFormProps) {
    const {user} = useAuth();
    const [form, setForm] = useState({
        name: "",
        phoneNumber: "",
        emailAddress: "",
        remarks: ""
    });
    

}