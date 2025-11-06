// components/dashboard/UpcomingDeadlinesCard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchDeadlines} from '../../../actions/deadlineAction';
import { getStudentByUserId } from '../../../actions/studentAction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UpcomingDeadlinesModal from './UpcomingDeadlinesModal';

const UpcomingDeadlinesCard = ({ courseId = null, maxItems = 3 }) => {
  const dispatch = useDispatch();
  const { deadlines, loading } = useSelector((state) => state.deadline);
  const { user, token } = useSelector(state => state.auth);
  const { userStudent } = useSelector((state) => state.student);
  const studentId = userStudent?._id;
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user?._id && token) {
      dispatch(getStudentByUserId(user._id, token));
    }
  }, [dispatch, user?._id, token]);

  useEffect(() => {
    if (studentId) {
      dispatch(fetchDeadlines(studentId));
    }
  }, [dispatch, studentId]);


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

  const displayDeadlines = deadlines.slice(0, maxItems);

  // Skeleton loader component
  const SkeletonItem = () => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted rounded animate-pulse w-full" />
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
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Clock className="h-4 w-4 text-primary-foreground" />
              </div>
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Stay on top of your assignments</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {loading ? (
                // Show skeleton loaders
                <>
                  <SkeletonItem />
                  <SkeletonItem />
                  <SkeletonItem />
                </>
              ) : displayDeadlines.length > 0 ? (
                // Show deadlines
                <>
                  {displayDeadlines.map((deadline, index) => (
                    <motion.div
                      key={deadline._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
                      onClick={() => setShowModal(true)}
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate group-hover:text-primary transition-colors">
                          {deadline.title}
                        </div>
                        <div className="text-sm text-muted-foreground">{deadline.courseName}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getPriorityColor(deadline.priority)} className="mb-1">
                          {deadline.priority}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(deadline.date)}
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
                    View All Deadlines
                  </Button>
                </>
              ) : (
                // No deadlines state
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">No upcoming deadlines</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Check back later for new assignments
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deadlines Modal */}
      <UpcomingDeadlinesModal
        open={showModal}
        onClose={() => setShowModal(false)}
        courseId={courseId}
      />
    </>
  );
};

export default UpcomingDeadlinesCard;