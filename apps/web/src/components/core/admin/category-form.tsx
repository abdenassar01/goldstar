import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@goldstart/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";

export function CategoryForm({ category, onSave }: { category?: any, onSave: () => void }) {
	const [name, setName] = useState(category?.name || "");
	const [icon, setIcon] = useState(category?.icon || "");
	const createCategory = useMutation(api.categories.create);
	const updateCategory = useMutation(api.categories.update);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (category) {
			await updateCategory({ id: category._id, name, icon });
		} else {
			await createCategory({ name, icon });
		}
		onSave();
	};

	return (
		<form onSubmit={handleSubmit} className="grid gap-4">
			<div>
				<Label htmlFor="name">Name</Label>
				<Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
			</div>
			<div>
				<Label htmlFor="icon">Icon</Label>
				<Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} />
			</div>
			<Button type="submit">Save</Button>
		</form>
	);
}