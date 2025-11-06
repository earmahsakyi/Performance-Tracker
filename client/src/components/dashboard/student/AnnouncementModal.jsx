import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Clock, 
  User, 
  Search, 
  Filter,
  ChevronDown,
  Bell,
  Calendar,
  BookOpen
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import { fetchAnnouncements, clearAnnouncementErrors } from '../../../actions/announcementAction';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AnnouncementsModal = ({ open, onClose, courseId = null }) => {
  const dispatch = useDispatch();
  const { announcements, loading, error } = useSelector((state) => state.announcement);
  const { courses } = useSelector((state) => state.course);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (open) {
      dispatch(fetchAnnouncements(courseId));
    }
  }, [dispatch, open, courseId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAnnouncementErrors());
    }
  }, [error, dispatch]);

  const getAuthorInitials = (author) => {
    if (!author) return 'A';
    return author
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  const formatFullDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy \'at\' h:mm a');
    } catch (error) {
      return 'Date unavailable';
    }
  };

  // Filter and sort announcements
  const filteredAnnouncements = announcements
    .filter(announcement => {
      const matchesSearch = 
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCourse = filterCourse === 'all' || 
        announcement.courseId === filterCourse;
      
      return matchesSearch && matchesCourse;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleBack = () => {
    setSelectedAnnouncement(null);
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    return course ? course.title : 'General';
  };

  const SkeletonItem = () => (
    <div className="p-4 rounded-lg bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-full" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <AnimatePresence mode="wait">
          {!selectedAnnouncement ? (
            // Announcements List View
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-primary rounded-lg">
                      <Bell className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold">
                        All Announcements
                      </DialogTitle>
                      <DialogDescription>
                        {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''} available
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Search and Filters */}
              <div className="px-6 py-4 space-y-3 border-b bg-muted/30">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!courseId && courses.length > 0 && (
                  <Select value={filterCourse} onValueChange={setFilterCourse}>
                    <SelectTrigger className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map(course => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Announcements List */}
              <ScrollArea className="flex-1 px-6 py-4">
                {loading ? (
                  <div className="space-y-4">
                    <SkeletonItem />
                    <SkeletonItem />
                    <SkeletonItem />
                  </div>
                ) : filteredAnnouncements.length > 0 ? (
                  <div className="space-y-3">
                    {filteredAnnouncements.map((announcement, index) => (
                      <motion.div
                        key={announcement._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group"
                        onClick={() => handleAnnouncementClick(announcement)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Author Avatar */}
                          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm flex-shrink-0">
                            {getAuthorInitials(announcement.author)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {announcement.title}
                              </h4>
                              <ChevronDown className="h-4 w-4 text-muted-foreground transform -rotate-90 flex-shrink-0" />
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {announcement.message}
                            </p>

                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{announcement.author}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(announcement.createdAt)}</span>
                              </div>
                              {announcement.courseId && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    <span>{getCourseTitle(announcement.courseId)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchQuery 
                        ? "Try adjusting your search query"
                        : "Check back later for updates from your instructors"
                      }
                    </p>
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          ) : (
            // Single Announcement Detail View
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="gap-2"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                    Back
                  </Button>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 px-6 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Author Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                      {getAuthorInitials(selectedAnnouncement.author)}
                    </div>
                    <div>
                      <div className="font-semibold">{selectedAnnouncement.author}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatFullDate(selectedAnnouncement.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Course Badge */}
                  {selectedAnnouncement.courseId && (
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      {getCourseTitle(selectedAnnouncement.courseId)}
                    </Badge>
                  )}

                  {/* Title */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedAnnouncement.title}
                    </h2>
                  </div>

                  {/* Message */}
                  <div className="prose prose-sm max-w-none">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {selectedAnnouncement.message}
                      </p>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Posted by {selectedAnnouncement.author}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeAgo(selectedAnnouncement.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementsModal;