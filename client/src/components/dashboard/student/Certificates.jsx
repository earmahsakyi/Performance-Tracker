import { motion } from "framer-motion"
import { Award, Download, Share, Calendar, ExternalLink } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"

const Certificates = () => {
  const earnedCertificates = [
    {
      title: "React Fundamentals Completion",
      course: "Complete React Development",
      issueDate: "November 15, 2024",
      completionScore: 95,
      credentialId: "CERT-REACT-2024-1156",
      status: "Active",
      skills: ["React", "JSX", "Components", "State Management"],
    },
    {
      title: "JavaScript ES6+ Mastery",
      course: "Modern JavaScript Development",
      issueDate: "October 28, 2024",
      completionScore: 92,
      credentialId: "CERT-JS-2024-1089",
      status: "Active",
      skills: ["ES6+", "Async/Await", "Promises", "Array Methods"],
    },
    {
      title: "CSS Advanced Techniques",
      course: "Advanced CSS & Styling",
      issueDate: "September 22, 2024",
      completionScore: 88,
      credentialId: "CERT-CSS-2024-0943",
      status: "Active",
      skills: ["CSS Grid", "Flexbox", "Animations", "Responsive Design"],
    },
  ]

  const upcomingCertificates = [
    {
      title: "UI/UX Design Principles",
      course: "Complete UI/UX Design Course",
      progress: 78,
      estimatedCompletion: "December 20, 2024",
      requirements: ["Complete all modules", "Submit final project", "Pass final assessment"],
    },
    {
      title: "Node.js Backend Development",
      course: "Full-Stack MERN Development", 
      progress: 45,
      estimatedCompletion: "January 15, 2025",
      requirements: ["Complete server modules", "Build REST API", "Database integration"],
    },
  ]

  const certificateStats = [
    { label: "Certificates Earned", value: 3, color: "text-success" },
    { label: "In Progress", value: 2, color: "text-warning" },
    { label: "Total Skills", value: 12, color: "text-primary" },
    { label: "Avg. Score", value: "92%", color: "text-success" },
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Certificates & Achievements
          </h1>
          <p className="text-muted-foreground">
            Your earned certificates and learning achievements
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {certificateStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-card shadow-card border-0">
                <CardContent className="p-6 text-center">
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Earned Certificates */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-success" />
              Earned Certificates
            </CardTitle>
            <CardDescription>
              Your completed course certifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
              {earnedCertificates.map((cert, index) => (
                <motion.div
                  key={cert.credentialId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-primary p-6 text-primary-foreground shadow-glow"
                >
                  {/* Certificate Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
                  </div>
                  
                  <div className="relative space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold">{cert.title}</h3>
                        <p className="text-primary-foreground/80">{cert.course}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          {cert.completionScore}%
                        </Badge>
                        <Award className="h-8 w-8" />
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <p className="text-sm text-primary-foreground/80">Skills Validated:</p>
                      <div className="flex flex-wrap gap-2">
                        {cert.skills.map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="secondary" 
                            className="bg-white/20 text-white border-0 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                      <div className="space-y-1">
                        <p className="text-xs text-primary-foreground/60">Issue Date</p>
                        <p className="text-sm font-medium">{cert.issueDate}</p>
                        <p className="text-xs text-primary-foreground/60">
                          ID: {cert.credentialId}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-0"
                          onClick={() => toast.success("Certificate shared!")}
                        >
                          <Share className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-0"
                          onClick={() => toast.success("Downloading certificate!")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certificates in Progress */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning" />
              Certificates in Progress
            </CardTitle>
            <CardDescription>
              Complete these courses to earn more certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {upcomingCertificates.map((cert, index) => (
                <motion.div
                  key={cert.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/30 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground">{cert.course}</p>
                      <p className="text-sm text-muted-foreground">
                        Est. completion: {cert.estimatedCompletion}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-warning text-warning">
                      {cert.progress}% Complete
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{cert.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary transition-all duration-500"
                        style={{ width: `${cert.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Requirements:</p>
                    <ul className="space-y-1">
                      {cert.requirements.map((req, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => toast.success(`Continuing ${cert.course}!`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Continue Course
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Certificates