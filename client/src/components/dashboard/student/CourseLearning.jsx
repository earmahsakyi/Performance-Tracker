import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Circle,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Upload,
  Loader2,
  AlertCircle,
  Award,
  Target,
  Clock,
  TrendingUp,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/student/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";

// Import Redux actions
import {
  getCourse,
  getCourseModules,
  clearCourseErrors,
  clearCourseSuccess,
} from "../../../actions/courseAction";
import {
  getStudentByUserId,
  submitAssignment,
  getStudentAssignments,
  submitQuiz,
  markModuleComplete,
  getCourseProgressDetails,
  updateCourseProgress,
} from "../../../actions/studentAction";

const CourseLearning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // FIXED: Better ref management with stable keys
  const initializationRef = useRef({
    courseData: false,
    studentData: false,
    studentCourseData: false,
  });

  // Redux state
  const { course, courseLoading, success, error } = useSelector((state) => state.course);
  const { user, token } = useSelector((state) => state.auth);
  const { userStudent, loading: studentLoading } = useSelector((state) => state.student);

  // FIXED: Store token in ref for stability
  const tokenRef = useRef(null);
  if (!tokenRef.current && token) {
    tokenRef.current = token;
  }

  // Local state
  const [activeModule, setActiveModule] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [courseProgressDetails, setCourseProgressDetails] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  // FIXED: Memoize stable IDs to prevent unnecessary re-renders
  const userId = useMemo(() => user?._id, [user?._id]);
  const userStudentId = useMemo(() => userStudent?._id, [userStudent?._id]);

  // FIXED: Single initialization effect for course data
  useEffect(() => {
    if (courseId && !initializationRef.current.courseData) {
      initializationRef.current.courseData = true;
      dispatch(getCourse(courseId));
      dispatch(getCourseModules(courseId));
    }
  }, [courseId, dispatch]);

  // FIXED: Single initialization effect for student data
  useEffect(() => {
    if (userId && tokenRef.current && !initializationRef.current.studentData) {
      initializationRef.current.studentData = true;
      dispatch(getStudentByUserId(userId, tokenRef.current));
    }
  }, [userId, dispatch]);

  // FIXED: Better controlled fetch for student course data
  useEffect(() => {
    const fetchStudentCourseData = async () => {
      if (!userStudentId || !courseId || !tokenRef.current || initializationRef.current.studentCourseData) {
        return;
      }

      initializationRef.current.studentCourseData = true;

      try {
        // Fetch both pieces of data in parallel
        const [progressDetails, assignments] = await Promise.all([
          dispatch(getCourseProgressDetails(userStudentId, courseId, tokenRef.current)),
          dispatch(getStudentAssignments(userStudentId, courseId, tokenRef.current))
        ]);

        // FIXED: Single batch state update
        if (progressDetails) {
          setCourseProgressDetails(progressDetails);
          setCompletedModules(progressDetails.completedModules || []);
        }
        
        if (assignments) {
          setCourseAssignments(assignments);
        }
      } catch (error) {
        console.error("Error fetching student course data:", error);
        // Reset flag on error for retry
        initializationRef.current.studentCourseData = false;
      }
    };

    fetchStudentCourseData();
  }, [userStudentId, courseId, dispatch]);

  // FIXED: Stable success/error handling
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearCourseSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearCourseErrors());
    }
  }, [success, error, dispatch]);

  // FIXED: Memoize enrollment check with stable references
  const isEnrolled = useMemo(() => {
    if (!userStudent?.enrolledCourses || !courseId) return false;
    
    return userStudent.enrolledCourses.some((enrollment) => {
      if (!enrollment?.courseId) return false;
      const enrollmentCourseId = enrollment.courseId._id || enrollment.courseId;
      return enrollmentCourseId === courseId;
    });
  }, [userStudent?.enrolledCourses, courseId]);

  const getCurrentEnrollment = useMemo(() => {
    if (!userStudent?.enrolledCourses || !courseId) return null;
    
    return userStudent.enrolledCourses.find((enrollment) => {
      if (!enrollment?.courseId) return false;
      const enrollmentCourseId = enrollment.courseId._id || enrollment.courseId;
      return enrollmentCourseId === courseId;
    });
  }, [userStudent?.enrolledCourses, courseId]);

  const currentProgress = useMemo(() => {
    return getCurrentEnrollment?.progress || 0;
  }, [getCurrentEnrollment]);

  // FIXED: Stable callback with proper dependencies
  const handleMarkModuleComplete = useCallback(async (moduleIndex) => {
    if (!userStudentId || markingComplete || completedModules.includes(moduleIndex)) {
      if (completedModules.includes(moduleIndex)) {
        toast.info("Module already completed!");
      }
      return;
    }

    setMarkingComplete(true);

    try {
      const result = await dispatch(markModuleComplete(userStudentId, courseId, moduleIndex, tokenRef.current));
      
      if (result) {
        // FIXED: Update local state immediately
        setCompletedModules(result.completedModules || []);
        toast.success("Module marked as complete!");
        
        // Only refresh if needed
        if (userId && tokenRef.current) {
          dispatch(getStudentByUserId(userId, tokenRef.current));
        }
        
        // Navigate to next module
        if (moduleIndex + 1 < (course?.modules?.length || 0)) {
          setTimeout(() => setActiveModule(moduleIndex + 1), 1000);
        }
        
        if (result.certificateIssued) {
          toast.success("🎉 Congratulations! You've earned your certificate!");
        }
      }
    } catch (error) {
      toast.error("Failed to mark module as complete");
      console.error("Error marking module complete:", error);
    } finally {
      setMarkingComplete(false);
    }
  }, [userStudentId, markingComplete, completedModules, dispatch, courseId, userId, course?.modules?.length]);

  // FIXED: Stable assignment submission with better error handling
  const handleAssignmentSubmission = useCallback(async (moduleIndex, assignmentIndex) => {
    if (!userStudentId || submissionLoading) return;

    if (!submissionText.trim() && !submissionFile) {
      toast.error("Please provide either text or file submission");
      return;
    }

    setSubmissionLoading(true);

    try {
      const assignmentData = {
        courseId,
        moduleIndex,
        assignmentIndex,
        title: course?.modules?.[moduleIndex]?.assignments?.[assignmentIndex]?.title || `Assignment ${assignmentIndex + 1}`,
        response: submissionText.trim(),
        fileUrl: submissionFile ? submissionFile.name : null,
      };

      const result = await dispatch(submitAssignment(userStudentId, assignmentData, tokenRef.current));
      
      if (result && result.success !== false) {
        // FIXED: Update assignments state immediately
        const updatedAssignments = await dispatch(getStudentAssignments(userStudentId, courseId, tokenRef.current));
        if (updatedAssignments) {
          setCourseAssignments(updatedAssignments);
        }
        
        // Clear form state
        setSubmissionText("");
        setSubmissionFile(null);
        setShowSubmissionForm(null);
        toast.success("Assignment submitted successfully!");
      } else {
        throw new Error(result?.error || "Submission failed");
      }
    } catch (error) {
      toast.error("Failed to submit assignment");
      console.error("Error submitting assignment:", error);
    } finally {
      setSubmissionLoading(false);
    }
  }, [userStudentId, submissionLoading, submissionText, submissionFile, course?.modules, courseId, dispatch]);

  // FIXED: Memoize utility functions
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const isAssignmentSubmitted = useCallback((moduleIndex, assignmentIndex) => {
    if (!Array.isArray(courseAssignments)) return false;
    
    return courseAssignments.some(
      (assignment) => assignment &&
        assignment.moduleIndex === moduleIndex &&
        assignment.assignmentIndex === assignmentIndex &&
        assignment.status !== "pending"
    );
  }, [courseAssignments]);

  const getAssignmentSubmission = useCallback((moduleIndex, assignmentIndex) => {
    if (!Array.isArray(courseAssignments)) return null;
    
    return courseAssignments.find(
      (assignment) => assignment &&
        assignment.moduleIndex === moduleIndex &&
        assignment.assignmentIndex === assignmentIndex
    );
  }, [courseAssignments]);

  // FIXED: Memoize performance stats calculation
  const performanceStats = useMemo(() => {
    if (!courseProgressDetails) return null;

    const stats = {
      assignmentsSubmitted: courseAssignments.filter((a) => a?.status !== "pending").length,
      assignmentsGraded: courseAssignments.filter((a) => a?.status === "graded").length,
      totalAssignments: course?.modules?.reduce((total, module) => total + (module.assignments?.length || 0), 0) || 0,
      averageGrade: 0,
      quizzesTaken: courseProgressDetails.performanceScores?.filter((p) => p?.type === "quiz").length || 0,
      averageQuizScore: 0,
    };

    const gradedAssignments = courseAssignments.filter((a) => a?.status === "graded" && a.grade);
    if (gradedAssignments.length > 0) {
      const totalGrade = gradedAssignments.reduce((sum, assignment) => {
        const grade = parseFloat(assignment.grade) || 0;
        return sum + grade;
      }, 0);
      stats.averageGrade = Math.round(totalGrade / gradedAssignments.length);
    }

    const quizScores = courseProgressDetails.performanceScores?.filter((p) => p?.type === "quiz") || [];
    if (quizScores.length > 0) {
      const totalScore = quizScores.reduce((sum, score) => sum + score.score, 0);
      stats.averageQuizScore = Math.round(totalScore / quizScores.length);
    }

    return stats;
  }, [courseProgressDetails, courseAssignments, course?.modules]);

  // FIXED: Reset flags only when truly necessary
  useEffect(() => {
    if (userStudentId && initializationRef.current.studentCourseData) {
      // Only reset if the student ID actually changed
      const prevId = initializationRef.current.prevStudentId;
      if (prevId && prevId !== userStudentId) {
        initializationRef.current.studentCourseData = false;
      }
      initializationRef.current.prevStudentId = userStudentId;
    }
  }, [userStudentId]);

  // FIXED: Memoize loading states
  const isLoading = useMemo(() => {
    return courseLoading || studentLoading;
  }, [courseLoading, studentLoading]);

  // FIXED: Memoize resource renderer to prevent recreations
  const renderResource = useCallback((resource, index) => {
    // Handle both string and object formats
    if (typeof resource === 'string') {
      return (
        <Card key={index} className="border-2">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Resource {index + 1}</p>
              <p className="text-sm text-muted-foreground">External Resource Link</p>
            </div>
            <Button
              variant="outline"
              asChild
              className="hover:bg-accent"
            >
              <a
                href={resource.startsWith('http') ? resource : `https://${resource}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Access Resource
              </a>
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // Handle object format
    return (
      <Card key={index} className="border-2">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">{resource.title}</p>
            <p className="text-sm text-muted-foreground">{resource.description}</p>
          </div>
          <Button
            variant="outline"
            asChild
            className="hover:bg-accent"
          >
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Access Resource
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading course...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Course not found or you don't have access to this course.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  if (!isEnrolled) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be enrolled in this course to access the learning materials.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/courses")}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-muted-foreground">
              {course.code} • {course.category} • {course.durationWeeks} weeks
            </p>
          </div>
        </div>

        {/* Enhanced Course Progress Overview */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Overall Progress</span>
                </div>
                <div className="space-y-2">
                  <Progress value={currentProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">{currentProgress}% complete</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">Modules</span>
                </div>
                <p className="text-2xl font-bold">
                  {completedModules.length}/{course.modules?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">completed</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Assignments</span>
                </div>
                <p className="text-2xl font-bold">
                  {performanceStats?.assignmentsSubmitted || 0}/{performanceStats?.totalAssignments || 0}
                </p>
                <p className="text-sm text-muted-foreground">submitted</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold">Average Grade</span>
                </div>
                <p className="text-2xl font-bold">{performanceStats?.averageGrade || 0}%</p>
                <p className="text-sm text-muted-foreground">{performanceStats?.assignmentsGraded || 0} graded</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">Certificate</span>
                </div>
                <Badge variant={getCurrentEnrollment?.certificateIssued ? "default" : "secondary"}>
                  {getCurrentEnrollment?.certificateIssued ? "Earned" : "In Progress"}
                </Badge>
                {getCurrentEnrollment?.certificateIssued && (
                  <p className="text-xs text-muted-foreground">Congratulations!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Module Navigation Sidebar */}
          <Card className="bg-gradient-card shadow-card border-0 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Modules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4">
                  {course.modules?.map((module, index) => {
                    const isCompleted = completedModules.includes(index);
                    const isActive = activeModule === index;

                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start p-4 h-auto ${
                            isActive ? "bg-primary" : "hover:bg-accent"
                          }`}
                          onClick={() => setActiveModule(index)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 flex-shrink-0" />
                            )}
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-medium truncate">Module {index + 1}</p>
                              <p className="text-sm opacity-80 truncate">{module.title}</p>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="space-y-6 lg:col-span-3">
            {course.modules && course.modules[activeModule] && (
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-card shadow-card border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-2xl">{course.modules[activeModule].title}</CardTitle>
                        <CardDescription className="text-base">
                          {course.modules[activeModule].description}
                        </CardDescription>
                      </div>
                      <Badge variant={completedModules.includes(activeModule) ? "default" : "secondary"}>
                        {completedModules.includes(activeModule) ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="content" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="assignments">
                          Assignments
                          {course.modules[activeModule].assignments && (
                            <Badge variant="secondary" className="ml-2">
                              {course.modules[activeModule].assignments.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                      </TabsList>

                      {/* Module Content */}
                      <TabsContent value="content" className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Module Overview</h3>
                          <p className="text-muted-foreground">
                            {course.modules[activeModule].description ||
                              "This module covers essential concepts and practical skills. Complete all activities and assignments to master the material."}
                          </p>
                          <div className="space-y-3">
                            <h4 className="font-medium">Learning Objectives</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              <li>Understand core concepts and principles</li>
                              <li>Apply knowledge through hands-on practice</li>
                              <li>Complete practical assignments</li>
                              <li>Demonstrate mastery of skills</li>
                            </ul>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            {!completedModules.includes(activeModule) && (
                              <Button
                                onClick={() => handleMarkModuleComplete(activeModule)}
                                disabled={markingComplete}
                                className="bg-gradient-primary hover:opacity-90"
                              >
                                {markingComplete ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                {markingComplete ? "Marking Complete..." : "Mark as Complete"}
                              </Button>
                            )}
                            {activeModule > 0 && (
                              <Button
                                variant="outline"
                                onClick={() => setActiveModule(activeModule - 1)}
                              >
                                Previous Module
                              </Button>
                            )}
                            {activeModule < (course.modules.length - 1) && (
                              <Button
                                variant="outline"
                                onClick={() => setActiveModule(activeModule + 1)}
                              >
                                Next Module
                              </Button>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      {/* Assignments Tab */}
                      <TabsContent value="assignments" className="space-y-6">
                        {course.modules[activeModule].assignments &&
                        course.modules[activeModule].assignments.length > 0 ? (
                          <div className="space-y-4">
                            {course.modules[activeModule].assignments.map((assignment, assignmentIndex) => {
                              const isSubmitted = isAssignmentSubmitted(activeModule, assignmentIndex);
                              const submissionData = getAssignmentSubmission(activeModule, assignmentIndex);

                              return (
                                <Card key={assignmentIndex} className="border-2">
                                  <CardHeader>
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-2">
                                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                                        <CardDescription>{assignment.description}</CardDescription>
                                        {assignment.dueDate && (
                                          <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4" />
                                            <span>Due: {formatDate(assignment.dueDate)}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        <Badge variant={isSubmitted ? "default" : "destructive"}>
                                          {submissionData?.status === "graded"
                                            ? "Graded"
                                            : submissionData?.status === "submitted"
                                            ? "Submitted"
                                            : "Pending"}
                                        </Badge>
                                        {submissionData?.grade && (
                                          <Badge variant="secondary" className="ml-2">
                                            Grade: {submissionData.grade}%
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    {isSubmitted ? (
                                      <div className="space-y-3">
                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                          <h4 className="font-medium mb-2">Your Submission</h4>
                                          {submissionData?.response && (
                                            <div className="space-y-2">
                                              <p className="text-sm text-muted-foreground">Response:</p>
                                              <p className="text-sm">{submissionData.response}</p>
                                            </div>
                                          )}
                                          {submissionData?.fileUrl && (
                                            <div className="space-y-2">
                                              <p className="text-sm text-muted-foreground">Submitted File:</p>
                                              <a
                                                href={submissionData.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-primary hover:underline"
                                              >
                                                <Download className="h-4 w-4" />
                                                Download Submission
                                              </a>
                                            </div>
                                          )}
                                          {submissionData?.feedback && (
                                            <div className="space-y-2">
                                              <p className="text-sm text-muted-foreground">Instructor Feedback:</p>
                                              <p className="text-sm">{submissionData.feedback}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : showSubmissionForm === assignmentIndex ? (
                                      <div className="space-y-4">
                                        <h4 className="font-medium">Submit Assignment</h4>
                                        <Textarea
                                          placeholder="Enter your assignment response here..."
                                          value={submissionText}
                                          onChange={(e) => setSubmissionText(e.target.value)}
                                          className="min-h-[100px]"
                                        />
                                        <div className="space-y-2">
                                          <p className="text-sm text-muted-foreground">Upload a file (optional):</p>
                                          <Input
                                            type="file"
                                            onChange={(e) => setSubmissionFile(e.target.files[0])}
                                            accept=".pdf,.doc,.docx"
                                          />
                                        </div>
                                        <div className="flex gap-3">
                                          <Button
                                            onClick={() => handleAssignmentSubmission(activeModule, assignmentIndex)}
                                            disabled={submissionLoading}
                                            className="bg-gradient-primary hover:opacity-90"
                                          >
                                            {submissionLoading ? (
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                              <Upload className="h-4 w-4 mr-2" />
                                            )}
                                            {submissionLoading ? "Submitting..." : "Submit Assignment"}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setSubmissionText("");
                                              setSubmissionFile(null);
                                              setShowSubmissionForm(null);
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <Button
                                        onClick={() => setShowSubmissionForm(assignmentIndex)}
                                        className="bg-gradient-primary hover:opacity-90"
                                      >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Submit Assignment
                                      </Button>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>No assignments available for this module.</AlertDescription>
                          </Alert>
                        )}
                      </TabsContent>

                      {/* Resources Tab */}
                      <TabsContent value="resources" className="space-y-6">
                        {course.modules[activeModule].resources && course.modules[activeModule].resources.length > 0 ? (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Module Resources</h3>
                            <div className="grid gap-4">
                              {course.modules[activeModule].resources.map((resource, index) => 
                                renderResource(resource, index)
                              )}
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>No resources available for this module.</AlertDescription>
                          </Alert>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Discussion Section */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Discussion
            </CardTitle>
            <CardDescription>Engage with peers and instructors about this module</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Discussion feature coming soon! Check back for updates.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CourseLearning;