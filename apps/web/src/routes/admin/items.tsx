import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ItemForm } from "@/components/core/admin/item-form";
import { api } from "@goldstart/backend/convex/_generated/api";
import type { Doc } from "@goldstart/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

export default function AdminItems() {
	const items = useQuery(api.items.list, {});
	const removeItem = useMutation(api.items.remove);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<Doc<"items"> | null>(null);

	const handleAddItem = () => {
		setSelectedItem(null);
		setIsModalOpen(true);
	};

	const handleEditItem = (item: Doc<"items">) => {
		setSelectedItem(item);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedItem(null);
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Items</h1>
				<Button onClick={handleAddItem}>Add Item</Button>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{items?.map((item) => (
					<div key={item._id} className="border p-4 rounded-lg">
						<h2 className="font-bold">{item.name}</h2>
						<div className="flex gap-2 mt-2">
							<Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
								Edit
							</Button>
							<Button variant="destructive" size="sm" onClick={() => removeItem({ id: item._id })}>
								Delete
							</Button>
						</div>
					</div>
				))}
			</div>
			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={selectedItem ? "Edit Item" : "Add Item"}
			>
				<ItemForm item={selectedItem} onSave={handleCloseModal} />
			</Modal>
		</div>
	);
}
""