import { NavLink } from 'react-router-dom';
import { 
  BookOpen, 
  Home, 
  User, 
  FileText, 
  Megaphone, 
  MessageCircle, 
  BarChart3,
  GraduationCap 
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'My Profile', url: '/dashboard/profile', icon: User },
  { title: 'My Courses', url: '/dashboard/courses', icon: BookOpen },
  { title: 'Assignments', url: '/dashboard/assignments', icon: FileText },
  { title: 'Announcements', url: '/dashboard/announcements', icon: Megaphone },
  { title: 'Discussion', url: '/dashboard/discussion', icon: MessageCircle },
  { title: 'Progress', url: '/dashboard/progress', icon: BarChart3 },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="w-60">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-sidebar-primary" />
            <div>
              <h2 className="font-bold text-sidebar-foreground">Trackademy</h2>
              <p className="text-sm text-sidebar-foreground/70">Student Portal</p>
            </div>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}