import {
  Home,
  FileText,
  Trophy,
  Award,
  MessageSquare,
  Users,
  BookOpen,
  BarChart3,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {  useSelector } from "react-redux";



export function DashboardSidebar() {
  const location = useLocation();
  const notes = useSelector(state=> state.note.notes);

  
 ;

  const navigationItems = [
  {
    title: "Dashboard",
    url: "/student-dashboard",
    icon: Home,
    badge: null,
  },
  {
    title: "Notes & Resources",
    url: "/student/notes",
    icon: FileText,
    badge:notes.length,
  },
  // {
  //   title: "Quizzes & Tests",
  //   url: "/quizzes",
  //   icon: Trophy,
  //   badge: null,
  // },
  {
    title: "Certificates",
    url: "/certificates",
    icon: Award,
    badge: null,
  },
  {
    title: "Progress",
    url: "/student/progress",
    icon: BarChart3,
    badge: null,
  },
]

const communityItems = [
  {
    title: "Study Forum",
    url: "/student/forum",
    icon: MessageSquare,
    badge: "new",
  },
  {
    title: "Study Groups",
    url: "/student/groups",
    icon: Users,
    badge: null,
  },
]

const learningItems = [
  {
    title: "Course Library",
    url: "/courses",
    icon: BookOpen,
    badge: "New",
  },
]

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  const getNavClassName = (path) => {
    return isActive(path)
      ? "bg-gradient-primary text-primary-foreground shadow-glow font-medium"
      : "hover:bg-sidebar-accent transition-all duration-200"
  }

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
  }

  return (
    <Sidebar className="w-64">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 py-4"
        >
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-sidebar-foreground/70 font-medium">
              Main
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <motion.div key={item.title} variants={itemVariants}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={getNavClassName(item.url)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Learning */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-sidebar-foreground/70 font-medium">
              Learning
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {learningItems.map((item) => (
                  <motion.div key={item.title} variants={itemVariants}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={getNavClassName(item.url)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Community */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-sidebar-foreground/70 font-medium">
              Community
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {communityItems.map((item) => (
                  <motion.div key={item.title} variants={itemVariants}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={getNavClassName(item.url)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </motion.div>
      </SidebarContent>
    </Sidebar>
  )
}