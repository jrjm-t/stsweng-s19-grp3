import { useEffect, useState } from "react";
import { Heading } from "./General/Heading";
import Select from "react-select";
import Input from "./General/Input";
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

  if (isEdit) {
    return (
      <>
        <div className="w-full max-w-[600px] min-h-[650px] mx-4 border border-black/70 rounded-lg bg-white p-4 sm:p-6 md:p-8 flex flex-col">
          <div className="w-full mb-4">
            <Heading level={2} size="lg" className="text-black mb-1">
              Edit Supplier
            </Heading>
            <p className="font-Work-Sans text-md text-border">
              Select a supplier to edit their information.
            </p>
          </div>

          <div className="flex flex-col items-center gap-y-4 sm:gap-y-6 md:gap-y-8 flex-grow">
            {/* Supplier select */}
            <div className="w-full">
              <label className="block text-xs font-bold text-black mb-1">
                Supplier Name
              </label>
              <Select
                isClearable
                options={supplierOptions}
                onChange={handleSupplierSelect}
                className="text-sm"
                classNamePrefix="select"
                placeholder="Select a supplier"
                value={
                  form.name ? { label: form.name, value: form.name } : null
                }
              />
            </div>

            {/* Editable fields */}
            <Input
              label="Phone Number"
              name="phoneNumber"
              type="text"
              value={form.phoneNumber}
              onChange={handleChange}
              size="custom"
              className="w-full"
              placeholder="Enter phone number"
              inputClassName="bg-white"
            />

            <Input
              label="Email Address"
              name="emailAddress"
              type="email"
              value={form.emailAddress}
              onChange={handleChange}
              size="custom"
              className="w-full"
              placeholder="Enter email address"
              inputClassName="bg-white"
            />

            <Input
              label="Remarks"
              name="remarks"
              type="text"
              value={form.remarks}
              onChange={handleChange}
              size="custom"
              className="w-full"
              placeholder="Enter remarks"
              inputClassName="bg-white"
            />
          </div>

          <div className="flex justify-center mt-4">
            <Button size="sm" onClick={handleSubmit}>
              Save Changes
            </Button>
          </div>
        </div>

        {toast && (
          <div className="flex justify-center mt-4">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="w-full max-w-[600px] min-h-[550px] mx-4 border border-black/70 rounded-lg bg-white p-4 sm:p-6 md:p-8 flex flex-col">
        <div className="w-full mb-4">
          <Heading level={2} size="lg" className="text-black mb-1">
            {isAdd ? "Add Supplier" : "Delete Supplier"}
          </Heading>
          <p className="font-Work-Sans text-md text-border">
            {isAdd
              ? "Add a new supplier to the system."
              : "Select a supplier to remove from records."}
          </p>
        </div>

        <div className="flex flex-col items-center gap-y-4 sm:gap-y-6 md:gap-y-9 flex-grow">
          {/* Supplier select for delete */}
          {!isAdd && (
            <div className="w-full">
              <label className="block text-xs font-bold text-black mb-1">
                Supplier Name
              </label>
              <Select
                isClearable
                options={supplierOptions}
                onChange={handleSupplierSelect}
                className="text-sm"
                classNamePrefix="select"
                placeholder="Select supplier"
                value={
                  form.name ? { label: form.name, value: form.name } : null
                }
              />
            </div>
          )}

          {/* ADD mode name input */}
          {isAdd && (
            <Input
              label="Supplier Name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              size="custom"
              className="w-full"
              placeholder="Enter supplier name"
              inputClassName="bg-white"
            />
          )}

          {/* ADD mode fields only */}
          {isAdd && (
            <>
              <Input
                label="Phone Number"
                name="phoneNumber"
                type="text"
                value={form.phoneNumber}
                onChange={handleChange}
                size="custom"
                className="w-full"
                placeholder="Enter phone number"
                inputClassName="bg-white"
              />

              <Input
                label="Email Address"
                name="emailAddress"
                type="email"
                value={form.emailAddress}
                onChange={handleChange}
                size="custom"
                className="w-full"
                placeholder="Enter email address"
                inputClassName="bg-white"
              />

              <Input
                label="Remarks"
                name="remarks"
                type="text"
                value={form.remarks}
                onChange={handleChange}
                size="custom"
                className="w-full"
                placeholder="Enter remarks"
                inputClassName="bg-white"
              />
            </>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <Button size="sm" onClick={handleSubmit}>
            {isAdd ? "Add" : "Delete"}
          </Button>
        </div>
      </div>

      {toast && (
        <div className="flex justify-center mt-4">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}

export default SupplierForm;
