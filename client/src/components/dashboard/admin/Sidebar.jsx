import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Megaphone, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";


const navigation = [
  { name: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Courses", href: "/admin-courses", icon: BookOpen },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Forum", href: "/forum", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-card border-r border-border flex flex-col shadow-card"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <h1 className="text-lg font-semibold text-foreground">
              Trackademy Portal
            </h1>
          )}
        </motion.div>
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-stats"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
              <motion.span
                initial={false}
                animate={{ 
                  opacity: collapsed ? 0 : 1,
                  width: collapsed ? 0 : "auto"
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {!collapsed && item.name}
              </motion.span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-muted-foreground"
        >
          {!collapsed && (
            <>
              <p>Trackademy Admin v1.0</p>
              <p className="mt-1">© 2025</p>
            </>
          )}
        </motion.div>
      </div>
    </motion.aside>
  );
}