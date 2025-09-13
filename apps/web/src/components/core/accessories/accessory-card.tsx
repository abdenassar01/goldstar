import type { Doc, Id } from "@goldstart/backend/convex/_generated/dataModel";
import { ImageDisplay } from "../../ui/image-display";

type Accessory = Doc<"items"> & {
  category: Doc<"categories"> | null;
};

interface AccessoryCardProps {
  accessory: Accessory;
}

export function AccessoryCard({ accessory }: AccessoryCardProps) {
  // Check if accessory was created in the last 15 days
  const isNew = () => {
    const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
    return accessory._creationTime > fifteenDaysAgo;
  };

  const price = accessory.variants?.[0]?.price;

  return (
    <div className="sm:w-[32.9%] rounded-xl p-2 border border-pink-500/20 relative">
      <div className="space-y-2">
        {isNew() && (
          <div className="absolute top-2 right-2 bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full z-10">
            NEW
          </div>
        )}

        {/* Image Display */}
        {accessory.gallery && accessory.gallery.length > 0 && (
          <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
            <ImageDisplay
              storageId={accessory.gallery[0] as Id<"_storage">}
              alt={accessory.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h3 className="font-semibold text-lg">{accessory.name}</h3>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          {accessory.category && <span>{accessory.category.name}</span>}
        </div>

        <div className="flex items-center justify-between">
          {price !== undefined && (
            <div className="text-lg font-bold text-pink-600">{price} DH</div>
          )}
        </div>
      </div>
    </div>
  );
}