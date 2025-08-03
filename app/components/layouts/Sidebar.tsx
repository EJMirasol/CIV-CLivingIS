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
    "flex items-center transition-all bg-(--app-secondary) hover:font-medium text-white hover:bg-(--app-secondary-hover)";
  const notActiveModule =
    "flex items-center transition-all hover:text-white hover:bg-(--app-secondary-hover) hover:font-medium";
  const activeSubModule =
    "flex items-center transition-all text-white bg-(--app-primary) hover:bg-(--app-secondary-hover) hover:font-medium";
  const notActiveSubmodule =
    "flex items-center transition-all hover:text-white hover:bg-(--app-secondary-hover) hover:font-medium";
  return (
    <aside
      className={`hidden ${
        isSideBarOpen ? "lg:block" : ""
      } w-64 max-w-64 min-w-64 bg-white border-r border-gray-200 min-h-screen`}
    >
      <nav className="p-4 space-y-1">
        {sidebarItems.map(
          ({ subModules, icon, label, route: groupRoute }, index) =>
            subModules.length > 0 ? (
              <div
                key={`layout-sidebar-${index}`}
                className={
                  isOpenDropDown.find((x) => x.label === label)?.status
                    ? "bg-(--app-secondary) text-white pb-1"
                    : "hover:text-white hover:bg-(--app-secondary-hover) hover:font-medium"
                }
              >
                <Collapsible
                  open={isOpenDropDown.find((x) => x.label === label)?.status}
                  onOpenChange={(open) => {
                    setOpenDropDown(openDropDown(open, label));
                  }}
                  className="w-full space-y-2"
                >
                  <CollapsibleTrigger asChild className="cursor-pointer">
                    <li className="flex items-center gap-3 rounded-lg px-4 py-3 hover:text-white">
                      {icon}
                      {label}
                      {isOpenDropDown.find((x) => x.label === label)?.status ? (
                        <ChevronDown className="p-0 ml-auto flex h-3 w-3 shrink-0 items-center justify-center" />
                      ) : (
                        <ChevronRight className="p-0 ml-auto flex h-3 w-3 shrink-0 items-center justify-center" />
                      )}
                    </li>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 font-normal text-sm text-white mx-2">
                    {subModules.map(
                      ({ label: subLabel, icon: subIcon, route }, index) => (
                        <NavLink
                          to={route}
                          key={`layout-sidebar-subModule-${index}`}
                          className={({ isActive }) =>
                            isActive ? activeSubModule : notActiveSubmodule
                          }
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
              >
                <li className="flex items-center gap-3 px-4 py-3">
                  {icon}
                  {label}
                </li>
              </NavLink>
            )
        )}
      </nav>
    </aside>
  );
}
