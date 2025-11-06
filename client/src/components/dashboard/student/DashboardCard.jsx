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
import toast from "react-hot-toast"


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


