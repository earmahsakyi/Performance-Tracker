import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { BookOpen, Play, Clock, Users, Star, Filter, Search, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/student/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"
import { getStudentByUserId } from "@/actions/studentAction"
// Import Redux actions
import {
  getCourses,
  advancedCourseSearch,
  enrollStudent,
  clearCourseErrors,
  clearCourseSuccess
} from "../../../actions/courseAction"

const Courses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const {
    courses,
    searchResults,
    coursesLoading,
    searchLoading,
    enrollmentLoading,
    currentPage,
    totalPages,
    totalCourses,
    success,
    error,
    studentEnrolled
  } = useSelector(state => state.course)


  // Get current user (assuming you have user state)
  const { user, token } = useSelector(state => state.auth)
 const userStudent = useSelector((state) => state.student.userStudent);



  // Local state
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterLevel, setFilterLevel] = useState("")
  const [filterPrice, setFilterPrice] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Course categories for filtering
  const courseCategories = [
    { name: "Frontend Development", count: 12, color: "bg-blue-500", value: "Fullstack" },
    { name: "Backend Development", count: 8, color: "bg-green-500", value: "Fullstack" },
    { name: "UI/UX Design", count: 6, color: "bg-purple-500", value: "UI/UX" },
    { name: "Database Management", count: 4, color: "bg-yellow-500", value: "General" },
  ]

  // Fetch courses on component mount
  useEffect(() => {
    dispatch(getCourses({
      page: 1,
      limit: 12,
      isActive: true
    }))
  }, [dispatch])

  useEffect(() => {
     if (studentEnrolled && user?._id && token) {
       dispatch(getStudentByUserId(user._id, token));
     }
   }, [dispatch, user?._id, token, studentEnrolled]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      dispatch(clearCourseSuccess())
    }
    if (error) {
      toast.error(error)
      dispatch(clearCourseErrors())
    }
  }, [success, error, dispatch])

  // Refresh student data when enrollment changes


  // Handle enrollment succes
  useEffect(() => {
    if (studentEnrolled) {
      // Refresh courses to get updated enrollment status
      dispatch(getCourses({
        page: currentPage,
        limit: 12,
        isActive: true
      }))
    }
  }, [studentEnrolled, dispatch, currentPage])

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim() && !filterCategory && !filterLevel && !filterPrice) {
      // If no search criteria, get all courses
      dispatch(getCourses({
        page: 1,
        limit: 12,
        isActive: true
      }))
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const searchParams = {
      q: searchQuery.trim() || undefined,
      category: filterCategory || undefined,
      level: filterLevel || undefined,
      price: filterPrice || undefined,
      isActive: true,
      page: 1,
      limit: 12
    }

    // Remove undefined values
    Object.keys(searchParams).forEach(key => 
      searchParams[key] === undefined && delete searchParams[key]
    )

    dispatch(advancedCourseSearch(searchParams))
  }

  // Handle enrollment
  const handleEnrollment = async (courseId, courseName) => {
    if (!user || !user._id) {
      toast.error("Please log in to enroll in courses")
      return
    }

    try {
      const results = await dispatch(enrollStudent(courseId, userStudent._id))
      if(results?.success){
      toast.success(`Successfully enrolled in ${courseName}!`)
      setTimeout(() => {
     navigate(`/student/courses/${courseId}/learn`)
      }, 1000)
      }
 
    } catch (error) {
      toast.error("Failed to enroll in course")
    }
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("")
    setFilterCategory("")
    setFilterLevel("")
    setFilterPrice("")
    setIsSearching(false)
    dispatch(getCourses({
      page: 1,
      limit: 12,
      isActive: true
    }))
  }

  // Get courses to display (search results or regular courses)
  const displayCourses = isSearching ? searchResults : courses

  // Check if student is enrolled in course
const isEnrolledInCourse = (course) => {
  if (!userStudent || !userStudent.enrolledCourses || !course) return false;
  
  return userStudent.enrolledCourses.some(enrollment => {
    if (!enrollment || !enrollment.courseId) return false;
    
    const enrollmentCourseId = enrollment.courseId._id || enrollment.courseId;
    const courseId = course._id || course;
    return enrollmentCourseId === courseId;
  });
};

  // Get student's progress in course
  // Get student's actual progress in course
