import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Users } from "lucide-react";
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
import { DashboardLayout } from "./DashboardLayout";
import { coursesData } from "./coursesDummy";

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = coursesData.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status) => {
    return status.toLowerCase() === "active" 
      ? "bg-success text-success-foreground"
      : "bg-muted text-muted-foreground";
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
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card p-4 rounded-lg shadow-card border border-border"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by title, code, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/50 border-0 focus:bg-background"
          />
        </div>
      </motion.div>

      {/* Courses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-card rounded-lg shadow-card border border-border overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-semibold">Course</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Instructors</TableHead>
              <TableHead className="font-semibold">Students</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Duration</TableHead>
              <TableHead className="font-semibold w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course, index) => (
              <motion.tr
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                className="border-border hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{course.title}</div>
                    <div className="text-sm text-muted-foreground">{course.code}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    {course.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {course.instructors.map((instructor, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        {instructor}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{course.enrolledStudents}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeVariant(course.status)}>
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{course.duration}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border border-border shadow-hover">
                      <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Course
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                        <Users className="h-4 w-4 mr-2" />
                        View Students
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-muted text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>

        {filteredCourses.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No courses found matching your search criteria.</p>
          </div>
        )}
      </motion.div>

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="text-sm text-muted-foreground"
      >
        Showing {filteredCourses.length} of {coursesData.length} courses
      </motion.div>
    </div>
    </DashboardLayout>
  );
}