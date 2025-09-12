import { Button } from "@/components/ui/button";

const navItems = [
  { name: "News", href: "#" },
  { name: "Images", href: "#" },
  { name: "Videos", href: "#" },
  { name: "Maps", href: "#" },
  { name: "Translate", href: "#" },
  { name: "Scholar", href: "#" },
];

export const Navigation = () => {
  return (
    <nav className="w-full">
      {/* Top navigation */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="text-sm hover:text-primary hover:bg-transparent"
              asChild
            >
              <a href={item.href}>{item.name}</a>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Settings
          </Button>
          <Button variant="default" size="sm">
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
};