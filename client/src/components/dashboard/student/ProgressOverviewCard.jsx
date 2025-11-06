import { motion } from "framer-motion"
import { TrendingUp, Loader2 } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getStudentByUserId, getStudentStats } from "@/actions/studentAction"

const  ProgressOverviewCard = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  
  const { user } = useSelector(state => state.auth)
  const { userStudent, studentStats, loading: studentLoading } = useSelector(state => state.student)
  
  const tokenRef = useRef(null)
  const initializedRef = useRef(false)
  
  if (!tokenRef.current) {
    tokenRef.current = localStorage.getItem('token')
  }

  // Fetch student data on mount
  useEffect(() => {
    if (user?.id && tokenRef.current && !initializedRef.current) {
      initializedRef.current = true
      dispatch(getStudentByUserId(user.id, tokenRef.current))
    }
  }, [dispatch, user?.id])

  // Fetch stats when student data is available
  useEffect(() => {
    if (userStudent?._id && tokenRef.current) {
      dispatch(getStudentStats(userStudent._id, tokenRef.current))
    }
  }, [dispatch, userStudent?._id])

  // Process stats and recent activities
  useEffect(() => {
    if (studentStats && userStudent) {
      setStats(studentStats)
      
      // Get recent activities from assignments and quizzes
      const recentAssignments = (userStudent.assignments || [])
        .filter(a => a.submittedAt)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 2)
        .map(a => ({
          type: 'assignment',
          text: `Submitted "${a.title}" assignment`,
          date: a.submittedAt,
          status: a.status
        }))

      const recentQuizzes = (userStudent.performanceScores || [])
        .filter(score => score.type === 'quiz' && score.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 1)
        .map(quiz => ({
          type: 'quiz',
          text: `Completed "${quiz.title}" quiz - ${quiz.score}%`,
          date: quiz.date,
          score: quiz.score
        }))

      const combinedActivities = [...recentAssignments, ...recentQuizzes]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)

      setRecentActivities(combinedActivities)
      setLoading(false)
    } else if (!studentLoading && userStudent && !studentStats) {
      setLoading(false)
    }
  }, [studentStats, userStudent, studentLoading])

  // Calculate overall progress
  const calculateOverallProgress = useCallback(() => {
    if (!userStudent?.enrolledCourses) return 0
    
    const validCourses = userStudent.enrolledCourses.filter(c => c && c.courseId)
    if (validCourses.length === 0) return 0
    
    const totalProgress = validCourses.reduce((sum, course) => sum + (course.progress || 0), 0)
    return Math.round(totalProgress / validCourses.length)
  }, [userStudent])

  const overallProgress = calculateOverallProgress()

  if (loading || studentLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-gradient-success rounded-lg">
                <TrendingUp className="h-4 w-4 text-success-foreground" />
              </div>
              Progress Overview
            </CardTitle>
            <CardDescription>Loading your progress...</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Show message if no data
  if (!userStudent || !stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-gradient-success rounded-lg">
                <TrendingUp className="h-4 w-4 text-success-foreground" />
              </div>
              Progress Overview
            </CardTitle>
            <CardDescription>Your learning journey this semester</CardDescription>
          </CardHeader>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No progress data available yet.</p>
            <p className="text-sm mt-2">Enroll in courses to start tracking your progress!</p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const completedCourses = stats.overview?.coursesCompleted || 0
  const inProgressCourses = (stats.overview?.totalCoursesEnrolled || 0) - completedCourses

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-gradient-success rounded-lg">
              <TrendingUp className="h-4 w-4 text-success-foreground" />
            </div>
            Progress Overview
          </CardTitle>
          <CardDescription>Your learning journey this semester</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-success font-semibold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-muted" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-success">{completedCourses}</div>
              <div className="text-sm text-muted-foreground">Completed Courses</div>
            </div>
            <div className="bg-warning/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-warning">{inProgressCourses}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Recent Activity</div>
            {recentActivities.length > 0 ? (
              <div className="space-y-1">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    • {activity.text}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
export default ProgressOverviewCard