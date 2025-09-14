import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle,DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, Video } from "lucide-react"
import { useDispatch, useSelector } from 'react-redux'
import { getSessionDetails, registerForSession, markAttendance } from '../../../actions/groupChatAction'

const SessionDetailsModal = ({ sessionId, open, onClose }) => {
  const dispatch = useDispatch()
  
  // Use separate useSelector hooks for each state property
  const sessionDetails = useSelector(state => state.studyGroup.sessionDetails[sessionId])
  const loading = useSelector(state => state.studyGroup.loading)

  useEffect(() => {
    if (open && sessionId) {
      dispatch(getSessionDetails(sessionId))
    }
  }, [open, sessionId, dispatch])

  const handleRegister = async () => {
    try {
      await dispatch(registerForSession(sessionId))
    } catch (error) {
      console.error('Failed to register for session:', error)
    }
  }

  const handleJoin = async () => {
    try {
      await dispatch(markAttendance(sessionId, 'attended'))
      // Here you would typically redirect to the video session
      window.open(sessionDetails.meetingLink, '_blank')
    } catch (error) {
      console.error('Failed to join session:', error)
    }
  }

  if (!sessionDetails) return null

  return (
   <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{sessionDetails.topic}</DialogTitle>
          <DialogDescription>
            Detailed information about the study session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{new Date(sessionDetails.scheduledDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{new Date(sessionDetails.scheduledDate).toLocaleTimeString()} ({sessionDetails.duration} minutes)</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>{sessionDetails.attendeeCount} attendees registered</span>
          </div>

          {sessionDetails.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{sessionDetails.description}</p>
            </div>
          )}

          {sessionDetails.agenda && sessionDetails.agenda.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Agenda</h4>
              <ul className="text-sm space-y-1">
                {sessionDetails.agenda.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            {!sessionDetails.userRegistered ? (
              <Button onClick={handleRegister} disabled={loading.registerSession}>
                Register for Session
              </Button>
            ) : sessionDetails.status === 'scheduled' ? (
              <Button variant="outline" disabled>
                Registered - Waiting for session
              </Button>
            ) : sessionDetails.status === 'ongoing' ? (
              <Button onClick={handleJoin}>
                <Video className="mr-2 h-4 w-4" />
                Join Session
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Session Completed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SessionDetailsModal