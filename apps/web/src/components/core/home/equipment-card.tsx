import React from 'react'
import type { Doc, Id } from "@goldstart/backend/convex/_generated/dataModel";
import { ImageDisplay } from "@/components/ui/image-display";

type Equipment = Doc<"items"> & {
  mark: Doc<"marks"> | null;
  category: Doc<"categories"> | null;
};

interface EquipmentCardProps {
  equipment: Equipment;
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  // Check if equipment was created in the last 15 days
  const isNew = () => {
    const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
    return equipment._creationTime > fifteenDaysAgo;
  };

  return (
    <div className="sm:w-[32.9%] rounded-xl p-2 border border-pink-500/20 relative">
      {isNew() && (
        <div className="absolute top-2 right-2 bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full z-10">
          new
        </div>
      )}

      {equipment.mark?.icon && (
        <ImageDisplay
          storageId={equipment.mark.icon as Id<"_storage">}
          alt={equipment.mark.name}
          className="w-12 h-12 object-contain rounded-lg"
        />
      )}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{equipment.name}</h3>

        {/* {equipment.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{equipment.description}</p>
        )} */}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          {equipment.mark && <span>{equipment.mark.name}</span>}
          {equipment.mark && equipment.category && <span>•</span>}
          {equipment.category && <span>{equipment.category.name}</span>}
        </div>

        {equipment.variants && equipment.variants.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Variantes disponibles :</p>
            <div className="flex flex-wrap gap-1">
              {equipment.variants.slice(0, 3).map((variant, index) => (
                <span
                  key={index}
                  className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded"
                >
                  {variant.name} - {variant.price} DH
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
