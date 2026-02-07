/**
 * Cost display component - badge style with danger color
 */

import type { CostInfo } from "@/types";
import { formatCost } from "@/utils";

interface CostDisplayProps {
  cost: CostInfo | null;
}

export function CostDisplay({ cost }: CostDisplayProps): JSX.Element {
  if (!cost) {
    return (
      <span className="md-btn inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[var(--md-fog)] text-[var(--md-slate)]">
        --
      </span>
    );
  }

  return (
    <span className="md-btn inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[var(--md-watermelon)] text-white">
      {cost.total_images} IMG · {formatCost(cost.estimated_cost)}
    </span>
  );
}
