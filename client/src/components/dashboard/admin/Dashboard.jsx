import { motion } from "framer-motion";
import { Users, GraduationCap, BookOpen, Megaphone, User } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { DashboardLayout } from "./DashboardLayout";
import { dashboardStats, enrollmentTrendData, coursePopularityData } from "./userDummy";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { getAllUsers } from "@/actions/authAction";
import { getStudents } from "@/actions/studentAction";
import { getAdmins } from "@/actions/adminAction";
import { getCourses } from "@/actions/courseAction";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnnouncements } from "@/actions/announcementAction";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { users, loading, error,token } = useSelector((state) => state.auth);
  const {students } = useSelector(state=> state.student)
  const {admins} = useSelector(state=> state.admin)
  const {courses} = useSelector(state=> state.course)
  const {announcements} = useSelector(state=> state.announcement)
  // console.log(token)

  useEffect(() => {
    if (users.length === 0) {
      dispatch(getAllUsers());
    }
  }, [users.length,dispatch]);

  useEffect(()=> {
    if(students.length === 0){
      dispatch(getStudents());
  }
},[students.length,dispatch,token]);

useEffect(()=> {
  if(admins.length === 0){
    dispatch(getAdmins());
}
},[admins.length,dispatch]);

useEffect(()=> {
  if(courses.length === 0){
    dispatch(getCourses());
}
},[courses.length,dispatch]);

useEffect(()=> {
  if(announcements.length === 0){
    dispatch(fetchAnnouncements());
}
},[announcements.length,dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }


  const statsCards = [
    {
      title: "Total Users",
      value: users?.length,
      change: "+12% from last month",
      changeType: "positive",
      icon: Users,
    },
    {
      title: "Students",
      value: students?.length,
      change: "+8% from last month",
      changeType: "positive" ,
      icon: GraduationCap,
    },
    {
      title: "Instructors",
      value: admins?.length,
      change: "+2 new this month",
      changeType: "positive" ,
      icon: User,
    },
    {
      title: "Active Courses",
      value: courses?.length,
      change: "+5 this semester",
      changeType: "positive" ,
      icon: BookOpen,
    },
    {
      title: "Announcements",
      value: announcements?.length,
      change: "3 new this week",
      changeType: "neutral" ,
      icon: Megaphone,
    },
  ];

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your learning portal.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={stat.title}
            {...stat}
            index={index}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card p-6 rounded-lg shadow-card border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Student Enrollment Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-hover)",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Course Popularity Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-card p-6 rounded-lg shadow-card border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Course Popularity
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePopularityData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  type="category"
                  dataKey="course"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-hover)",
                  }}
                />
                <Bar 
                  dataKey="enrolled" 
                  fill="hsl(var(--accent))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="bg-card p-6 rounded-lg shadow-card border border-border"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { action: "New student registered", user: "Emma Davis", time: "2 minutes ago" },
            { action: "Course enrollment", user: "Michael Chen", time: "5 minutes ago" },
            { action: "Announcement published", user: "Dr. Sarah Johnson", time: "1 hour ago" },
            { action: "Forum post created", user: "David Brown", time: "2 hours ago" },
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.user}</p>
              </div>
              <p className="text-sm text-muted-foreground">{activity.time}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
    </DashboardLayout>
  );
}