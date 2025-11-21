import React, { useState, useEffect} from "react"  ;
import { Bell, Search, Moon, Sun, Settings, User, LogOut, CloudLightning } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {logout } from '../../../actions/authAction';
import { getStudentByUserId } from "@/actions/studentAction";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import EditStudentProfileModal from "../../student/EditStudentProfileModal";

export function DashboardHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const {user, token} = useSelector((state) => state.auth);
  const userStudent = useSelector((state) => state.student.userStudent);
 

  useEffect(() => {
    if (user?._id && token) {
      dispatch(getStudentByUserId(user._id, token));
    }
  }, [dispatch, user?._id, token]);

  // const handleNotificationClick = () => {
  //   toast.success("No new notifications!")
  // }
  
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login');
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 w-full border-b bg-gradient-card backdrop-blur supports-[backdrop-filter]:bg-background/95 shadow-card"
      >
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2 rounded-xl shadow-glow">
                <div className="h-6 w-6 rounded bg-white/20" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Trackademy
                </h1>
                <p className="text-sm text-muted-foreground">Student Dashboard</p>
              </div>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses, notes, quizzes..."
                className="pl-10 bg-muted/50 border-0 focus-visible:bg-background transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="relative hover:bg-accent transition-colors"
            >
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse-glow"
              >
                3
              </Badge>
            </Button> */}

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <AvatarImage src={userStudent?.photo} />
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userStudent?.name || user?.email || 'Student')}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userStudent?.name || 'Student'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {userStudent?.studentId && (
                      <p className="text-xs text-muted-foreground">ID: {userStudent.studentId}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>

      {/* Edit Student Profile Modal */}
      <EditStudentProfileModal 
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
      />
    </>
  )
}