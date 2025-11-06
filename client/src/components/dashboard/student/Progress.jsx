import { motion } from "framer-motion"
import { TrendingUp, Target, Clock, Calendar, BarChart3, Loader2 } from "lucide-react"
import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { DashboardLayout } from "@/components/dashboard/student/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress as ProgressBar } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getStudentByUserId, getCourseProgressDetails, getWeeklyActivity } from "../../../actions/studentAction"
import { getCourse } from "../../../actions/courseAction"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const Progress = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState({
    overallStats: [],
    courseProgress: [],
    weeklyActivity: [],
    weeklyTotals: {},
    weekRange: {},
    learningGoals: []
  })

  // Get current user and student data from Redux
  const { user } = useSelector(state => state.auth)
  const { userStudent, loading: studentLoading } = useSelector(state => state.student)
  const { courses } = useSelector(state => state.course)

  // Use refs to track previous values and prevent unnecessary re-renders
  const prevUserStudentRef = useRef()
  const prevCoursesRef = useRef([])
  const processingRef = useRef(false)
  const initializedRef = useRef(false)

  // Store token in ref to prevent recreation on every render
  const tokenRef = useRef(null)
  if (!tokenRef.current) {
    tokenRef.current = localStorage.getItem('token')
  }

  // Memoize utility functions to prevent re-creation on every render
  const formatTimeAgo = useCallback((date) => {
    if (!date) return "Never"
    
    const now = new Date()
    const diffMs = now - new Date(date)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    return `${Math.floor(diffDays / 7)} weeks ago`
  }, [])

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "completed": return "default"
      case "on-track": return "secondary" 
      case "behind": return "destructive"
      default: return "secondary"
    }
  }, [])

  // Memoize calculation functions with stable references
  const calculateOverallStats = useCallback((student) => {
    if (!student) return []

    const enrolledCourses = student.enrolledCourses || []
    const validCourses = enrolledCourses.filter(course => 
      course && course.courseId && (course.courseId._id || course.courseId)
    )
    
    const completedCourses = validCourses.filter(course => course.progress === 100).length
    const totalCourses = validCourses.length
    const completionPercentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0

    const quizScores = student.performanceScores?.filter(score => score && score.type === 'quiz') || []
    const averageQuizScore = quizScores.length > 0 
      ? Math.round(quizScores.reduce((sum, score) => sum + (score.score || 0), 0) / quizScores.length)
      : 0

    const studyStats = student.studyStats || {}
    const totalStudyHours = Math.round((studyStats.totalStudyTime || 0) / 60)
    const currentStreak = studyStats.currentStreak || 0

    return [
      { 
        label: "Courses Completed", 
        value: completedCourses, 
        total: totalCourses, 
        percentage: completionPercentage 
      },
      { 
        label: "Total Study Hours", 
        value: totalStudyHours, 
        unit: "hours" 
      },
      { 
        label: "Quiz Average", 
        value: averageQuizScore, 
        unit: "%" 
      },
      { 
        label: "Current Streak", 
        value: currentStreak, 
        unit: "days" 
      },
    ]
  }, [])

  const generateLearningGoals = useCallback((student) => {
    if (!student?.enrolledCourses) return []

    const validEnrollments = student.enrolledCourses.filter(enrollment => 
      enrollment && 
      enrollment.courseId && 
      (enrollment.courseId._id || enrollment.courseId) &&
      enrollment.progress < 100
    )

    return validEnrollments
      .slice(0, 3)
      .map((enrollment, index) => {
        const course = enrollment.courseId
        const progress = enrollment.progress || 0
        const courseTitle = course?.title || 'Unknown Course'
        const courseId = course?._id || course || 'unknown'
        
        let goalTitle, goalDescription, deadline, status
        
        if (progress >= 80) {
          goalTitle = `Complete ${courseTitle}`
          goalDescription = "Finish all remaining lessons and final project"
          deadline = "Dec 15, 2024"
          status = "on-track"
        } else if (progress >= 50) {
          goalTitle = `Reach 80% in ${courseTitle}`
          goalDescription = "Complete the next few modules and assessments"
          deadline = "Dec 30, 2024"
          status = progress >= 60 ? "on-track" : "behind"
        } else {
          goalTitle = `Build Foundation in ${courseTitle}`
          goalDescription = "Complete fundamental modules and first assessment"
          deadline = "Jan 15, 2025"
          status = progress >= 25 ? "on-track" : "behind"
        }

        return {
          id: `${courseId}-${progress}-${index}`,
          title: goalTitle,
          description: goalDescription,
          progress,
          deadline,
          status
        }
      })
  }, [])

  // FIXED: Stable course progress calculation
  const calculateCourseProgress = useCallback(async (student, token, courses, dispatch) => {
    if (!student?.enrolledCourses || !token) return []

    try {
      const validEnrollments = student.enrolledCourses.filter(enrollment => {
        if (!enrollment || !enrollment.courseId) {
          console.warn('Invalid enrollment found:', enrollment)
          return false
        }
        return true
      })

      const courseProgressPromises = validEnrollments.map(async (enrollment) => {
        try {
          const course = enrollment.courseId
          const courseId = course?._id || course
          
          if (!courseId) {
            console.warn('No valid courseId found in enrollment:', enrollment)
            return null
          }

          // Only dispatch if we don't already have the course data
          if (!courses.find(c => c._id === courseId)) {
            try {
              await dispatch(getCourse(courseId))
            } catch (courseError) {
              console.warn(`Failed to fetch course ${courseId}:`, courseError)
            }
          }
          
          // Get detailed progress with error handling
          try {
            await dispatch(getCourseProgressDetails(student._id, courseId, token))
          } catch (progressError) {
            console.warn(`Failed to get progress details for course ${courseId}:`, progressError)
          }

          const courseTitle = course?.title || 'Unknown Course'
          const totalModules = course?.modules?.length || 0
          const completedModules = enrollment.completedModules?.length || 0
          const progress = enrollment.progress || 0

          const estimatedHours = Math.max(1, Math.round(progress * 0.5))
          
          const lastAssignment = student.assignments
            ?.filter(a => a && a.courseId && a.courseId.toString() === courseId.toString())
            ?.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]
          
          const lastPerformance = student.performanceScores
            ?.filter(p => p && p.courseId && p.courseId.toString() === courseId.toString())
            ?.sort((a, b) => new Date(b.date) - new Date(a.date))[0]

          const lastActivityDate = lastAssignment?.submittedAt || lastPerformance?.date || enrollment.enrolledDate
          const lastActivity = formatTimeAgo(lastActivityDate)

          const nextMilestone = progress === 100 
            ? "Completed ✅"
            : progress >= 80 
            ? "Final Project"
            : progress >= 50 
            ? "Mid-term Assessment"
            : "Next Module"

          return {
            id: `course-${courseId}-${progress}`,
            title: courseTitle,
            progress,
            completedLessons: completedModules,
            totalLessons: totalModules,
            timeSpent: `${estimatedHours} hours`,
            lastActivity,
            nextMilestone,
            courseId: courseId.toString()
          }
        } catch (error) {
          console.error(`Error processing course enrollment:`, error)
          return null
        }
      })

      const results = await Promise.all(courseProgressPromises)
      return results.filter(Boolean)
    } catch (error) {
      console.error('Error calculating course progress:', error)
      return []
    }
  }, [formatTimeAgo])

  // FIXED: Stable weekly activity fetch
  const fetchWeeklyActivity = useCallback(async (studentId, token, dispatch) => {
    try {
      const result = await dispatch(getWeeklyActivity(studentId, token))
      return result || {
        weeklyActivity: [],
        weeklyTotals: {},
        weekRange: {}
      }
    } catch (error) {
      console.error('Error fetching weekly activity:', error)
      return {
        weeklyActivity: [],
        weeklyTotals: {},
        weekRange: {}
      }
    }
  }, [])

  // FIXED: Main data processing function with better state management
  const processStudentData = useCallback(async (student, token, courses, dispatch) => {
    if (!student || !token || processingRef.current) return

    try {
      processingRef.current = true
      setLoading(true)

      // Calculate synchronous data first
      const overallStats = calculateOverallStats(student)
      const learningGoals = generateLearningGoals(student)
      
      // FIXED: Update state immediately with sync data to prevent multiple renders
      setProgressData(prevData => ({
        ...prevData,
        overallStats,
        learningGoals
      }))
      
      // Fetch async data
      const [courseProgress, weeklyData] = await Promise.all([
        calculateCourseProgress(student, token, courses, dispatch),
        fetchWeeklyActivity(student._id, token, dispatch)
      ])
      
      // FIXED: Single state update for async data
      setProgressData(prevData => ({
        ...prevData,
        courseProgress,
        weeklyActivity: weeklyData.weeklyActivity || [],
        weeklyTotals: weeklyData.weeklyTotals || {},     
        weekRange: weeklyData.weekRange || {}
      }))
    
    } catch (error) {
      console.error('Error processing student data:', error)
      // Set empty data on error to prevent infinite loading
      setProgressData({
        overallStats: [],
        courseProgress: [],
        weeklyActivity: [],
        weeklyTotals: {},
        weekRange: {},
        learningGoals: []
      })
    } finally {
      setLoading(false)
      processingRef.current = false
    }
  }, [calculateOverallStats, calculateCourseProgress, fetchWeeklyActivity, generateLearningGoals])

  // FIXED: Fetch student data only once on mount
  useEffect(() => {
    if (user?.id && tokenRef.current && !initializedRef.current) {
      initializedRef.current = true
      dispatch(getStudentByUserId(user.id, tokenRef.current))
    }
  }, [dispatch, user?.id]) // Removed token from dependency array

  // FIXED: Better change detection with deep comparison for critical data
  const userStudentId = userStudent?._id
  const userStudentEnrolledCoursesLength = userStudent?.enrolledCourses?.length
  const coursesLength = courses?.length

  useEffect(() => {
    // Only process when we have all required data and it has meaningfully changed
    if (userStudent && !studentLoading && tokenRef.current) {
      const userStudentChanged = userStudentId !== prevUserStudentRef.current?.id
      const enrollmentCountChanged = userStudentEnrolledCoursesLength !== prevUserStudentRef.current?.enrolledCoursesLength
      const coursesChanged = coursesLength !== prevCoursesRef.current.length
      
      if (userStudentChanged || enrollmentCountChanged || coursesChanged) {
        // Update refs with stable data
        prevUserStudentRef.current = {
          id: userStudentId,
          enrolledCoursesLength: userStudentEnrolledCoursesLength
        }
        prevCoursesRef.current = courses
        
        processStudentData(userStudent, tokenRef.current, courses, dispatch)
      }
    }
  }, [userStudentId, userStudentEnrolledCoursesLength, coursesLength, studentLoading, dispatch, processStudentData])

  // FIXED: Stable loading condition
  const isLoading = loading || studentLoading || !userStudent

  // FIXED: Destructure with stable reference
  const { overallStats, courseProgress, weeklyActivity, weeklyTotals, weekRange, learningGoals } = progressData

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Learning Progress
            </h1>
            <p className="text-muted-foreground">Loading your progress...</p>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gradient-card shadow-card border-0">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-8 bg-muted rounded animate-pulse"></div>
                    <div className="h-2 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Learning Progress
          </h1>
          <p className="text-muted-foreground">
            Track your learning journey and achievements
          </p>
        </div>

        {/* Overall Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overallStats.map((stat, index) => (
            <motion.div
              key={`stat-${stat.label}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-card shadow-card border-0">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary">
                        {stat.value}
                      </span>
                      {stat.unit && (
                        <span className="text-sm text-muted-foreground">
                          {stat.unit}
                        </span>
                      )}
                    </div>
                    {stat.total && (
                      <div className="space-y-1">
                        <ProgressBar value={stat.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {stat.value} of {stat.total} completed
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Course Progress */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Course Progress
            </CardTitle>
            <CardDescription>
              Your progress across all enrolled courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courseProgress.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No enrolled courses found.</p>
                <p className="text-sm">Enroll in a course to start tracking your progress!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {courseProgress.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-muted/30 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{course.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                          <span>•</span>
                          <span>{course.timeSpent}</span>
                          <span>•</span>
                          <span>Last activity: {course.lastActivity}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={course.progress === 100 ? "default" : "secondary"}
                        className={course.progress === 100 ? "bg-green-500 text-white" : ""}
                      >
                        {course.progress}%
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <ProgressBar value={course.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Next: {course.nextMilestone}
                      </span>
                      {course.progress < 100 && (
                        <Button onClick={() => navigate(`/student/courses/${course.courseId}/learn`)} variant="outline" className="text-primary border-primary">
                          Continue Learning
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Activity */}
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
              <CardDescription>
                Your study hours this week
                {weekRange?.start && weekRange?.end && (
                  <span className="block text-xs mt-1">
                    {weekRange.start} to {weekRange.end}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No activity data available for this week.</p>
                  </div>
                ) : (
                  weeklyActivity.map((activity, index) => (
                    <motion.div
                      key={`activity-${activity.day}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-12 text-sm font-medium text-muted-foreground">
                        {activity.day}
                      </div>
                      <div className="flex-1 relative h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            activity.completed ? 'bg-green-500' : 'bg-muted-foreground'
                          }`}
                          style={{ width: `${Math.min((activity.hours / 5) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-right">
                        {activity.hours}h
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              {weeklyTotals && Object.keys(weeklyTotals).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Total</span>
                    <span className="font-medium">
                      {weeklyTotals.totalHours?.toFixed(1) || '0.0'}h
                    </span>
                  </div>
                  {weeklyTotals.activeDays !== undefined && (
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Active Days</span>
                      <span>{weeklyTotals.activeDays}/7 days</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Goals */}
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Goals
              </CardTitle>
              <CardDescription>
                Your current learning objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              {learningGoals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>All courses completed!</p>
                  <p className="text-sm">Great job on your learning journey!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {learningGoals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-muted/30 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {goal.description}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(goal.status)}>
                          {goal.status === "completed" ? "Completed" : 
                           goal.status === "on-track" ? "On Track" : 
                           "Behind"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <ProgressBar value={goal.progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {goal.deadline}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Progress