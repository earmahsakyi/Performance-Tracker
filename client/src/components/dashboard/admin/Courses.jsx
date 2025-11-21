import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, MoreHorizontal, Edit, Trash2, Users, 
  BookOpen, Calendar, Eye, X, Loader2, AlertCircle,
  Filter, ChevronLeft, ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { DashboardLayout } from "./DashboardLayout";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  clearCourseErrors,
  clearCourseSuccess,
} from "../../../actions/courseAction";
import ModuleManagement from "./ModuleManagement";
import DeadlineManagement from "./DeadlineManagement";

export default function Courses() {
  const dispatch = useDispatch();

  // Redux state
  const {
    courses,
    coursesLoading,
    courseCreated,
    courseUpdated,
    courseDeleted,
    currentPage,
    totalPages,
    totalCourses,
    error,
    success,
  } = useSelector((state) => state.course);

  const { user } = useSelector((state) => state.auth);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [page, setPage] = useState(1);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [selectedCourseForModules, setSelectedCourseForModules] = useState(null);
  const [showDeadlineDialog, setShowDeadlineDialog] = useState(false);
  const [selectedCourseForDeadlines, setSelectedCourseForDeadlines] = useState(null);
  const limit = 10;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    category: "General",
    durationWeeks: "",
    startDate: "",
    endDate: "",
    price: "Free",
    level: "Beginner",
    thumbnail: "bg-gradient-to-br from-purple-500 to-purple-600",
    tags: "",
    
  });

  // Load courses on mount and when filters change
  useEffect(() => {
    const params = {
      page,
      limit,
      ...(categoryFilter !== "all" && { category: categoryFilter }),
      ...(statusFilter !== "all" && { isActive: statusFilter === "active" }),
      ...(searchTerm && { search: searchTerm }),
    };
    dispatch(getCourses(params));
  }, [dispatch, page, categoryFilter, statusFilter, searchTerm]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast.success(success, {
        duration: 3000,
        position: 'top-right',
      });
      dispatch(clearCourseSuccess());
      
      // Close dialogs on success
      if (courseCreated) {
        setShowCreateDialog(false);
        resetForm();
      }
      if (courseUpdated) {
        setShowEditDialog(false);
        setSelectedCourse(null);
      }
      if (courseDeleted) {
        setShowDeleteDialog(false);
        setSelectedCourse(null);
      }
      
      // Refresh courses
      dispatch(getCourses({ page, limit }));
    }

    if (error) {
      toast.error(error, {
        duration: 4000,
        position: 'top-right',
      });
      dispatch(clearCourseErrors());
    }
  }, [success, error, courseCreated, courseUpdated, courseDeleted, dispatch, page, limit]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      code: "",
      description: "",
      category: "General",
      durationWeeks: "",
      startDate: "",
      endDate: "",
      price: "Free",
      level: "Beginner",
      thumbnail: "bg-gradient-to-br from-purple-500 to-purple-600",
      tags: "",
    });
  };

  // Handle create course
  const handleCreateCourse = () => {
    if (!formData.title || !formData.code) {
      toast.error("Title and Code are required", {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    const courseData = {
      ...formData,
      durationWeeks: formData.durationWeeks ? parseInt(formData.durationWeeks) : undefined,
      tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
      instructors: [user._id], // Add current user as instructor
    };

    dispatch(createCourse(courseData));
  };

  // Handle edit course
  const handleEditCourse = () => {
    if (!formData.title || !formData.code) {
      toast.error("Title and Code are required", {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    const courseData = {
      ...formData,
      durationWeeks: formData.durationWeeks ? parseInt(formData.durationWeeks) : undefined,
      tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
    };

    dispatch(updateCourse(selectedCourse._id, courseData));
  };

  // Handle delete course
  const handleDeleteCourse = () => {
    if (selectedCourse) {
      dispatch(deleteCourse(selectedCourse._id));
    }
  };

  // Open edit dialog
  const openEditDialog = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title || "",
      code: course.code || "",
      description: course.description || "",
      category: course.category || "General",
      durationWeeks: course.durationWeeks || "",
      startDate: course.startDate ? course.startDate.split("T")[0] : "",
      endDate: course.endDate ? course.endDate.split("T")[0] : "",
      price: course.price || "Free",
      level: course.level || "Beginner",
      thumbnail: course.thumbnail || "bg-gradient-to-br from-purple-500 to-purple-600",
      tags: course.tags ? course.tags.join(", ") : "",
    });
    setShowEditDialog(true);
  };

  // Open delete dialog
  const openDeleteDialog = (course) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  };

  // Load course students
  const loadCourseStudents = async (course) => {
    setSelectedCourse(course);
    setLoadingStudents(true);
    setShowStudentsDialog(true);
    
    try {
      const result = await dispatch(getCourseStudents(course._id));
      if (result?.success && result?.student) {
        setCourseStudents(result?.student);
      }
    
    } catch (err) {
      toast.error("Failed to load students", {
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (isActive) => {
    return isActive
      ? "bg-success text-success-foreground"
      : "bg-muted text-muted-foreground";
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    const colors = {
      Fullstack: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "UI/UX": "bg-purple-500/10 text-purple-500 border-purple-500/20",
      General: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[category] || colors.General;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Courses</h1>
            <p className="text-muted-foreground">
              Manage all courses in your learning portal
            </p>
          </div>
          {(user?.role === "Admin" || user?.role === "Instructor") && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card p-4 rounded-lg shadow-card border border-border space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-0 focus:bg-background"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-muted/50 border-0">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Fullstack">Fullstack</SelectItem>
                <SelectItem value="UI/UX">UI/UX</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-muted/50 border-0">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Courses Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card rounded-lg shadow-card border border-border overflow-hidden"
        >
          {coursesLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No courses found matching your criteria.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="font-semibold">Course</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Level</TableHead>
                    <TableHead className="font-semibold">Students</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course, index) => (
                    <motion.tr
                      key={course._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      className="border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">
                            {course.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {course.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getCategoryColor(course.category)}
                        >
                          {course.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                          {course.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {course.enrolledStudents?.length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {course.durationWeeks
                          ? `${course.durationWeeks} weeks`
                          : "Not set"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeVariant(course.isActive)}>
                          {course.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-popover border border-border shadow-hover"
                          >
                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => loadCourseStudents(course)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Students
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => {
                                  setSelectedCourseForModules(course);
                                  setShowModuleDialog(true);
                                }}
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Manage Modules
                              </DropdownMenuItem>
                            {(user?.role === "Admin" ||
                              user?.role === "Instructor") && (
                              <>
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-muted"
                                  onClick={() => openEditDialog(course)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Course
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-muted"
                                  onClick={() => {
                                    setSelectedCourseForDeadlines(course);
                                    setShowDeadlineDialog(true);
                                  }}
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Manage Deadlines
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-muted text-destructive"
                                  onClick={() => openDeleteDialog(course)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Course
                                </DropdownMenuItem>
                                

                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * limit + 1} to{" "}
                    {Math.min(currentPage * limit, totalCourses)} of {totalCourses}{" "}
                    courses
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-sm text-muted-foreground"
        >
          Total: {totalCourses} courses
        </motion.div>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to your learning portal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Fullstack MERN Development"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Course Code *</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., MERN101"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Course description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fullstack">Fullstack</SelectItem>
                    <SelectItem value="UI/UX">UI/UX</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleSelectChange("level", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price</Label>
                <Select
                  value={formData.price}
                  onValueChange={(value) => handleSelectChange("price", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationWeeks">Duration (weeks)</Label>
                <Input
                  id="durationWeeks"
                  name="durationWeeks"
                  type="number"
                  value={formData.durationWeeks}
                  onChange={handleInputChange}
                  placeholder="12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="JavaScript, React, Node.js"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCourse}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Course Title *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Course Code *</Label>
                <Input
                  id="edit-code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fullstack">Fullstack</SelectItem>
                    <SelectItem value="UI/UX">UI/UX</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleSelectChange("level", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price</Label>
                <Select
                  value={formData.price}
                  onValueChange={(value) => handleSelectChange("price", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-durationWeeks">Duration (weeks)</Label>
                <Input
                  id="edit-durationWeeks"
                  name="durationWeeks"
                  type="number"
                  value={formData.durationWeeks}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedCourse(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCourse}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Course
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCourse?.title}"? This action
              cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedCourse(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Students Dialog */}
      <Dialog open={showStudentsDialog} onOpenChange={setShowStudentsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enrolled Students</DialogTitle>
            <DialogDescription>
              {selectedCourse?.title} ({selectedCourse?.code})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingStudents ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : courseStudents.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No students enrolled in this course yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.program || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${student.progress || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {student.progress || 0}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStudentsDialog(false);
                setSelectedCourse(null);
                setCourseStudents([]);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Module Management Dialog */}
        <ModuleManagement
          course={selectedCourseForModules}
          isOpen={showModuleDialog}
          onClose={() => {
            setShowModuleDialog(false);
            setSelectedCourseForModules(null);
          }}
        />
        <DeadlineManagement
          course={selectedCourseForDeadlines}
          isOpen={showDeadlineDialog}
          onClose={() => {
            setShowDeadlineDialog(false);
            setSelectedCourseForDeadlines(null);
          }}
        />
    </DashboardLayout>
  );
}