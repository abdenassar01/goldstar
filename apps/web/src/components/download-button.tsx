import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@goldstart/backend/convex/_generated/api";
import jsPDF from "jspdf";
import "jspdf-autotable";

export function DownloadButton() {
    const items = useQuery(api.items.list, {});

    const handleDownload = () => {
        if (!items) {
            return;
        }

        const doc = new jsPDF();
        doc.text("GoldStar", 14, 15);
        const headers = [["Item Name", "Item Description", "Variant Name", "Variant Price"]];
        const rows = items.flatMap((item) => {
            if (item.variants && item.variants.length > 0) {
                return item.variants.map((variant) => [
                    item.name,
                    item.description || "",
                    variant.name,
                    variant.price.toFixed(2),
                ]);
            } else {
                return [
                    [
                        item.name,
                        item.description || "",
                        "",
                        "",
                    ],
                ];
            }
        });

        doc.autoTable({
            head: headers,
            body: rows,
        });

        doc.save("items.pdf");
    };

    return (
        <div className="fixed bottom-4 right-4">
            <Button size="icon" onClick={handleDownload} disabled={!items}>
                <Download className="h-4 w-4" />
            </Button>
        </div>
    );
}