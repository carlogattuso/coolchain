import React from "react";
import { Sidebar } from "./sidebar.styles";
import { CompanyName } from "./company-name";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { AccountsIcon } from "../icons/sidebar/accounts-icon";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { useSidebarContext } from "../layout/layout-context";
import { usePathname } from "next/navigation";
import {ReportsIcon} from "@/components/icons/sidebar/reports-icon";
import {PaymentsIcon} from "@/components/icons/sidebar/payments-icon";

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();

  return (
    <aside className="h-screen z-[20] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}
      <div
        className={Sidebar({
          collapsed: collapsed,
        })}
      >
        <div className={Sidebar.Header()}>
          <CompanyName />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            {/*<SidebarItem*/}
            {/*  title="Home"*/}
            {/*  icon={<HomeIcon />}*/}
            {/*  href="/auditors"*/}
            {/*/>*/}
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={pathname === "/auditors"}
                title="Auditors"
                icon={<AccountsIcon />}
                href="auditors"
              />
              <SidebarItem
                isActive={pathname === "/devices"}
                title="Devices"
                icon={<ReportsIcon />}
                href="devices"
              />
              <SidebarItem
                isActive={pathname === "/records"}
                title="Records"
                icon={<PaymentsIcon />}
                href="records"
              />
            </SidebarMenu>
          </div>
        </div>
      </div>
    </aside>
  );
};
