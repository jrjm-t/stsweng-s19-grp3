import SupplierForm from "../components/SupplierForm";

function DeleteSupplier() {
  return (
    <div className="flex mt-8 mx-2 min-h-screen flex-col items-center">
      <SupplierForm mode="delete" />
    </div>
  );
}
export default DeleteSupplier;
