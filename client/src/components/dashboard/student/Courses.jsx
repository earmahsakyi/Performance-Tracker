import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, User, Play } from 'lucide-react';
import { studentApi, courseApi } from '@/lib/api';
import { Student, Course } from '@/types';
import toast from 'react-hot-toast';

export default function Courses() {
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState('');
  const [availableCourses, setAvailableCourses] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || '1';
      const [studentResponse, allCoursesResponse] = await Promise.all([
        studentApi.getStudent(studentId),
        courseApi.getAllCourses()
      ]);

      setStudent(studentResponse.data);
      const allCourses = allCoursesResponse.data;
      
      // Separate enrolled and available courses
      const enrolled = allCourses.filter(course => 
        studentResponse.data.enrolledCourses.includes(course._id)
      );
      const available = allCourses.filter(course => 
        !studentResponse.data.enrolledCourses.includes(course._id)
      );

      setCourses(enrolled);
      setAvailableCourses(available);
    } catch (error) {
      toast.error('Failed to load courses');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      await courseApi.enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      fetchData(); // Refresh data
    } catch (error) {
      toast.error('Failed to enroll in course');
      console.error('Error:', error);
    }
  };

  const CourseCard = ({ course, isEnrolled = false }) => {
    const progress = student?.progress?.[course._id] || 0;
    const performance = student?.performanceScores?.[course._id] || 0;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
            {course.thumbnail ? (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription className="mt-1">{course.description}</CardDescription>
            </div>
            <Badge variant="secondary">{course.level}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {course.instructor}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {course.duration}
            </div>
          </div>

          {isEnrolled && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              
              {performance > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Performance</span>
                  <span className="font-medium">{Math.round(performance)}%</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{course.category}</Badge>
              {!isEnrolled && (
                <span className="text-lg font-bold text-primary">
                  ${course.price}
                </span>
              )}
            </div>
            
            {isEnrolled ? (
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Continue
              </Button>
            ) : (
              <Button onClick={() => enrollInCourse(course._id)}>
                Enroll Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="aspect-video bg-muted animate-pulse rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and continue learning
        </p>
      </div>

      {courses.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} isEnrolled />
            ))}
          </div>
        </section>
      )}

      {availableCourses.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </section>
      )}

      {courses.length === 0 && availableCourses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              Check back later for new courses to explore!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}