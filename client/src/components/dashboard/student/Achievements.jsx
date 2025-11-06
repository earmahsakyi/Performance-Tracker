import React, { useEffect} from 'react'
import {
  fetchCertificates,
 } from "../../../actions/certificateAction"
import { getStudentByUserId } from "@/actions/studentAction"
import {useDispatch, useSelector} from 'react-redux';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"




const  AchievementsCard = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth)
  const userStudent = useSelector((state) => state.student.userStudent);
  const earnedCertificates = useSelector((state) => state.certificates.earnedCertificates);
  const StudentID = userStudent?._id
  useEffect(() => {
    if (user?._id && token) {
      dispatch(getStudentByUserId(user._id, token));
    }
  }, [dispatch, user?._id, token]);

  useEffect(() => {
    if (StudentID) {
      dispatch(fetchCertificates(StudentID))
    }
  }, [dispatch, StudentID])


console.log(earnedCertificates)

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
          {earnedCertificates && earnedCertificates.length > 0 ? (
            earnedCertificates.map((cert, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20"
              >
                <div className="p-2 rounded-full bg-success/20">
                  <Trophy className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{cert.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {cert.course} — issued on{" "}
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </div>
                </div>
                {cert.canDownload && (
                  <Badge variant="outline" className="border-success text-success">
                    Earned
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No certificates earned yet.</p>
          )}
        </div>
      </CardContent>

      </Card>
    </motion.div>
  )
}

export default AchievementsCard