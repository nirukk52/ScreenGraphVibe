import type { Screen } from '../../../../shared/types';

interface ScreenNodeProps {
  data: {
    screen: Screen;
  };
}

export function ScreenNode({ data }: ScreenNodeProps) {
  const { screen } = data;
  
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm min-w-48">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">{screen.role}</h3>
        <p className="text-xs text-gray-500">ID: {screen.screenId}</p>
      </div>
      <div className="p-3">
        <div className="space-y-1">
          {screen.textStems.slice(0, 3).map((stem, index) => (
            <span
              key={index}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1"
            >
              {stem}
            </span>
          ))}
          {screen.textStems.length > 3 && (
            <span className="text-xs text-gray-500">
              +{screen.textStems.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
