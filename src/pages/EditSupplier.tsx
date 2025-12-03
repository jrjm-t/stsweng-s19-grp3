import SupplierForm from "../components/SupplierForm";

function EditSupplier() {
  return (
    <div className="flex mt-8 mx-2 min-h-screen flex-col items-center">
      <SupplierForm mode="edit" />
    </div>
  );
}

export default EditSupplier;
