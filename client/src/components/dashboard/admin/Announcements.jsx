import { motion } from "framer-motion";
import { Plus, Trash2, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "./DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { announcementsData } from "./announcementsDummy";

export default function Announcements() {
  const getPriorityBadgeVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryBadgeVariant = (category) => {
    switch (category.toLowerCase()) {
      case "general":
        return "bg-primary text-primary-foreground";
      case "courses":
        return "bg-accent text-accent-foreground";
      case "events":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Announcements</h1>
          <p className="text-muted-foreground">
            Manage and publish announcements for your learning portal
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Announcement
        </Button>
      </motion.div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcementsData.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <Card className="shadow-card hover:shadow-hover transition-all duration-300 border border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <Badge className={getPriorityBadgeVariant(announcement.priority)}>
                      {announcement.priority}
                    </Badge>
                    <Badge className={getCategoryBadgeVariant(announcement.category)}>
                      {announcement.category}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="text-lg font-semibold text-foreground leading-tight">
                  {announcement.title}
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {announcement.message}
                </p>
                
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>{announcement.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(announcement.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {announcementsData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground mb-4">No announcements yet.</p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Create your first announcement
          </Button>
        </motion.div>
      )}

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="text-sm text-muted-foreground"
      >
        Total announcements: {announcementsData.length}
      </motion.div>
    </div>
    </DashboardLayout>
  );
}