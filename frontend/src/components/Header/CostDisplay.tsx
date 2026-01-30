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
      <span className="rounded border-2 border-[var(--md-graphite)] bg-[var(--md-fog)] px-2 py-0.5 text-xs text-[var(--md-slate)]">
        --
      </span>
    );
  }

  return (
    <span className="rounded border-2 border-[var(--md-graphite)] bg-[var(--md-watermelon)] px-2 py-0.5 text-xs font-bold text-white">
      {cost.total_images} img · {formatCost(cost.estimated_cost)}
    </span>
  );
}
