import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, type JSX } from "react";
import { NavLink, useLocation } from "react-router";

interface SubModule {
  icon: JSX.Element;
  label: string;
  route: string;
  subModules?: SubModule[];
}

interface SidebarProps {
  sidebarItems: {
    icon: JSX.Element;
    label: string;
    route: string;
    key: string;
    subModules: SubModule[];
  }[];
  isSideBarOpen: boolean;
}

export function Sidebar({ sidebarItems, isSideBarOpen }: SidebarProps) {
  const location = useLocation();
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  // Auto-open modules based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenModules = new Set<string>();
    
    sidebarItems.forEach(item => {
      if (item.subModules.length > 0) {
        const hasActiveSubModule = checkActiveSubModule(item.subModules, currentPath);
        if (hasActiveSubModule) {
          newOpenModules.add(item.label);
          // Also open nested sub-modules if needed
          addOpenNestedModules(item.subModules, currentPath, newOpenModules);
        }
      }
    });
    
    setOpenModules(newOpenModules);
  }, [location.pathname, sidebarItems]);

  const checkActiveSubModule = (subModules: SubModule[], currentPath: string): boolean => {
    return subModules.some(sub => {
      if (currentPath.startsWith(`/${sub.route}`)) return true;
      if (sub.subModules && sub.subModules.length > 0) {
        return checkActiveSubModule(sub.subModules, currentPath);
      }
      return false;
    });
  };

  const addOpenNestedModules = (subModules: SubModule[], currentPath: string, openSet: Set<string>) => {
    subModules.forEach(sub => {
      if (sub.subModules && sub.subModules.length > 0) {
        const hasActiveChild = checkActiveSubModule(sub.subModules, currentPath);
        if (hasActiveChild) {
          openSet.add(sub.label);
          addOpenNestedModules(sub.subModules, currentPath, openSet);
        }
      }
    });
  };

  const toggleModule = (label: string) => {
    const newOpenModules = new Set(openModules);
    if (newOpenModules.has(label)) {
      newOpenModules.delete(label);
    } else {
      newOpenModules.add(label);
    }
    setOpenModules(newOpenModules);
  };

  const renderSubModules = (subModules: SubModule[], level: number = 1): JSX.Element[] => {
    return subModules.map((subModule, index) => {
      const isOpen = openModules.has(subModule.label);
      const hasSubModules = subModule.subModules && subModule.subModules.length > 0;
      const paddingLeft = `${(level + 1) * 16}px`;
      
      if (hasSubModules) {
        return (
          <div key={`sub-module-${level}-${index}`} className="space-y-1">
            <Collapsible
              open={isOpen}
              onOpenChange={() => toggleModule(subModule.label)}
              className="w-full"
            >
              <CollapsibleTrigger asChild className="cursor-pointer w-full">
                <div 
                  className="flex items-center gap-2 py-2 px-2 text-gray-300 hover:text-white hover:bg-[#374d47] transition-all"
                  style={{ paddingLeft }}
                >
                  {subModule.icon}
                  <span className="flex-1 text-left">{subModule.label}</span>
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 shrink-0" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5">
                {renderSubModules(subModule.subModules!, level + 1)}
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      } else {
        return (
          <NavLink
            key={`sub-module-${level}-${index}`}
            to={`/${subModule.route}`}
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 px-2 transition-all ${
                isActive 
                  ? 'text-white bg-[#2d4a43] font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-[#374d47]'
              }`
            }
            style={{ paddingLeft }}
          >
            {subModule.icon}
            {subModule.label}
          </NavLink>
        );
      }
    });
  };

  const activeModule =
    "flex items-center transition-all hover:font-medium text-white hover:bg-opacity-80";
  const notActiveModule =
    "flex items-center transition-all hover:text-white hover:font-medium text-gray-300";
  return (
    <aside
      className={`hidden ${
        isSideBarOpen ? "lg:block" : ""
      } w-64 max-w-64 min-w-64 min-h-screen border-r`}
      style={{ 
        backgroundColor: '#213b36',
        borderColor: '#1a2e29'
      }}
    >
      <nav className="p-4 space-y-1">
        {sidebarItems.map((item, index) => {
          const isOpen = openModules.has(item.label);
          const hasSubModules = item.subModules.length > 0;
          
          if (hasSubModules) {
            return (
              <div key={`layout-sidebar-${index}`} className="space-y-1">
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleModule(item.label)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild className="cursor-pointer w-full">
                    <div 
                      className={`flex items-center gap-3 px-4 py-3 transition-all ${
                        isOpen 
                          ? 'text-white bg-[#2d4a43]' 
                          : 'text-gray-300 hover:text-white hover:bg-[#2d4a43]'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      {isOpen ? (
                        <ChevronDown className="h-3 w-3 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 shrink-0" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 font-normal text-sm">
                    {renderSubModules(item.subModules)}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          } else {
            return (
              <NavLink
                key={`dashboard-sidebar-${index}`}
                to={item.route}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 transition-all ${
                    isActive 
                      ? 'text-white bg-[#2d4a43] font-medium' 
                      : 'text-gray-300 hover:text-white hover:bg-[#2d4a43]'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            );
          }
        })}
      </nav>
    </aside>
  );
}
