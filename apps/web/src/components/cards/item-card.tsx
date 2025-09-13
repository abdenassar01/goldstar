import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@goldstart/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import { ImageGallery } from "@/components/ui/image-display";
import type { Doc } from "@goldstart/backend/convex/_generated/dataModel";

export type HydratedItem = Doc<"items"> & {
	category: Doc<"categories"> | null;
	mark: Doc<"marks"> | null;
};

export function ItemCard({ item }: { item: HydratedItem }) {
	const isNew =
		new Date(item._creationTime).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

	return (
		<div className="border rounded-lg overflow-hidden">
			<div className="h-48 bg-gray-100 dark:bg-gray-800 relative">
				{isNew && (
					<Badge className="absolute top-2 left-2 bg-red-500 text-white">
						Nouveau
					</Badge>
				)}
				<div className="absolute top-2 right-2 flex gap-2">
					{item.mark && <Badge>{item.mark.name}</Badge>}
					{item.category && <Badge>{item.category.name}</Badge>}
				</div>
				<ImageGallery storageIds={item.gallery ?? []} />
			</div>
			<div className="p-4">
				<h3 className="text-lg font-bold">{item.name}</h3>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					{item.description}
				</p>
				<div className="flex items-center justify-between mt-4">
					<div className="flex items-center gap-2">
						<span className="text-lg font-bold">{item.price} €</span>
					</div>
					<Link to={`/item/${item._id}`}>
						<Button size="sm">Voir</Button>
					</Link>
				</div>
				<div className="flex flex-wrap gap-2 mt-4">
					{item.variants?.map((variant: any) => (
						<Badge key={variant.id} variant="outline">
							{variant.name}
						</Badge>
					))}
				</div>
				<p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
					Ajouté le {new Date(item._creationTime).toLocaleDateString()}
				</p>
			</div>
		</div>
	);
}