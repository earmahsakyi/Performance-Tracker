import { motion } from "framer-motion";
import { Bell, Search, ChevronDown, User, Settings, LogOut, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect,useState } from "react";
import {logout} from '../../../actions/authAction';
import {getCurrentAdminProfile } from "../../../actions/adminAction";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import EditAdminProfileModal from "@/components/auth/EditAdminProfileModal";

export function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {profile} = useSelector((state) => state.admin)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
 

  useEffect(() => {
    dispatch(getCurrentAdminProfile());
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');

  }
  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shadow-card"
    >
      {/* Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, courses, announcements..."
            className="pl-10 bg-muted/50 border-0 focus:bg-background transition-colors"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 group-hover:bg-primary"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.photo} />
                <AvatarFallback className="bg-gradient-primary text-white">
                 <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || profile?.email)}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium group-hover:text-white">{profile?.fullName}</p>
                <p className="text-xs text-muted-foreground  group-hover:text-white">Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-hover">
            <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-muted" onClick={handleProfileClick}>
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 cursor-pointer hover:bg-muted text-destructive">
              <LogOut className="h-4 w-4"  />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <EditAdminProfileModal 
      isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        />
    </motion.header>
  );
}