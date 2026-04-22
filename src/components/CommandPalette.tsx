import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Home, Users, Video, LayoutTemplate, FolderOpen, Settings, Plus } from "lucide-react";

const commands = [
  { label: "Dashboard", icon: Home, href: "/" },
  { label: "Browse Avatars", icon: Users, href: "/avatars" },
  { label: "Create Video", icon: Plus, href: "/create" },
  { label: "Templates", icon: LayoutTemplate, href: "/templates" },
  { label: "My Videos", icon: FolderOpen, href: "/videos" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        navigate("/create");
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commands.map((cmd) => (
            <CommandItem
              key={cmd.href}
              onSelect={() => {
                navigate(cmd.href);
                setOpen(false);
              }}
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              {cmd.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
