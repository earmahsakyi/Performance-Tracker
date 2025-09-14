import { motion } from "framer-motion"
import {
  TrendingUp,
  Clock,
  BookOpen,
  Trophy,
  Calendar,
  Download,
  Users,
  Target,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import toast from "react-hot-toast"

export function ProgressOverviewCard() {
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
              <span className="text-success font-semibold">68%</span>
            </div>
            <Progress value={68} className="h-2 bg-muted" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-success">12</div>
              <div className="text-sm text-muted-foreground">Completed Courses</div>
            </div>
            <div className="bg-warning/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-warning">5</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Recent Activity</div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">• Completed "React Hooks" quiz - 95%</div>
              <div className="text-xs text-muted-foreground">• Submitted UI/UX project proposal</div>
              <div className="text-xs text-muted-foreground">• Joined "Advanced CSS" study group</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function UpcomingDeadlinesCard() {
  const deadlines = [
    {
      title: "React Final Project",
      course: "Advanced React Development",
      date: "Dec 15, 2024",
      priority: "high",
    },
    {
      title: "UI Design Portfolio",
      course: "UI/UX Fundamentals", 
      date: "Dec 20, 2024",
      priority: "medium",
    },
    {
      title: "JavaScript Quiz #5",
      course: "Modern JavaScript",
      date: "Dec 22, 2024", 
      priority: "low",
    },
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "destructive"
      case "medium": return "warning" 
      case "low": return "secondary"
      default: return "secondary"
    }
  }

  return (
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
            {deadlines.map((deadline, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{deadline.title}</div>
                  <div className="text-sm text-muted-foreground">{deadline.course}</div>
                </div>
                <div className="text-right">
                  <Badge variant={getPriorityColor(deadline.priority) } className="mb-1">
                    {deadline.priority}
                  </Badge>
                  <div className="text-xs text-muted-foreground">{deadline.date}</div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => toast.success("Viewing all deadlines!")}>
            View All Deadlines
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function QuickAccessCard() {
  const quickActions = [
    { title: "Study Notes", icon: BookOpen, color: "bg-blue-500", count: "24 sets" },
    { title: "Practice Quizzes", icon: Trophy, color: "bg-yellow-500", count: "8 available" },
    { title: "Course Resources", icon: Download, color: "bg-green-500", count: "156 files" },
    { title: "Study Groups", icon: Users, color: "bg-purple-500", count: "3 groups" },
  ]

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
                className="flex-col h-auto p-4 hover:bg-primary transition-all duration-200 hover:shadow-glow"
                onClick={() => toast.success(`Opening ${action.title}!`)}
              >
                <div className={`p-3 rounded-lg ${action.color} text-white mb-2`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground hover:text-white">{action.count}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AchievementsCard() {
  const achievements = [
    { title: "First Quiz Master", description: "Scored 100% on first quiz", earned: true },
    { title: "Week Warrior", description: "Studied 7 days straight", earned: true },
    { title: "Social Learner", description: "Joined 3 study groups", earned: false },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-gradient-success rounded-lg">
              <Trophy className="h-4 w-4 text-success-foreground" />
            </div>
            Achievements
          </CardTitle>
          <CardDescription>Your learning milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                achievement.earned ? 'bg-success/10 border border-success/20' : 'bg-muted/30'
              }`}>
                <div className={`p-2 rounded-full ${
                  achievement.earned ? 'bg-success/20' : 'bg-muted'
                }`}>
                  <Trophy className={`h-4 w-4 ${
                    achievement.earned ? 'text-success' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.title}
                  </div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                </div>
                {achievement.earned && (
                  <Badge variant="outline" className="border-success text-success">
                    Earned
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AnnouncementsCard() {
  const announcements = [
    {
      title: "New Course: Advanced TypeScript",
      message: "Enroll now in our comprehensive TypeScript course",
      time: "2 hours ago",
      author: "Prof. Smith"
    },
    {
      title: "Holiday Schedule Update",
      message: "Classes will resume on January 8th, 2024",
      time: "1 day ago", 
      author: "Admin"
    },
    {
      title: "Study Group Formation",
      message: "Join study groups for final exam preparation",
      time: "2 days ago",
      author: "Academic Advisor"
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            Recent Announcements
          </CardTitle>
          <CardDescription>Latest updates from your instructors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {announcement.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{announcement.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2 mb-1">
                    {announcement.message}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{announcement.author}</span>
                    <span>•</span>
                    <span>{announcement.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => toast.success("Viewing all announcements!")}>
            View All Announcements
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}