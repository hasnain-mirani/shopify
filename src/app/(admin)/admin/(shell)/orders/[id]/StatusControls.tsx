"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { Package, CreditCard, Check } from "lucide-react";

interface StatusControlsProps {
  orderId: string;
  financialStatus: string;
  fulfillmentStatus: string;
}

export function StatusControls({ orderId, financialStatus, fulfillmentStatus }: StatusControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (type: "financial" | "fulfillment", value: string) => {
    setLoading(value);
    try {
      await api.orders.updateStatus(orderId, {
        [type === "financial" ? "financial_status" : "fulfillment_status"]: value,
      });
      toast.success(`Order marked as ${value}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(null);
    }
  };

  const isFulfilled = fulfillmentStatus === "fulfilled" || fulfillmentStatus === "SHIPPED";
  const isPaid = financialStatus === "paid" || financialStatus === "PAID";

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {!isFulfilled && (
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Package className="w-4 h-4" />}
          isLoading={loading === "fulfilled"}
          onClick={() => updateStatus("fulfillment", "fulfilled")}
        >
          Mark as Shipped
        </Button>
      )}
      
      {!isPaid && (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<CreditCard className="w-4 h-4" />}
          isLoading={loading === "paid"}
          onClick={() => updateStatus("financial", "paid")}
        >
          Mark as Paid
        </Button>
      )}

      {(isFulfilled && isPaid) && (
        <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
          <Check className="w-4 h-4" />
          Order Completed
        </div>
      )}
    </div>
  );
}
