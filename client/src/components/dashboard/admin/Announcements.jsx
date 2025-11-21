import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Plus, Trash2, Calendar, User, Megaphone, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "./DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import toast from "react-hot-toast";
import {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  clearAnnouncementErrors,
} from "../../../actions/announcementAction";
import { getCourses } from "../../../actions/courseAction";

export default function Announcements() {
  const dispatch = useDispatch();

  // Redux state
  const {
    announcements,
    loading,
    error,
    creating,
    deleting,
    success,
  } = useSelector((state) => state.announcement);

  const { user } = useSelector((state) => state.auth);
  const { courses } = useSelector((state) => state.course);
  

  // Local state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [courseFilter, setCourseFilter] = useState("all");
  const [hasLoadedCourses, setHasLoadedCourses] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    author: "",
    course: "",
  });

  // Load initial data - only once on mount
  useEffect(() => {
    dispatch(fetchAnnouncements());
    
    // Only load courses if not already loaded
    if (!hasLoadedCourses && (!courses || courses.length === 0)) {
      dispatch(getCourses({ page: 1, limit: 100 }));
      setHasLoadedCourses(true);
    }
  }, [dispatch, hasLoadedCourses]); // Remove courses from dependencies

  // Set author from logged-in user - only when user changes
  useEffect(() => {
    if (user?.role && !formData.author) {
      setFormData((prev) => ({ ...prev, author: user.email }));
    }
  }, [user?.role]); // Only depend on user.email

  // Handle success with specific conditions
  useEffect(() => {
    if (success) {
      toast.success("Operation completed successfully!", {
        duration: 3000,
        position: "top-right",
      });
      
      // Refetch announcements after successful operation
      dispatch(fetchAnnouncements());
      
      if (creating) {
        setShowCreateDialog(false);
        resetForm();
      }
      
      if (deleting) {
        setShowDeleteDialog(false);
        setSelectedAnnouncement(null);
      }
    }
  }, [success, creating, deleting, dispatch]);

  // Handle errors - only when error changes
  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 4000,
        position: "top-right",
      });
      dispatch(clearAnnouncementErrors());
    }
  }, [error]); // Remove dispatch from dependencies if it's stable

  // Memoized handler functions
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      message: "",
      author: user?.role || "",
      course: "",
    });
  }, [user?.role]);

  // Create announcement
  const handleCreateAnnouncement = useCallback(() => {
    if (!formData.title || !formData.message) {
      toast.error("Title and message are required", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    const announcementData = {
      title: formData.title,
      message: formData.message,
      author: formData.author || user?.role || "Unknown",
      course: formData.course || null,
    };

    dispatch(createAnnouncement(announcementData));
    setShowCreateDialog(false)
  }, [formData, user?.role, dispatch]);

  // Delete announcement
  const handleDeleteAnnouncement = useCallback(() => {
    if (selectedAnnouncement) {
      dispatch(deleteAnnouncement(selectedAnnouncement._id));
    }
  }, [selectedAnnouncement, dispatch]);

  // Open delete dialog
  const openDeleteDialog = useCallback((announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteDialog(true);
  }, []);

  // Filter announcements by course - memoized
  const filteredAnnouncements = useCallback(() => {
    return announcements.filter((announcement) => {
      if (courseFilter === "all") return true;
      if (courseFilter === "general") return !announcement.course;
      return announcement.course === courseFilter;
    });
  }, [announcements, courseFilter]);

  // Format date - memoized
  const formatDate = useCallback((date) => {
    if (!date) return "Unknown date";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Get course name - memoized
  const getCourseName = useCallback((courseId) => {
    if (!courseId) return "General";
    const course = courses?.find((c) => c._id === courseId);
    return course ? course.code : "Unknown Course";
  }, [courses]);

  // Get badge color for course - memoized
  const getCourseBadgeColor = useCallback((courseId) => {
    if (!courseId) return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    return "bg-blue-500/10 text-blue-700 border-blue-500/20";
  }, []);

  const currentFilteredAnnouncements = filteredAnnouncements();

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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Announcements
            </h1>
            <p className="text-muted-foreground">
              Manage and publish announcements for your learning portal
            </p>
          </div>
          {(user?.role === "Admin" || user?.role === "Instructor") && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          )}
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card p-4 rounded-lg shadow-card border border-border"
        >
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Filter by:</Label>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-64 bg-muted/50 border-0">
                <SelectValue placeholder="All announcements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Announcements</SelectItem>
                <SelectItem value="general">General Only</SelectItem>
                {courses?.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.code} - {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : currentFilteredAnnouncements.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-center py-12 bg-card rounded-lg border border-border"
          >
            <Megaphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
            <p className="text-muted-foreground mb-6">
              {courseFilter !== "all"
                ? "No announcements found for this filter"
                : "Create your first announcement to get started"}
            </p>
            {(user?.role === "Admin" || user?.role === "Instructor") && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            )}
          </motion.div>
        ) : (
          /* Announcements Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentFilteredAnnouncements.map((announcement, index) => (
              <motion.div
                key={announcement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
              >
                <Card className="shadow-card hover:shadow-hover transition-all duration-300 border border-border h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={getCourseBadgeColor(announcement.course)}
                      >
                        {getCourseName(announcement.course)}
                      </Badge>
                      {(user?.role === "Admin" || user?.role === "Instructor") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => openDeleteDialog(announcement)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground leading-tight">
                      {announcement.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {announcement.message}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{announcement.author}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{formatDate(announcement.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && currentFilteredAnnouncements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-sm text-muted-foreground"
          >
            Showing {currentFilteredAnnouncements.length} of {announcements.length}{" "}
            announcement{announcements.length !== 1 ? "s" : ""}
          </motion.div>
        )}
      </div>

      {/* Create Announcement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              Publish an announcement for students and instructors
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Important: Class Schedule Change"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Write your announcement message..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Your name or email"
                />
              </div>

              <div className="space-y-2">
                <Label>Course (Optional)</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) =>
                    handleSelectChange("course", value === "general" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="General announcement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General (All users)</SelectItem>
                    {courses?.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Announcement"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Announcement
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedAnnouncement?.title}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedAnnouncement(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAnnouncement}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Announcement"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}