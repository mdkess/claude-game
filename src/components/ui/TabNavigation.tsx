interface Tab {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex border-b border-gray-700">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const baseClasses = "px-6 py-3 text-sm font-bold transition-all border-b-2 flex-1";
        
        let colorClasses = "";
        switch (tab.color) {
          case 'red':
            colorClasses = isActive
              ? 'text-red-400 border-red-500 bg-red-900/20'
              : 'text-gray-400 border-transparent hover:text-red-300';
            break;
          case 'blue':
            colorClasses = isActive
              ? 'text-blue-400 border-blue-500 bg-blue-900/20'
              : 'text-gray-400 border-transparent hover:text-blue-300';
            break;
          case 'yellow':
            colorClasses = isActive
              ? 'text-yellow-400 border-yellow-500 bg-yellow-900/20'
              : 'text-gray-400 border-transparent hover:text-yellow-300';
            break;
          default:
            colorClasses = isActive
              ? 'text-purple-400 border-purple-500 bg-purple-900/20'
              : 'text-gray-400 border-transparent hover:text-purple-300';
        }
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`${baseClasses} ${colorClasses}`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}