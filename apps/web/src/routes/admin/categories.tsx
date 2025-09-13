import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { api } from "@goldstart/backend/convex/_generated/api";
import type { Doc } from "@goldstart/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { CategoryForm } from "@/components/core/admin/category-form";

export default function AdminCategories() {
	const categories = useQuery(api.categories.list, {});
	const removeCategory = useMutation(api.categories.remove);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<Doc<"categories"> | null>(null);

	const handleSave = () => {
		setIsModalOpen(false);
		setSelectedCategory(null);
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">Categories</h2>
				<Button onClick={() => setIsModalOpen(true)}>Add Category</Button>
			</div>
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCategory ? "Edit Category" : "Add Category"}>
				<CategoryForm category={selectedCategory} onSave={handleSave} />
			</Modal>
			<div className="border rounded-lg">
				<div className="grid grid-cols-2 p-2 font-bold border-b">
					<div>Name</div>
					<div>Actions</div>
				</div>
				{categories?.map((category) => (
					<div key={category._id} className="grid grid-cols-2 p-2 border-b">
						<div>{category.name}</div>
						<div>
							<Button variant="outline" size="sm" className="mr-2" onClick={() => { setSelectedCategory(category); setIsModalOpen(true); }}>Edit</Button>
							<Button variant="destructive" size="sm" onClick={() => removeCategory({ id: category._id })}>
								Delete
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}