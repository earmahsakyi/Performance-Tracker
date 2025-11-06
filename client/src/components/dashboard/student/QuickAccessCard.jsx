import { motion } from "framer-motion"
import { BookOpen, Target, Users, FileText, Loader2 } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getStudentByUserId } from "@/actions/studentAction"
import { getMyGroups } from "@/actions/groupChatAction"

export function QuickAccessCard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [quickAccessData, setQuickAccessData] = useState({
    notesCount: 0,
    coursesCount: 0,
    assignmentsCount: 0,
    groupsCount: 0
  })

  const { user } = useSelector(state => state.auth)
  const { userStudent, loading: studentLoading } = useSelector(state => state.student)
  const { myGroups } = useSelector(state => state.studyGroup)
  
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
      // Also fetch study groups
      dispatch(getMyGroups())
    }
  }, [dispatch, user?.id])

  // Calculate counts when student data is available
  useEffect(() => {
    if (userStudent && !studentLoading) {
      const notesCount = userStudent.notes?.length || 0
      
      // Count enrolled courses (excluding completed ones for active courses)
      const coursesCount = userStudent.enrolledCourses?.filter(
        enrollment => enrollment && enrollment.courseId
      ).length || 0
      
      // Count pending/submitted assignments
      const assignmentsCount = userStudent.assignments?.filter(
        assignment => assignment && (assignment.status === 'pending' || assignment.status === 'submitted')
      ).length || 0
      
      // Count study groups from Redux state
      const groupsCount = myGroups?.length || 0
      
      setQuickAccessData({
        notesCount,
        coursesCount,
        assignmentsCount,
        groupsCount
      })
      
      setLoading(false)
    }
  }, [userStudent, studentLoading, myGroups])

  const quickActions = [
    { 
      title: "Study Notes", 
      icon: BookOpen, 
      color: "bg-blue-500", 
      count: quickAccessData.notesCount,
      path: "/student/notes"
    },
    { 
      title: "My Courses", 
      icon: Target, 
      color: "bg-green-500", 
      count: quickAccessData.coursesCount,
      path: "/courses"
    },
    { 
      title: "Assignments", 
      icon: FileText, 
      color: "bg-yellow-500", 
      count: quickAccessData.assignmentsCount,
      path: "/courses" // Navigate to courses where they can access assignments
    },
    { 
      title: "Study Groups", 
      icon: Users, 
      color: "bg-purple-500", 
      count: quickAccessData.groupsCount,
      path: "/student/groups"
    },
  ]

  const handleQuickAction = (action) => {
    navigate(action.path)
  }

  if (loading || studentLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Target className="h-4 w-4 text-primary-foreground" />
              </div>
              Quick Access
            </CardTitle>
            <CardDescription>Loading your activities...</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Target className="h-4 w-4 text-primary-foreground" />
            </div>
            Quick Access
          </CardTitle>
          <CardDescription>Jump into your learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex-col h-auto p-4 hover:bg-accent transition-all duration-200 hover:shadow-md group"
                onClick={() => handleQuickAction(action)}
              >
                <div className={`p-3 rounded-lg ${action.color} text-white mb-2 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground group-hover:text-foreground">
                  {action.count} {action.count === 1 ? 'item' : 'items'}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}