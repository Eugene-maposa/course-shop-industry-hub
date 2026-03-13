import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeMode } from "@/hooks/useThemeMode";

const ThemeModeToggle = () => {
  const { mode, setMode } = useThemeMode();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-200 hover:text-white hover:bg-nust-blue-light h-8 w-8">
          {mode === "light" && <Sun className="w-4 h-4" />}
          {mode === "dark" && <Moon className="w-4 h-4" />}
          {mode === "system" && <Monitor className="w-4 h-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setMode("light")} className="gap-2">
          <Sun className="w-4 h-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("dark")} className="gap-2">
          <Moon className="w-4 h-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("system")} className="gap-2">
          <Monitor className="w-4 h-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeModeToggle;
