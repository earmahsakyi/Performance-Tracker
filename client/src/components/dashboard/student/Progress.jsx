import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { Student } from '@/types';
import toast from 'react-hot-toast';

export default function ProgressPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || '1';
      const response = await studentApi.getStudent(studentId);
      setStudent(response.data);
    } catch (error) {
      toast.error('Failed to load progress data');
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted animate-pulse rounded" />
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
        <h1 className="text-3xl font-bold text-foreground">Progress & Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your learning journey and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(getOverallProgress())}%</div>
            <Progress value={getOverallProgress()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Across all enrolled courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(getAveragePerformance())}%</div>
            <Progress value={getAveragePerformance()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Average performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student?.badges?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Badges earned
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>Individual course completion rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {student?.progress && Object.keys(student.progress).length > 0 ? (
              Object.entries(student.progress).map(([courseId, progress]) => (
                <div key={courseId} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course {courseId.slice(-4)}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No course progress data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Your scores across different courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {student?.performanceScores && Object.keys(student.performanceScores).length > 0 ? (
              Object.entries(student.performanceScores).map(([courseId, score]) => (
                <div key={courseId} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course {courseId.slice(-4)}</span>
                    <span className="font-medium">{Math.round(score)}%</span>
                  </div>
                  <Progress value={score} />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No performance data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}