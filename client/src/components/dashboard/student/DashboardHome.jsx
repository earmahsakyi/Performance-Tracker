import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, TrendingUp, Target, FileText, MessageCircle } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { Student } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardHome() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // Mock student ID - in real app, get from auth context
      const studentId = localStorage.getItem('studentId') || '1';
      const response = await studentApi.getStudent(studentId);
      setStudent(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallProgress = () => {
    if (!student?.progress) return 0;
    const progressValues = Object.values(student.progress);
    return progressValues.length > 0 
      ? progressValues.reduce((acc, curr) => acc + curr, 0) / progressValues.length 
      : 0;
  };

  const getAveragePerformance = () => {
    if (!student?.performanceScores) return 0;
    const scores = Object.values(student.performanceScores);
    return scores.length > 0 
      ? scores.reduce((acc, curr) => acc + curr, 0) / scores.length 
      : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {student?.name || 'Student'}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's your learning progress overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student?.enrolledCourses?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active learning paths
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(getOverallProgress())}%</div>
            <Progress value={getOverallProgress()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(getAveragePerformance())}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student?.badges?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Achievement unlocked
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest badges and milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {student?.badges?.length ? (
              student.badges.slice(0, 3).map((badge) => (
                <div key={badge._id} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">{badge.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No badges earned yet. Keep learning!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <button className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                <BookOpen className="h-5 w-5" />
                <span>Continue Learning</span>
              </button>
              <button className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                <FileText className="h-5 w-5" />
                <span>View Assignments</span>
              </button>
              <button className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span>Join Discussion</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}