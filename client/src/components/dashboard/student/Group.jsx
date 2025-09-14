import { motion } from "framer-motion"
import { Users, Plus, Calendar, MessageSquare, BookOpen, Video, UserPlus } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/student/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, } from "@/components/ui/avatar"
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import {
  getMyGroups,
  getRecommendedGroups,
  getUpcomingSessions,
  getGroupStats,
  joinGroup,
  createGroup,
  createSession,
  clearErrors,
  clearSuccess,
  leaveGroup
} from '../../../actions/groupChatAction'
import CreateGroupModal from './CreateGroupModal'
import GroupChatModal from './GroupChatModal'
import SessionDetailsModal from './SessionDetailsModal'
import CreateSessionModal from './CreateSessionModal'
import toast from "react-hot-toast"


const Groups = () => {
  const dispatch = useDispatch()
  const {
    myGroups,
    recommendedGroups,
    upcomingSessions,
    groupStats,
    loading,
    error,
    success
  } = useSelector(state => state.studyGroup);
  


  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showGroupChat, setShowGroupChat] = useState(null)
  const [showSessionDetails, setShowSessionDetails] = useState(null)
  const [showCreateSession, setShowCreateSession] = useState(null)

  useEffect(() => {
    
    dispatch(getMyGroups())
    dispatch(getRecommendedGroups())
    dispatch(getUpcomingSessions())
    dispatch(getGroupStats())
  }, [dispatch])

  // Improved error handling effect
  useEffect(() => {
    if (error) {
      console.error('Study group error:', error)
      toast.error(error)
      // Clear error after showing toast
      setTimeout(() => {
        dispatch(clearErrors())
      }, 100)
    }
    if (success) {
      console.log('Study group success:', success)
      toast.success(success)
      // Clear success message after showing toast
      setTimeout(() => {
        dispatch(clearSuccess())
      }, 100)
    }
  }, [error, success, dispatch])

  const handleJoinGroup = async (groupId) => {
    try {
      await dispatch(joinGroup(groupId))
      toast.success('Successfully joined the group!')
    } catch (error) {
      toast.error(error.message || 'Failed to join group')
    }
  }

  const handleCreateGroup = async (groupData) => {
    try {
      await dispatch(createGroup(groupData))
      setShowCreateGroup(false)
      toast.success('Group created successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to create group')
    }
  }

  // Add error logging for debugging
  const handleCreateSession = async (sessionData) => {
    console.log('Creating session with data:', sessionData)
    console.log('For group ID:', showCreateSession)
    
    try {
      const result = await dispatch(createSession(showCreateSession, sessionData))
      console.log('Session creation result:', result)
      setShowCreateSession(null)
      toast.success('Session created successfully!')
      
      // Refresh data after successful creation
      dispatch(getMyGroups())
      dispatch(getUpcomingSessions())
    } catch (error) {
      console.error('Session creation error in component:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || error.message || 'Failed to create session')
    }
  }

  const handleLeaveGroup = async (groupID) => {
    try{
    const results = await dispatch(leaveGroup(groupID))
   
    if (results?.success){
      toast.success("You left group successfully")
    }
  }catch(err){
  toast.error(err)
}
}

  const getCategoryColor = (category) => {
    switch (category) {
      case "Frontend Development": return "bg-blue-500"
      case "Backend Development": return "bg-green-500"
      case "Design": return "bg-purple-500"
      case "Full Stack": return "bg-yellow-500"
      case "Programming": return "bg-red-500"
      case "Career": return "bg-indigo-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Study Groups
            </h1>
            <p className="text-muted-foreground">
              Collaborate and learn together with your peers
            </p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
            onClick={() => setShowCreateGroup(true)}
            disabled={loading.createGroup}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>

        {/* Group Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Groups Joined", value: groupStats.groupsJoined || 0, color: "text-primary" },
            { label: "Study Sessions", value: groupStats.studySessions || 0, color: "text-success" },
            { label: "Hours Studied", value: groupStats.hoursStudied || 0, color: "text-warning" },
            { label: "Fellow Students", value: groupStats.fellowStudents || 0, color: "text-primary" }
          ].map((stat, index) => (
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

        {/* My Groups */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Study Groups
            </CardTitle>
            <CardDescription>
              Groups you're currently participating in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading.myGroups ? (
                <div className="text-center py-8">Loading groups...</div>
              ) : myGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  You haven't joined any groups yet
                </div>
              ) : (
                myGroups.map((group, index) => (
                  <motion.div
                    key={group._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getCategoryColor(group.category)} text-white`}>
                        <Users className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{group.name}</h3>
                              {group.isActive && (
                                <Badge className="bg-success/10 text-success border-success">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {group.description}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>Last activity: {new Date(group.lastActivity).toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{group.memberCount} members</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{group.formattedMeetingTime || 'No schedule set'}</span>
                            </div>
                            {group.nextSession && (
                              <div className="flex items-center gap-1">
                                <Video className="h-4 w-4" />
                                <span>Next: {new Date(group.nextSession.scheduledDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Member Avatars */}
                            <div className="flex -space-x-2">
                              {group.memberAvatars?.slice(0, 3).map((avatar, i) => (
                                <Avatar key={`${group._id}-avatar-${i}`} className="h-6 w-6 border-2 border-background">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {avatar}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {group.memberAvatars?.length > 3 && (
                                <div key={`${group._id}-more-avatars`} className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">
                                    +{group.memberAvatars.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowGroupChat(group._id)}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Chat
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-gradient-primary hover:opacity-90"
                                onClick={() => setShowCreateSession(group._id)}
                              >
                                <Video className="mr-2 h-4 w-4" />
                                Create Session
                              </Button>
                              <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-950"
                              onClick={() => handleLeaveGroup(group._id)}
                              >
                                  Leave Group
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recommended Groups */}
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Recommended Groups
              </CardTitle>
              <CardDescription>
                Groups that match your interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.recommendedGroups ? (
                  <div className="text-center py-8">Loading recommendations...</div>
                ) : recommendedGroups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recommended groups available
                  </div>
                ) : (
                  recommendedGroups.map((group, index) => (
                    <motion.div
                      key={group._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(group.category)} text-white`}>
                          <Users className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-2">
                          <h4 className="font-medium">{group.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {group.description}
                          </p>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{group.memberCount} members</span>
                            <span>•</span>
                            <span>{group.formattedMeetingTime || 'No schedule set'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                          {group.tags?.map((tag, index) => (
                            <Badge key={`${group._id}-tag-${index}`} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          </div>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => handleJoinGroup(group._id)}
                            disabled={loading.joinGroup}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Join Group
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-warning" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription>
                Your scheduled group study sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.upcomingSessions ? (
                  <div className="text-center py-8">Loading sessions...</div>
                ) : upcomingSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming sessions
                  </div>
                ) : (
                  upcomingSessions.map((session, index) => (
                    <motion.div
                      key={session.id }
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-muted/30 space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{session.topic}</h4>
                          <Badge variant="outline" className="text-xs">
                            {session.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.groupName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(session.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{new Date(session.scheduledDate).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{session.attendeeCount} attending</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowSessionDetails(session.id)}
                      >
                        View Details
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        {showCreateGroup && (
          <CreateGroupModal
            open={showCreateGroup}
            onClose={() => setShowCreateGroup(false)}
            onSubmit={handleCreateGroup}
            loading={loading.createGroup}
          />
        )}

        {showGroupChat && (
          <GroupChatModal
            groupId={showGroupChat}
            open={!!showGroupChat}
            onClose={() => setShowGroupChat(null)}
          />
        )}

        {showSessionDetails && (
          <SessionDetailsModal
            sessionId={showSessionDetails}
            open={!!showSessionDetails}
            onClose={() => setShowSessionDetails(null)}
          />
        )}

        {showCreateSession && (
          <CreateSessionModal
            groupId={showCreateSession}
            open={!!showCreateSession}
            onClose={() => setShowCreateSession(null)}
            onSubmit={handleCreateSession}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default Groups