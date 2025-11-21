import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {toast} from 'react-hot-toast'
import { login } from "@/actions/authAction";
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaSpinner, FaEye, FaEyeSlash, FaShieldAlt, FaUserPlus, FaCheck, FaLock, FaEnvelope } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
    const dispatch = useDispatch();
  const loading = useSelector(state => state.auth.loading);
   const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
   const [showPassword, setShowPassword] = useState(false);




  const onChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if(!formData.email || !formData.password) {
      toast.error('All fields are required');
      return;
    }
    try {
      const result = await dispatch(login(formData));
      
      if (result?.success) {
       if (result.role === 'Student') {
        toast.success('Login successful');
        navigate(result.profileUpdated ? '/student-dashboard' : '/complete-student-profile');
  } else if (result.role === 'Admin') {
    toast.success('Login successful');
    navigate(result.profileUpdated ? '/admin-dashboard' : '/complete-Admin-profile');
  }
        
}else if (result?.error) {
  toast.error(result.error); 
}

    } catch (err) {
     // More robust error handling
      let errorMsg = 'Login failed';
      
      if (err.response?.data?.msg) {
        errorMsg = err.response.msg;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      toast.error(errorMsg)
    }
    
 
  };

  return (
    <main className="container flex min-h-[80vh] items-center justify-center py-12">
      <section className="w-full max-w-md rounded-xl border bg-card p-8 shadow">
        <h1 className=" text-center text-2xl font-bold font-heading">Login to Trackademy</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Forgot password? <a href="/forgot-password" className="underline">Reset it</a>
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="space-y-2"> 
            <Label htmlFor="email">Email</Label>
            <div className="relative">
            <FaEnvelope className="absolute inset-y-0 left-4 top-2 pr-3  text-2xl flex items-center" />
            <Input id="email" type="email" placeholder="you@example.com" name="email"
            value={formData.email}
            onChange={onChange} className="pl-10 pr-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
             <FaLock className="absolute inset-y-0 left-4 top-2 pr-3  text-2xl flex items-center" /> 
            <Input id="password" type={showPassword ? "text" : "password"} name="password"
            value={formData.password}
            onChange={onChange} className="pr-10 pl-10"  />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3  flex items-center"
              onClick={() => setShowPassword(!showPassword)}
                >
                {showPassword ? <FaEyeSlash /> : <FaEye />}   
                </button>
          </div>
          </div>
          <Button  type="submit" className="w-full" disabled={loading}>
            {loading ? 
            (
              <div className="flex items-center justify-center ">
                  <FaSpinner className="animate-spin mr-2" />
                      Logging in...
              </div>
            ): (
              <div className=" flex items-center justify-center ">
                      Login
              </div>
            )

            }
            </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          New to Trackademy? <Link to="/signup" className="underline">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
