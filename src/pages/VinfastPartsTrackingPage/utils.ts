export function getVehicleTypeLabel(vehicleType: "CAR" | "MOTORBIKE") {
  return vehicleType === "CAR" ? "Ô tô" : "Xe máy";
}

export function getVehicleTypeBadgeClass(vehicleType: "CAR" | "MOTORBIKE") {
  return vehicleType === "CAR"
    ? "w-[80px] border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
    : "w-[80px] border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100";
}
