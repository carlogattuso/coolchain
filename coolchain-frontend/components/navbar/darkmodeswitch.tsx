import React from "react";
import { useTheme as useNextTheme } from "next-themes";
import { Switch } from "@nextui-org/react";

export const DarkModeSwitch = () => {
  const { setTheme, resolvedTheme } = useNextTheme();
  return (
    <div className="flex items-center justify-content">
      <span className="mr-2">{resolvedTheme === "dark" ? "Dark" : "Light"}</span>
      <Switch
        isSelected={resolvedTheme === "dark" ? true : false}
        onValueChange={(e) => setTheme(e ? "dark" : "light")}
      />
    </div>
  );
};
