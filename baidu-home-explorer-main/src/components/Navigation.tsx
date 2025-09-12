import { Button } from "@/components/ui/button";

const navItems = [
  { name: "首页", href: "/" },
  { name: "热门话题", href: "/trending" },
  { name: "关于", href: "/about" },
];

export default function Navigation() {
  return (
    <nav className="bg-primary text-white p-4">
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.name}>
            <a href={item.href}>{item.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}