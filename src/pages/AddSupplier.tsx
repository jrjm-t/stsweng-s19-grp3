import SupplierForm from "../components/SupplierForm";

function AddSupplier() {
  return (
    <div className="flex mt-8 mx-2 min-h-screen flex-col items-center">
      <SupplierForm mode="add" />
    </div>
  );
}

export default AddSupplier;
