import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Users, Clock, User, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { fetchAnnouncements, clearAnnouncementErrors } from '../../../actions/announcementAction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnnouncementsModal from './AnnouncementModal';

const AnnouncementsCard = ({ courseId = null, maxItems = 3 }) => {
  const dispatch = useDispatch();
  const { announcements, loading, error } = useSelector((state) => state.announcement);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAnnouncements(courseId));
  }, [dispatch, courseId]);

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

  const handleAnnouncementClick = (announcement) => {
    // Open modal with this announcement selected
    setShowModal(true);
  };

  const displayAnnouncements = announcements.slice(0, maxItems);

  // Skeleton loader component
  const SkeletonItem = () => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
      <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted rounded animate-pulse w-full" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        <div className="flex gap-2">
          <div className="h-3 bg-muted rounded animate-pulse w-16" />
          <div className="h-3 bg-muted rounded animate-pulse w-12" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Bell className="h-4 w-4 text-white" />
              </div>
              Recent Announcements
            </CardTitle>
            <CardDescription>Latest updates from your instructors</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {loading ? (
                // Show skeleton loaders
                <>
                  <SkeletonItem />
                  <SkeletonItem />
                  <SkeletonItem />
                </>
              ) : displayAnnouncements.length > 0 ? (
                // Show announcements
                <>
                  {displayAnnouncements.map((announcement, index) => (
                    <motion.div
                      key={announcement._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleAnnouncementClick(announcement)}
                    >
                      {/* Author Avatar */}
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm">
                        {getAuthorInitials(announcement.author)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {announcement.title}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2 mb-2 mt-1">
                          {announcement.message}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{announcement.author}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(announcement.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* View All Button */}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setShowModal(true)}
                  >
                    View All Announcements
                  </Button>
                </>
              ) : (
                // No announcements state
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">No announcements available</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Check back later for updates from your instructors
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Announcements Modal */}
      <AnnouncementsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        courseId={courseId}
      />
    </>
  );
};

export default AnnouncementsCard;