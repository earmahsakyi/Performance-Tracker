import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { Student, Assignment } from '@/types';
import toast from 'react-hot-toast';

export default function Assignments() {
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
      toast.error('Failed to load assignments');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'destructive',
      submitted: 'secondary',
      graded: 'default'
    };

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const groupedAssignments = {
    pending: student?.assignments?.filter(a => a.status === 'pending') || [],
    submitted: student?.assignments?.filter(a => a.status === 'submitted') || [],
    graded: student?.assignments?.filter(a => a.status === 'graded') || []
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
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
        <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
        <p className="text-muted-foreground mt-2">
          Track your assignments and submissions across all courses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {groupedAssignments.pending.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {groupedAssignments.submitted.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {groupedAssignments.graded.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {groupedAssignments.pending.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-yellow-600">Pending Assignments</h2>
          <div className="space-y-4">
            {groupedAssignments.pending.map((assignment) => (
              <Card key={assignment._id} className={`${isOverdue(assignment.dueDate) ? 'border-destructive' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(assignment.status)}
                        {assignment.title}
                        {isOverdue(assignment.dueDate) && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {assignment.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(assignment.dueDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {getDaysUntilDue(assignment.dueDate)} days left
                      </div>
                    </div>
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Submit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {groupedAssignments.submitted.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-600">Submitted Assignments</h2>
          <div className="space-y-4">
            {groupedAssignments.submitted.map((assignment) => (
              <Card key={assignment._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(assignment.status)}
                        {assignment.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {assignment.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(assignment.dueDate)}
                      </div>
                      {assignment.submittedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Submitted: {formatDate(assignment.submittedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {groupedAssignments.graded.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Graded Assignments</h2>
          <div className="space-y-4">
            {groupedAssignments.graded.map((assignment) => (
              <Card key={assignment._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(assignment.status)}
                        {assignment.title}
                        {assignment.grade && (
                          <Badge variant="outline" className="ml-2">
                            Grade: {assignment.grade}%
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {assignment.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(assignment.dueDate)}
                      </div>
                      {assignment.submittedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Submitted: {formatDate(assignment.submittedAt)}
                        </div>
                      )}
                    </div>
                    {assignment.feedback && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Instructor Feedback:</p>
                        <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {!student?.assignments?.length && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
            <p className="text-muted-foreground">
              Assignments will appear here when you enroll in courses.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}