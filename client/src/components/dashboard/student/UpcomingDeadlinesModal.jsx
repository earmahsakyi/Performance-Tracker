// components/dashboard/UpcomingDeadlinesModal.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 

  Clock, 
  User, 
  Search, 
  Filter,
  ChevronDown,
  Calendar,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fetchDeadlines} from '../../../actions/deadlineAction';
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

const UpcomingDeadlinesModal = ({ open, onClose, courseId = null }) => {
  const dispatch = useDispatch();
  const { deadlines, loading, } = useSelector((state) => state.deadline);
  const { courses } = useSelector((state) => state.course);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [sortBy, setSortBy] = useState('soonest');

  useEffect(() => {
    if (open) {
      dispatch(fetchDeadlines(courseId));
    }
  }, [dispatch, open, courseId]);



  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "secondary";
    }
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

  // Filter and sort deadlines
  const filteredDeadlines = deadlines
    .filter(deadline => {
      const matchesSearch = 
        deadline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deadline.courseName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCourse = filterCourse === 'all' || 
        deadline.courseId === filterCourse;
      
      return matchesSearch && matchesCourse;
    })
    .sort((a, b) => {
      if (sortBy === 'soonest') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'latest') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  const handleDeadlineClick = (deadline) => {
    setSelectedDeadline(deadline);
  };

  const handleBack = () => {
    setSelectedDeadline(null);
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
          {!selectedDeadline ? (
            // Deadlines List View
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
                      <Clock className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold">
                        All Deadlines
                      </DialogTitle>
                      <DialogDescription>
                        {filteredDeadlines.length} deadline{filteredDeadlines.length !== 1 ? 's' : ''} available
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
                      placeholder="Search deadlines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterCourse} onValueChange={setFilterCourse}>
                    <SelectTrigger className="w-[180px]">
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

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <ChevronDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soonest">Soonest First</SelectItem>
                      <SelectItem value="latest">Latest First</SelectItem>
                      <SelectItem value="priority">By Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                {loading ? (
                  <div className="space-y-4">
                    <SkeletonItem />
                    <SkeletonItem />
                    <SkeletonItem />
                  </div>
                ) : filteredDeadlines.length > 0 ? (
                  <div className="space-y-4">
                    {filteredDeadlines.map((deadline) => (
                      <motion.div
                        key={deadline._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleDeadlineClick(deadline)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{deadline.title}</div>
                          <Badge variant={getPriorityColor(deadline.priority)}>
                            {deadline.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {deadline.courseName}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatTimeAgo(deadline.date)}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>By {deadline.createdBy?.name || 'Instructor'}</span>
                          </div>
                          {deadline.courseId && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                <span>{getCourseTitle(deadline.courseId)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No deadlines found</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchQuery 
                        ? "Try adjusting your search query"
                        : "No upcoming assignments at the moment"
                      }
                    </p>
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          ) : (
            // Single Deadline Detail View
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
                  {/* Priority Badge */}
                  <Badge variant={getPriorityColor(selectedDeadline.priority)} className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {selectedDeadline.priority} Priority
                  </Badge>

                  {/* Title */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedDeadline.title}
                    </h2>
                  </div>

                  {/* Course Info */}
                  {selectedDeadline.courseId && (
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      {getCourseTitle(selectedDeadline.courseId)}
                    </Badge>
                  )}

                  {/* Date Info */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">Due Date:</span>
                      <span>{formatFullDate(selectedDeadline.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Time Remaining:</span>
                      <span>{formatTimeAgo(selectedDeadline.date)}</span>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                      {selectedDeadline.createdBy?.name?.[0] || 'I'}
                    </div>
                    <div>
                      <div className="font-semibold">Created by {selectedDeadline.createdBy?.name || 'Instructor'}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatFullDate(selectedDeadline.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Assigned by {selectedDeadline.createdBy?.name || 'Instructor'}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Created {formatTimeAgo(selectedDeadline.createdAt)}</span>
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

export default UpcomingDeadlinesModal;