import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      id: "documents",
      label: "Documents",
      icon: "ri-file-list-line",
      path: "/home",
    },
    {
      id: "lost",
      label: "Lost",
      icon: "ri-search-line",
      path: "/lost-feed",
    },
    {
      id: "found",
      label: "Found",
      icon: "ri-compass-discover-line",
      path: "/found-feed",
    },
    {
      id: "chat",
      label: "Chat",
      icon: "ri-message-3-line",
      path: "/chat",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "ri-user-line",
      path: "/profile",
    },
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-lightGray py-2 max-w-md mx-auto">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={cn(
              "flex flex-col items-center justify-center",
              location === item.path ? "bottom-nav-active" : "text-darkGray"
            )}
          >
            <i className={cn(item.icon, "text-xl")}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
