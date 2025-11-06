import React,{ useEffect} from "react"
import { DashboardLayout } from "@/components/dashboard/student/DashboardLayout"
import AnnouncementsCard from "./AnnouncementsCard"
import { QuickAccessCard } from "./QuickAccessCard"
import AchievementsCard from "./Achievements"
import  UpcomingDeadlinesCard  from "./UpcomingDeadlinesCard"
import ProgressOverviewCard from "./ProgressOverviewCard"
import { useSelector,useDispatch } from "react-redux"
import { getStudentByUserId } from "@/actions/studentAction"


const Index = () => {
  const dispatch = useDispatch();
  const  userStudent = useSelector((state) => state.student.userStudent);
  const  {user, token} = useSelector((state) => state.auth);
  
 useEffect(() => {
    if (user?._id && token) {
      dispatch(getStudentByUserId(user._id, token));
    }
  }, [dispatch, user?._id, token]);
  
  const myName = userStudent?.name.split(" ")[1];  

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back 👋, {myName}
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to continue your learning journey? Here's what's happening in your courses.
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Progress Overview - Takes full width on mobile, spans 2 cols on larger screens */}
          <div className="md:col-span-2 lg:col-span-2">
            <ProgressOverviewCard />
          </div>
          
          {/* Quick Access */}
          <div className="lg:col-span-1">
            <QuickAccessCard />
          </div>

          {/* Upcoming Deadlines */}
          <div className="md:col-span-1 lg:col-span-1">
            <UpcomingDeadlinesCard />
          </div>

          {/* Achievements */}
          <div className="md:col-span-1 lg:col-span-1">
            <AchievementsCard />
          </div>

          {/* Announcements - Full width */}
          <div className="md:col-span-2 lg:col-span-1">
            <AnnouncementsCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Index