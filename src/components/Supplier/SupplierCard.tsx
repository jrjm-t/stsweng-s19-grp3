import React from "react";

interface SupplierCardProps {
  supplier: {
    name: string;
    remarks: string;
    phoneNumber: string;
    emailAddress: string;
  };
}

function SupplierCard({ supplier }: SupplierCardProps) {
  return (
    <div className="w-full h-[150px] bg-white border border-[rgba(0,0,0,0.7)] shadow rounded-2xl p-4 flex flex-col justify-between font-Work-Sans text-black">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold truncate">{supplier.name}</h2>
        </div>
        <p className="text-sm">Unit Price: Php {supplier.remarks}</p>
        <p className="text-sm">Total Price: Php {supplier.phoneNumber}</p>
        <p className="text-sm">Expiry: {supplier.emailAddress}</p>
      </div>
    </div>
  );
}

export default SupplierCard;
