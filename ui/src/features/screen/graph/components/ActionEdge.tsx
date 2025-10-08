import type { Action } from '../../../../shared/types';
import { Verb } from '../../../../shared/types';

interface ActionEdgeProps {
  data?: {
    action: Action;
  };
}

export function ActionEdge({ data }: ActionEdgeProps) {
  const action = data?.action;

  if (!action) return null;

  const getVerbIcon = (verb: Verb) => {
    switch (verb) {
      case Verb.TAP:
        return '👆';
      case Verb.TYPE:
        return '⌨️';
      case Verb.SCROLL:
        return '📜';
      case Verb.BACK:
        return '⬅️';
      case Verb.LONG_PRESS:
        return '👆⏱️';
      case Verb.SWIPE:
        return '👈👉';
      default:
        return '❓';
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs">{getVerbIcon(action.verb)}</span>
      <span className="text-xs font-medium text-gray-700">{action.verb}</span>
      {action.targetText && <span className="text-xs text-gray-500">({action.targetText})</span>}
    </div>
  );
}
