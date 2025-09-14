import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, User, Book, Building2, Briefcase, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStudent } from '../../actions/studentAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { loadUser } from '@/actions/authAction';
import { getStudentByUserId } from '@/actions/studentAction';

const EditStudentProfileModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading, error, userStudent } = useSelector((state) => state.student);
  const { user, token } = useSelector((state) => state.auth);
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const form = useForm({
    defaultValues: {
      name: '',
      category: '',
      level: '',
      program: '',
      department: '',
      specialization: '',
      institution: '',
      occupation: ''
    }
  });

  const categories = [
    'Undergraduate',
    'Graduate',
    'NSS',
    'Other'
  ];

  // Pre-fill form when userStudent data is available
  useEffect(() => {
    if (userStudent && isOpen) {
      form.reset({
        name: userStudent.name || '',
        category: userStudent.category || '',
        level: userStudent.level || '',
        program: userStudent.program || '',
        department: userStudent.department || '',
        specialization: userStudent.specialization || '',
        institution: userStudent.institution || '',
        occupation: userStudent.occupation || ''
      });

      // Set existing photo preview if available
      if (userStudent.photo) {
        setPhotoPreview(userStudent.photo);
      } else {
        setPhotoPreview(null);
      }
    }
  }, [userStudent, isOpen, form]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!userStudent?._id) {
        toast.error("Student profile not found");
        return;
      }

      // Create update data object
      const updateData = {
        ...data // Spread the form data
      };

      // Add photo file if selected
      if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
        updateData.photo = fileInputRef.current.files[0];
      }

      const result = await dispatch(updateStudent(userStudent._id, updateData, token));

      if (!result.success) {
        toast.error(result.message || "Failed to update profile");
        return;
      }

      toast.success("Student profile updated successfully");
      
      // Refresh user and student data
      await dispatch(loadUser());
      await dispatch(getStudentByUserId(user._id, token));
      
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Profile update error:', error);
      toast.error("Failed to update profile");
    }
  };

  const handleClose = () => {
    form.reset();
    setPhotoPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Edit Student Profile</h2>
            <p className="text-muted-foreground">Update your student profile information</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Form {...form}>
            <div className="space-y-8">
              {/* Photo upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group hover:scale-105 transition">
                  <div className="w-32 h-32 rounded-full border-4 border-primary/30 bg-muted overflow-hidden flex items-center justify-center shadow-inner">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(form.watch('name') || userStudent?.name || 'Student')}`}
                        alt="Generated Avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-primary text-white shadow-button hover:bg-primary/80"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Click to update photo. Max 5MB. JPG/PNG.
                </p>
              </div>

              {/* Form grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Full name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <User className="h-4 w-4 text-primary" /> Full Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Doe"
                          className="h-11 rounded-lg bg-background border border-border shadow-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <Book className="h-4 w-4 text-primary" /> Category *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <Book className="h-4 w-4 text-primary" /> Level
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="100"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="program"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <Book className="h-4 w-4 text-primary" /> Program
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Computer Science"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <Building2 className="h-4 w-4 text-primary" /> Department
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Engineering"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <Book className="h-4 w-4 text-primary" /> Specialization
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Software Engineering"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <Building2 className="h-4 w-4 text-primary" /> Institution
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="University of Example"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <Briefcase className="h-4 w-4 text-primary" /> Occupation
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Student"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  className="px-8 bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditStudentProfileModal;