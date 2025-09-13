import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@goldstart/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";

export function MarkForm({ mark, onSave }: { mark?: any, onSave: () => void }) {
	const [name, setName] = useState(mark?.name || "");
	const [icon, setIcon] = useState(mark?.icon || "");
	const createMark = useMutation(api.marks.create);
	const updateMark = useMutation(api.marks.update);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (mark) {
			await updateMark({ id: mark._id, name, icon });
		} else {
			await createMark({ name, icon });
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