const getCourseProgress = (course) => {
  if (!userStudent || !userStudent.enrolledCourses) return 0;
  
  const enrollment = userStudent.enrolledCourses.find(enrollment => {
    if (!enrollment || !enrollment.courseId) return false;
    
    const enrollmentCourseId = enrollment.courseId._id || enrollment.courseId;
    return enrollmentCourseId === course._id;
  });
  
  return enrollment ? enrollment.progress || 0 : 0;
};

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner": return "default"
      case "Intermediate": return "secondary"
      case "Advanced": return "destructive"
      default: return "outline"
    }
  }

  const getPriceColor = (price) => {
    return price === "Free" ? "default" : "outline"
  }
  

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Course Library
            </h1>
            <p className="text-muted-foreground">
              Explore and enroll in comprehensive learning courses
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalCourses > 0 && `${totalCourses} courses available`}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by title, instructor, or topic..."
                  className="pl-10 bg-muted/50 border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="hover:bg-accent"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter Courses
                </Button>
                <Button 
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {searchLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Search
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid gap-4 md:grid-cols-3 pt-4 border-t"
              >
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fullstack">Fullstack</SelectItem>
                    <SelectItem value="UI/UX">UI/UX</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPrice} onValueChange={setFilterPrice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>

                <div className="md:col-span-3 flex gap-2">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {courseCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-all cursor-pointer"
                onClick={() => {
                  setFilterCategory(category.value)
                  setIsSearching(true)
                  dispatch(advancedCourseSearch({
                    category: category.value,
                    isActive: true,
                    page: 1,
                    limit: 12
                  }))
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${category.color} text-white`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.count} courses
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Courses Grid */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              {isSearching ? "Search Results" : "Available Courses"}
            </CardTitle>
            <CardDescription>
              {isSearching && searchQuery 
                ? `Results for "${searchQuery}"`
                : "Discover new learning opportunities"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Loading State */}
            {(coursesLoading || searchLoading) && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading courses...</span>
              </div>
            )}

            {/* Empty State */}
            {!coursesLoading && !searchLoading && displayCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  {isSearching 
                    ? "Try adjusting your search criteria or filters"
                    : "No courses are currently available"
                  }
                </p>
                {isSearching && (
                  <Button variant="outline" onClick={clearFilters}>
                    View All Courses
                  </Button>
                )}
              </div>
            )}

            {/* Courses Grid */}
            {!coursesLoading && !searchLoading && displayCourses.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayCourses.map((course, index) => {
                  const isEnrolled = isEnrolledInCourse(course)
                  const progress = isEnrolled ? getCourseProgress(course) : 0

                  return (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <Card className="bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-all overflow-hidden h-full flex flex-col">
                        {/* Course Thumbnail */}
                        <div className={`h-48 ${course.thumbnail || 'bg-gradient-to-br from-purple-500 to-purple-600'} flex items-center justify-center relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="relative text-center text-white p-4">
                            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                            <Badge variant="secondary" className="bg-white/20 text-white border-0">
                              {course.category}
                            </Badge>
                          </div>
                          {isEnrolled && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-success text-success-foreground">
                                Enrolled
                              </Badge>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                          {/* Course Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Code: {course.code}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {course.description || "Learn comprehensive skills in this course"}
                            </p>
                          </div>

                          {/* Course Stats */}
                          <div className="grid grid-cols-2 gap-4 py-2 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{course.durationWeeks || 8} weeks</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <BookOpen className="h-4 w-4" />
                              <span>{course.modules?.length || 0} modules</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{course.enrolledStudents?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Star className="h-4 w-4 fill-current text-yellow-500" />
                              <span>{course.rating || 0}</span>
                            </div>
                          </div>

                          {/* Progress (if enrolled) */}
                          {isEnrolled && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            {progress === 100 && (
                              <Badge variant="default" className="w-full justify-center bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Course Completed
                              </Badge>
                            )}
                          </div>
                        )}

                          {/* Badges */}
                          <div className="flex items-center gap-2">
                            <Badge variant={getLevelColor(course.level)}>
                              {course.level || "Beginner"}
                            </Badge>
                            <Badge variant={getPriceColor(course.price)}>
                              {course.price || "Free"}
                            </Badge>
                            {course.tags && course.tags.length > 0 && (
                              <Badge variant="outline">
                                {course.tags[0]}
                              </Badge>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="mt-auto">
                            <Button 
                              className="w-full bg-gradient-primary hover:opacity-90"
                              onClick={() => {
                                if (isEnrolled) {
                                 navigate(`/student/courses/${course._id}/learn`)
                                } else {
                                  handleEnrollment(course._id, course.title)
                                }
                              }}
                              disabled={enrollmentLoading}
                            >
                              {enrollmentLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              {isEnrolled ? (
                                progress === 100 ? "Review Course" : "Continue Learning"
                              ) : (
                                course.price === "Free" ? "Enroll Free" : "Enroll Now"
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1 || coursesLoading}
                  onClick={() => {
                    const action = isSearching ? advancedCourseSearch : getCourses
                    dispatch(action({
                      ...(isSearching && {
                        q: searchQuery,
                        category: filterCategory,
                        level: filterLevel,
                        price: filterPrice
                      }),
                      page: currentPage - 1,
                      limit: 12,
                      isActive: true
                    }))
                  }}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages || coursesLoading}
                  onClick={() => {
                    const action = isSearching ? advancedCourseSearch : getCourses
                    dispatch(action({
                      ...(isSearching && {
                        q: searchQuery,
                        category: filterCategory,
                        level: filterLevel,
                        price: filterPrice
                      }),
                      page: currentPage + 1,
                      limit: 12,
                      isActive: true
                    }))
                  }}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Courses