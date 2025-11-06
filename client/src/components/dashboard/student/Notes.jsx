import { motion } from "framer-motion"
import { Search, Filter, BookOpen, Download, Star, Clock, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/student/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDispatch, useSelector } from "react-redux"
import { getNotes, addNote, updateNote, deleteNote } from "../../../actions/noteAction";
import { getStudentByUserId } from "@/actions/studentAction"


const Notes = () => {
  const dispatch = useDispatch()
  const { notes, loading, error } = useSelector(state => state.note)
  const { user, token } = useSelector(state => state.auth);
  const { userStudent } = useSelector(state => state.student);

  const [studentId, setStudentId] = useState("") // You'll need to get this from auth or props
  const [selectedNote, setSelectedNote] = useState(null)
  const [isCreating, setIsCreating] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: "",
    subject: "",
    content: "",
    pages: 1
  })

    useEffect(() => {
    if (user?._id && token) {
      dispatch(getStudentByUserId(user._id, token));
    }
  }, [dispatch, user?._id, token]);

  //  fetch notes when student data is available
  useEffect(() => {
    if (userStudent?._id) {
    
      setStudentId(userStudent._id);
      dispatch(getNotes(userStudent._id));
    }
  }, [dispatch, userStudent?._id]);


  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleCreateNote =async () => {
    if (!noteForm.title || !noteForm.content) {
      toast.error("Title and content are required")
      return
    }
    try{
        const results =  await dispatch(addNote(studentId, noteForm))
        if (results?.success) {
        toast.success("Note created successfully!")
        setNoteForm({ title: "", subject: "", content: "", pages: 1 })
        setIsCreating(false)
      }
    }catch(err){
      toast.error(err)
    }
    
  }

  const handleUpdateNote =async () => {
    if (!selectedNote) return
    try{
       const results = await dispatch(updateNote(studentId, selectedNote._id, noteForm))
      if(results?.success) {
        toast.success("Note updated successfully!")
        setSelectedNote(null)
        setNoteForm({ title: "", subject: "", content: "", pages: 1 })
      }
    }catch(err){
      toast.error(err)
    }
   
  }

  const handleDownloadNote = (note) => {
    const element = document.createElement("a")
    const file = new Blob([note.content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${note.title}.txt`
    document.body.appendChild(element)
    element.click()
  };

  const handleDeleteClick = (note)=>{
    setNoteToDelete(note);
    setDeleteDialogOpen(true)

  };

  const handleDeleteConfirm = async ()=> {
    if(!noteToDelete) return;
    try{
      setDeleteLoading(true)
      await dispatch(deleteNote(studentId, noteToDelete._id));
      toast.success("Note deleted successfully!");
      setSelectedNote(null)
      setNoteForm({ title: "", subject: "", content: "", pages: 0 })
      setDeleteDialogOpen(false);
      setNoteToDelete(null);

    }catch(error){
      console.error('Error deleting student:', error);

    }finally {
      setDeleteLoading(false);
    }
  }

  const handleEditNote = (note) => {
    setSelectedNote(note)
    setNoteForm({
      title: note.title,
      subject: note.subject,
      content: note.content,
      pages: note.pages
    })
  }

  const noteCategories = [
  { name: "React Fundamentals", count: notes.filter(n => n.subject === "React Fundamentals").length, color: "bg-blue-500" },
  { name: "UI/UX Design", count: notes.filter(n => n.subject === "UI/UX Design").length, color: "bg-purple-500" },
  { name: "JavaScript ES6+", count: notes.filter(n => n.subject === "JavaScript ES6+").length, color: "bg-yellow-500" },
  { name: "Node.js Backend", count: notes.filter(n => n.subject === "Node.js Backend").length, color: "bg-green-500" },
  { name: "MongoDB Database", count: notes.filter(n => n.subject === "MongoDB Database").length, color: "bg-emerald-500" },
  { name: "Express.js API", count: notes.filter(n => n.subject === "Express.js API").length, color: "bg-cyan-500" },
  { name: "HTML & CSS Basics", count: notes.filter(n => n.subject === "HTML & CSS Basics").length, color: "bg-pink-500" },
  { name: "Tailwind CSS", count: notes.filter(n => n.subject === "Tailwind CSS").length, color: "bg-indigo-500" },
  { name: "Git & GitHub", count: notes.filter(n => n.subject === "Git & GitHub").length, color: "bg-red-500" },
  { name: "Deployment & Hosting", count: notes.filter(n => n.subject === "Deployment & Hosting").length, color: "bg-orange-500" },
  { name: "AWS Cloud Basics", count: notes.filter(n => n.subject === "AWS Cloud Basics").length, color: "bg-teal-500" },
  { name: "Version Control", count: notes.filter(n => n.subject === "Version Control").length, color: "bg-rose-500" }
];


  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return `${diffMinutes} minutes ago`
      }
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return "1 day ago"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading && notes.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">Loading notes...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notes & Resources</h1>
            <p className="text-muted-foreground">
              Organize and access your study materials
            </p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
            onClick={() => setIsCreating(true)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Create New Note
          </Button>
        </div>

        {/* Note Creation/Editing Modal */}
        {(isCreating || selectedNote) && (
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle>
                {isCreating ? "Create New Note" : "Edit Note"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Note Title"
                value={noteForm.title}
                onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
              />
                  <select
                  value={noteForm.subject}
                  onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                  className="w-full p-2 border rounded-md bg-muted/50  focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Select Subject</option>
                  {noteCategories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              <Textarea
                placeholder="Note Content"
                value={noteForm.content}
                onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                className="min-h-32"
              />
              <Input
                type="number"
                placeholder="Pages"
                value={noteForm.pages}
                onChange={(e) => setNoteForm({...noteForm, pages: parseInt(e.target.value) || 1})}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={isCreating ? handleCreateNote : handleUpdateNote}
                  disabled={loading}
                >
                  {isCreating ? "Create Note" : "Update Note"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false)
                    setSelectedNote(null)
                    setNoteForm({ title: "", subject: "", content: "", pages: 1 })
                  }}
                >
                  Cancel
                </Button>
                {selectedNote && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteClick(selectedNote)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes by title, subject, or content..."
                  className="pl-10 bg-muted/50 border-0"
                />
              </div>
              <Button variant="outline" className="hover:bg-accent">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {noteCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${category.color} text-white`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.count} notes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Notes */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Notes
            </CardTitle>
            <CardDescription>
              {notes.length === 0 ? "You don't have any notes yet" : "All your study materials"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notes.map((note, index) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleEditNote(note)}
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{note.title}</h3>
                      {note.starred && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">{note.subject}</Badge>
                      <span>•</span>
                      <span>{note.pages} pages</span>
                      <span>•</span>
                      <span>{formatDate(note.lastModified)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {handleDownloadNote(note); e.stopPropagation()}}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the note
                <strong> {noteToDelete?.title} </strong>
                and their contents
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </DashboardLayout>
  )
}

export default Notes