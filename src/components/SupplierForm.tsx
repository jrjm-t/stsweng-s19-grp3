import { useEffect, useState } from "react";
import { Heading } from "./General/Heading";
import Select from "react-select";
import Input from "./General/Input";
import Button from "./General/Button";
import Toast from "./General/Toast";
import { supplierApi } from "../lib/db/db.api";
import { useAuth } from "../lib/db/db.auth";

interface SupplierFormProps {
  mode: "add" | "edit" | "delete";
}

function SupplierForm({ mode }: SupplierFormProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    id: "",
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
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  const fetchSuppliers = async () => {
    try {
      const data = await supplierApi.getSuppliers();
      setAllSuppliers(data);
      setSupplierOptions(
        data.map((s: any) => ({ value: s.id, label: s.name }))
      );
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      setToast({ 
        message: "Failed to load suppliers", 
        type: "error" 
      });
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSupplierSelect = (newValue: any) => {
    const supplierId = newValue?.value || "";

    if (!isAdd && supplierId) {
      const selected = allSuppliers.find((s) => s.id === supplierId);
      if (selected) {
        setSelectedSupplier(selected);
        setForm({
          id: selected.id,
          name: selected.name,
          phoneNumber: selected.phone_number || "",
          emailAddress: selected.email || "",
          remarks: selected.remarks || "",
        });
      }
    } else {
      setSelectedSupplier(null);
      setForm({
        id: "",
        name: "",
        phoneNumber: "",
        emailAddress: "",
        remarks: "",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) throw new Error("User not logged in.");

      if (isAdd) {
        if (!form.name.trim()) throw new Error("Supplier name is required.");

        await supplierApi.createSupplier({
          userId: user.id,
          name: form.name.trim(),
          phone: form.phoneNumber.trim() || null,
          email: form.emailAddress.trim() || null,
          remarks: form.remarks.trim() || null,
        });

        setToast({ message: "Supplier added successfully.", type: "success" });
      }

      if (isEdit) {
        if (!form.id) throw new Error("Please select a supplier to edit.");
        if (!form.name.trim()) throw new Error("Supplier name is required.");

        // Check if anything changed
        const hasChanges = 
          form.name !== selectedSupplier.name ||
          form.phoneNumber !== (selectedSupplier.phone_number || "") ||
          form.emailAddress !== (selectedSupplier.email || "") ||
          form.remarks !== (selectedSupplier.remarks || "");

        if (!hasChanges) {
          throw new Error("No changes detected.");
        }

        await supplierApi.updateSupplier({
          userId: user.id,
          supplierId: form.id,
          name: form.name.trim(),
          phone: form.phoneNumber.trim() || null,
          email: form.emailAddress.trim() || null,
          remarks: form.remarks.trim() || null,
        });

        setToast({ message: "Supplier updated successfully.", type: "success" });
      }

      if (isDelete) {
        if (!form.id) throw new Error("Please select a supplier to delete.");

        // Confirm deletion
        const confirmDelete = window.confirm(
          `Are you sure you want to delete supplier "${form.name}"? This action cannot be undone.`
        );

        if (!confirmDelete) {
          return;
        }

        await supplierApi.deleteSupplier({
          userId: user.id,
          supplierId: form.id,
        });

        setToast({ message: "Supplier deleted successfully.", type: "success" });
      }

      await fetchSuppliers();

      setForm({
        id: "",
        name: "",
        phoneNumber: "",
        emailAddress: "",
        remarks: "",
      });
      setSelectedSupplier(null);
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
                  form.id
                    ? supplierOptions.find((opt) => opt.value === form.id)
                    : null
                }
              />
            </div>

            <Input
              label="New Supplier Name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              size="custom"
              className="w-full"
              placeholder="Enter new supplier name"
              inputClassName="bg-white"
              disabled={!form.id}
            />

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
              disabled={!form.id}
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
              disabled={!form.id}
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
              disabled={!form.id}
            />
          </div>

          <div className="flex justify-center mt-4">
            <Button size="sm" onClick={handleSubmit} disabled={!form.id}>
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

  if (isDelete) {
    return (
      <>
        <div className="w-full max-w-[600px] min-h-[400px] mx-4 border border-black/70 rounded-lg bg-white p-4 sm:p-6 md:p-8 flex flex-col">
          <div className="w-full mb-4">
            <Heading level={2} size="lg" className="text-black mb-1">
              Delete Supplier
            </Heading>
            <p className="font-Work-Sans text-md text-border">
              Select a supplier to remove from records.
            </p>
          </div>

          <div className="flex flex-col items-center gap-y-4 sm:gap-y-6 md:gap-y-9 flex-grow">
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
                placeholder="Select supplier to delete"
                value={
                  form.id
                    ? supplierOptions.find((opt) => opt.value === form.id)
                    : null
                }
              />
            </div>

            {form.id && (
              <div className="w-full p-4 bg-gray-100 rounded-md">
                <p className="text-sm font-Work-Sans text-black mb-2">
                  <strong>Name:</strong> {form.name}
                </p>
                {form.phoneNumber && (
                  <p className="text-sm font-Work-Sans text-black mb-2">
                    <strong>Phone:</strong> {form.phoneNumber}
                  </p>
                )}
                {form.emailAddress && (
                  <p className="text-sm font-Work-Sans text-black mb-2">
                    <strong>Email:</strong> {form.emailAddress}
                  </p>
                )}
                {form.remarks && (
                  <p className="text-sm font-Work-Sans text-black">
                    <strong>Remarks:</strong> {form.remarks}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <Button 
              size="sm" 
              onClick={handleSubmit} 
              disabled={!form.id}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Supplier
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

  // ADD MODE
  return (
    <>
      <div className="w-full max-w-[600px] min-h-[550px] mx-4 border border-black/70 rounded-lg bg-white p-4 sm:p-6 md:p-8 flex flex-col">
        <div className="w-full mb-4">
          <Heading level={2} size="lg" className="text-black mb-1">
            Add Supplier
          </Heading>
          <p className="font-Work-Sans text-md text-border">
            Add a new supplier to the system.
          </p>
        </div>

        <div className="flex flex-col items-center gap-y-4 sm:gap-y-6 md:gap-y-9 flex-grow">
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
            Add Supplier
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