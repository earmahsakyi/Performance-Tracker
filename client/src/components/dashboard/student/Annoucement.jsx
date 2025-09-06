import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Clock, AlertTriangle } from 'lucide-react';
import { studentApi, courseApi } from '@/lib/api';
import { Student, Course, Announcement } from '@/types';
import toast from 'react-hot-toast';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || '1';
      const studentResponse = await studentApi.getStudent(studentId);
      const student = studentResponse.data;

      // Fetch announcements from all enrolled courses
      const announcementPromises = student.enrolledCourses.map(async (courseId) => {
        try {
          const courseResponse = await courseApi.getCourse(courseId);
          const course = courseResponse.data;
          
          return course.announcements.map(announcement => ({
            ...announcement,
            courseName: course.title
          }));
        } catch (error) {
          console.error(`Failed to fetch course ${courseId}:`, error);
          return [];
        }
      });

      const nestedAnnouncements = await Promise.all(announcementPromises);
      const flatAnnouncements = nestedAnnouncements.flat();
      
      // Sort by creation date (newest first)
      flatAnnouncements.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAnnouncements(flatAnnouncements);
    } catch (error) {
      toast.error('Failed to load announcements');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date().getTime();
    const announcementTime = new Date(dateString).getTime();
    const diffInHours = Math.floor((now - announcementTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with the latest news from your courses
        </p>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement._id} className={announcement.isImportant ? 'border-destructive' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {announcement.isImportant ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : (
                        <Megaphone className="h-5 w-5 text-primary" />
                      )}
                      {announcement.title}
                      {announcement.isImportant && (
                        <Badge variant="destructive">Important</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{announcement.courseName}</Badge>
                      <span className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(announcement.createdAt)}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">{announcement.content}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Posted on {formatDate(announcement.createdAt)} by {announcement.createdBy}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No announcements yet</h3>
            <p className="text-muted-foreground">
              Announcements from your enrolled courses will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}