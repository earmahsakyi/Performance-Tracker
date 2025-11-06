import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Award, Download, Share, Calendar, ExternalLink, RefreshCw } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/student/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNavigate } from "react-router-dom";

// Redux actions
import {
  fetchCertificates,
  downloadCertificate,
  shareCertificate,
  resetCertificateError
} from "../../../actions/certificateAction"

// Redux selectors
import {
  selectCertificates,
  selectCertificateStats,
  selectCertificateLoading,
  selectCertificateErrors,
  selectDownloadLoading,
  selectIsFetching,
  selectLastFetched
} from "../../../reducers/certificateReducer";
import { getStudentByUserId } from "@/actions/studentAction"

const Certificates = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  
  // Redux state selectors
  const certificates = useSelector(selectCertificates)
  const stats = useSelector(selectCertificateStats)
  const loading = useSelector(selectCertificateLoading)
  const errors = useSelector(selectCertificateErrors)
  const isFetching = useSelector(selectIsFetching)
  const lastFetched = useSelector(selectLastFetched)
  const downloadLoadingStates = useSelector(selectDownloadLoading)
  const { user, token } = useSelector(state => state.auth)
  const userStudent = useSelector((state) => state.student.userStudent);
  const StudentID = userStudent?._id
  

  const { earned: earnedCertificates, upcoming: upcomingCertificates } = certificates
  useEffect(() => {
    if (user?._id && token) {
      dispatch(getStudentByUserId(user._id, token));
    }
  }, [dispatch, user?._id, token]);

  // Fetch certificates on component mount
  useEffect(() => {
    if (StudentID) {
      dispatch(fetchCertificates(StudentID))
    }
    
    // Clear any existing errors
    return () => {
      dispatch(resetCertificateError())
    }
  }, [dispatch, StudentID])

  // Handle certificate download
  const handleDownloadCertificate = (courseId, courseName) => {
    dispatch(downloadCertificate(courseId, courseName))
  }

  // Handle certificate sharing
  const handleShareCertificate = (certificate) => {
    dispatch(shareCertificate(certificate))
  }

  // Handle refresh certificates
  const handleRefreshCertificates = () => {
    if (StudentID) {
      dispatch(fetchCertificates(StudentID))
    }
  }

  // Navigate to continue course (you can customize this based on your routing)
  const handleContinueCourse = (courseId) => {
    // Navigate to course or show continue course modal
    navigate(`/student/courses/${courseId}/learn`)
   
    
  }

  // Certificate statistics for display
  const certificateStats = [
    { 
      label: "Certificates Earned", 
      value: stats.certificatesEarned, 
      color: "text-success" 
    },
    { 
      label: "In Progress", 
      value: stats.inProgress, 
      color: "text-warning" 
    },
    { 
      label: "Total Skills", 
      value: stats.totalSkills, 
      color: "text-primary" 
    },
    { 
      label: "Avg. Score", 
      value: `${stats.averageScore}%`, 
      color: "text-success" 
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Award className="h-8 w-8 text-primary" />
              Certificates & Achievements
            </h1>
            <p className="text-muted-foreground">
              Your earned certificates and learning achievements
            </p>
            {lastFetched && (
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(lastFetched).toLocaleString()}
              </p>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshCertificates}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error Alert */}
        {errors.fetch && (
          <Alert variant="destructive">
            <AlertDescription>
              {errors.fetch}
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(resetCertificateError())}
                className="ml-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isFetching && earnedCertificates.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading certificates...
            </div>
          </div>
        )}

        {/* Statistics */}
        {!isFetching && (
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
        )}

        {/* Earned Certificates */}
        {earnedCertificates.length > 0 && (
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
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                {earnedCertificates.map((cert, index) => {
                  const isDownloadLoading = downloadLoadingStates[cert.courseId] || false
                  
                  return (
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
                        {cert.skills && cert.skills.length > 0 && (
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
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/20">
                          <div className="space-y-1">
                            <p className="text-xs text-primary-foreground/60">Issue Date</p>
                            <p className="text-sm font-medium">
                              {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-primary-foreground/60">
                              ID: {cert.credentialId}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-white/20 hover:bg-white/30 text-white border-0"
                              disabled={loading.sharing}
                              onClick={() => handleShareCertificate(cert)}
                            >
                              <Share className="mr-2 h-4 w-4" />
                              {loading.sharing ? 'Sharing...' : 'Share'}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-white/20 hover:bg-white/30 text-white border-0"
                              disabled={isDownloadLoading || !cert.canDownload}
                              onClick={() => handleDownloadCertificate(cert.courseId, cert.course)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {isDownloadLoading ? 'Downloading...' : 'Download'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificates in Progress */}
        {upcomingCertificates.length > 0 && (
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
                          Est. completion: {new Date(cert.estimatedCompletion).toLocaleDateString()}
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
                    {cert.requirements && cert.requirements.length > 0 && (
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
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleContinueCourse(cert.courseId, cert.course)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Continue Course
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isFetching && earnedCertificates.length === 0 && upcomingCertificates.length === 0 && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Start learning to earn your first certificate! Enroll in courses and complete them to unlock achievements.
              </p>
              <Button onClick={() => window.location.href = '/courses'}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Download Error Alert */}
        {errors.download && (
          <Alert variant="destructive">
            <AlertDescription>
              Download failed: {errors.download.message}
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(resetCertificateError())}
                className="ml-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Share Error Alert */}
        {errors.share && (
          <Alert variant="destructive">
            <AlertDescription>
              Share failed: {errors.share}
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(resetCertificateError())}
                className="ml-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Certificates