import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, type JSX } from "react";
import { NavLink, useLocation } from "react-router";

interface SidebarProps {
  sidebarItems: {
    icon: JSX.Element;
    label: string;
    route: string;
    key: string;
    subModules: {
      icon: JSX.Element;
      label: string;
      route: string;
    }[];
  }[];
  isSideBarOpen: boolean;
}

export function Sidebar({ sidebarItems, isSideBarOpen }: SidebarProps) {
  const location = useLocation();
  const [isOpenDropDown, setOpenDropDown] = useState(
    sidebarItems
      .filter((x) => x.subModules.length > 0)
      .map((y) => ({
        label: y.label,
        status: y.key === location.pathname.split("/")[1].toLowerCase(),
      }))
  );
  useEffect(() => {
    setOpenDropDown(
      sidebarItems
        .filter((x) => x.subModules.length > 0)
        .map((y) => ({
          label: y.label,
          status: y.key === location.pathname.split("/")[1].toLowerCase(),
        }))
    );
  }, [location.pathname, isSideBarOpen]);
  const openDropDown = useCallback(
    (status: boolean, label: string) => {
      return [
        ...sidebarItems
          .filter((x) => x.subModules.length > 0 && x.label !== label)
          .map((y) => ({
            label: y.label,
            status: false,
          })),
        {
          label,
          status,
        },
      ];
    },
    [isOpenDropDown]
  );

  const activeModule =
    "flex items-center transition-all hover:font-medium text-white hover:bg-opacity-80";
  const notActiveModule =
    "flex items-center transition-all hover:text-white hover:font-medium text-gray-300";
  const activeSubModule =
    "flex items-center transition-all text-white hover:font-medium hover:bg-opacity-80";
  const notActiveSubmodule =
    "flex items-center transition-all hover:text-white hover:font-medium text-gray-400";
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
        {sidebarItems.map(
          ({ subModules, icon, label, route: groupRoute }, index) =>
            subModules.length > 0 ? (
              <div
                key={`layout-sidebar-${index}`}
                className={
                  isOpenDropDown.find((x) => x.label === label)?.status
                    ? "text-white pb-1"
                    : "hover:text-white hover:font-medium text-gray-300"
                }
                style={{
                  backgroundColor: isOpenDropDown.find((x) => x.label === label)?.status 
                    ? '#2d4a43' 
                    : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isOpenDropDown.find((x) => x.label === label)?.status) {
                    e.currentTarget.style.backgroundColor = '#2d4a43';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOpenDropDown.find((x) => x.label === label)?.status) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Collapsible
                  open={isOpenDropDown.find((x) => x.label === label)?.status}
                  onOpenChange={(open) => {
                    setOpenDropDown(openDropDown(open, label));
                  }}
                  className="w-full space-y-2"
                >
                  <CollapsibleTrigger asChild className="cursor-pointer">
                    <div className="flex items-center gap-3 rounded-lg px-4 py-3 hover:text-white">
                      {icon}
                      {label}
                      {isOpenDropDown.find((x) => x.label === label)?.status ? (
                        <ChevronDown className="p-0 ml-auto flex h-3 w-3 shrink-0 items-center justify-center" />
                      ) : (
                        <ChevronRight className="p-0 ml-auto flex h-3 w-3 shrink-0 items-center justify-center" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 font-normal text-sm text-gray-300 mx-2">
                    {subModules.map(
                      ({ label: subLabel, icon: subIcon, route }, index) => (
                        <NavLink
                          to={route}
                          key={`layout-sidebar-subModule-${index}`}
                          className={({ isActive }) =>
                            isActive ? activeSubModule : notActiveSubmodule
                          }
                          style={({ isActive }) => ({
                            backgroundColor: isActive ? '#2d4a43' : 'transparent'
                          })}
                          onMouseEnter={(e) => {
                            const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = '#374d47';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 px-2 py-2">
                            {subIcon}
                            {subLabel}
                          </div>
                        </NavLink>
                      )
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : (
              <NavLink
                key={`dashboard-sidebar-${index}`}
                to={groupRoute}
                className={({ isActive }) =>
                  isActive ? activeModule : notActiveModule
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#2d4a43' : 'transparent'
                })}
                onMouseEnter={(e) => {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#2d4a43';
                  }
                }}
                onMouseLeave={(e) => {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {icon}
                  {label}
                </div>
              </NavLink>
            )
        )}
      </nav>
    </aside>
  );
}
