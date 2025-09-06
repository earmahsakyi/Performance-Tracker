import React, { useState, useRef } from 'react';
import { Camera, Upload, User, Book, Building2, Briefcase, ClockFading } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createStudent } from '../../actions/studentAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { loadUser } from '@/actions/authAction';

const StudentProfileForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.student);
  const { user,token } = useSelector((state) => state.auth); 
  const navigate = useNavigate();
  
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
    // Create a regular object instead of FormData here
    const studentData = {
      userId: user._id,
      ...data // Spread the form data
    };

    // Add photo file if selected
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
      studentData.photo = fileInputRef.current.files[0];
    }

    // Pass the object to the action creator - it will create FormData internally
    const result = await dispatch(createStudent(studentData, token));

    if (!result.success) {
      toast.error(result.message || "Failed to create profile");
      return;
    }

    toast.success("Student profile created successfully");
    
    await dispatch(loadUser());
    
    setTimeout(() => {
      navigate('/');
    }, 1000);

  } catch (error) {
    console.error('Profile creation error:', error);
    toast.error("Failed to create profile");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30 p-6">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-heading font-bold text-foreground drop-shadow">
            Complete Your Student Profile
          </h1>
          <p className="text-muted-foreground text-lg">
            Set up your profile to start your learning journey
          </p>
        </div>

        <Card className="bg-card/70 backdrop-blur-lg shadow-card border border-border rounded-2xl p-8 hover:shadow-xl transition">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <User className="h-6 w-6 text-primary" /> Student Information
            </CardTitle>
            <CardDescription>
              Please fill in your details to create your student profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Photo upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group hover:scale-105 transition">
                    <div className="w-36 h-36 rounded-full border-4 border-primary/30 bg-muted overflow-hidden flex items-center justify-center shadow-inner">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(form.watch('name') || 'Student')}`}
                          alt="Generated Avatar"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="absolute -bottom-3 -right-3 rounded-full h-9 w-9 p-0 bg-primary text-white shadow-button hover:bg-primary/80"
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
                    Upload a clear photo. Max 5MB. JPG/PNG.
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <div className="alert alert-danger">
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="h-12 px-10 rounded-xl bg-primary text-white font-medium shadow-button hover:scale-105 transition disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full" />
                        Saving...
                      </>
                    ) : (
                      "Create Student Profile"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfileForm;