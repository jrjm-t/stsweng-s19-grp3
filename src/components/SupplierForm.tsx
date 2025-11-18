import { useEffect, useState } from "react";
import { Heading } from "./General/Heading";
import Select from "./General/Select";
import Button from "./General/Button";
import Toast from "./General/Toast";
import { supplierApi } from "../api/supplierApi"; // to be implemented
import { useAuth } from "../lib/db/db.auth"; // not sure about this import

interface SupplierFormProps {
  mode: "add" | "edit" | "delete";
}

function SupplierForm({ mode }: SupplierFormProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    emailAddress: "",
    remarks: "",
  });

  const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [toast, setToast] = useState<any>(null);

  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  const fetchSuppliers = async () => {
    const data = await supplierApi.getAllSuppliers();
    setAllSuppliers(data);
    setSupplierOptions(
      data.map((s: any) => ({ value: s.name, label: s.name }))
    );
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSupplierSelect = (newValue: any) => {
    const name = newValue?.value || "";

    setForm((prev) => ({ ...prev, name }));

    if (!isAdd && name) {
      const selected = allSuppliers.find((s) => s.name === name);
      if (selected) {
        setForm({
          name: selected.name,
          phoneNumber: selected.phoneNumber,
          emailAddress: selected.emailAddress,
          remarks: selected.remarks || "",
        });
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) throw new Error("User not logged in.");

      if (isAdd) {
        if (!form.name) throw new Error("Supplier name is required.");

        await supplierApi.createSupplier({
          ...form,
          userId: user.id,
        });

        setToast({ message: "Supplier added successfully.", type: "success" });
      }

      if (isEdit) {
        const selected = allSuppliers.find((s) => s.name === form.name);
        if (!selected) throw new Error("Supplier does not exist.");

        await supplierApi.updateSupplier({
          supplierId: selected.id,
          ...form,
          userId: user.id,
        });

        setToast({ message: "Supplier updated.", type: "success" });
      }

      if (isDelete) {
        const selected = allSuppliers.find((s) => s.name === form.name);
        if (!selected) throw new Error("Supplier not found.");

        await supplierApi.deleteSupplier({
          supplierId: selected.id,
          userId: user.id,
        });

        setToast({ message: "Supplier deleted.", type: "success" });
      }

      await fetchSuppliers();

      setForm({
        name: "",
        phoneNumber: "",
        emailAddress: "",
        remarks: "",
      });
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    }
  };
}

export default SupplierForm;
