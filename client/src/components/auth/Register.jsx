import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-hot-toast';
import { FaSpinner, FaEye, FaEyeSlash, FaShieldAlt, FaUserPlus, FaCheck, FaLock, FaEnvelope } from "react-icons/fa";
import { registerUser, verifyEmail } from "@/actions/authAction";


const Register = () => {
   const loading = useSelector(state => state.auth.loading);
   const dispatch = useDispatch();
   const navigate = useNavigate();

     // Form state
  const [user, setUser] = useState({ 
    email: '',
    password: '',
    password2: '',
    secretKey:''
    
  });

  // UI state
  const [errors, setErrors] = useState({
    email: '',
   secretKey:'',
    password: '',
    password2: '',

  });
    const [showPassword, setShowPassword] = useState(false);

  const { email, password, password2, secretKey } = user;

  const validateEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

    // Handle input changes with validation
  const onChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });

    // Real-time validation
    switch (name) {
      case 'email':
        setErrors({
          ...errors,
          email: !validateEmail(value) ? 'Invalid email format' : ''
        });
        break;
      case 'password':
        setErrors({
          ...errors,
          password: value.length < 8 ? 'Password must be 8+ characters' : ''
        });
        break;
      case 'password2':
        setErrors({
          ...errors,
          password2: value !== password ? 'Passwords do not match' : ''
        });
        break;
    }
  };

  const onSubmit = async (e) => {

    e.preventDefault();
    if (email === '' || password==='' || password2 === '' || secretKey === ''){
      toast.error('All fields are required!')
    return;
  }
    try {
    const result = await dispatch(registerUser({ email, password, secretKey }));
    
    if(result?.success){
      toast.success('Registration was successful')
    // Navigate after state updates
    setTimeout( async() => {
        const results = await dispatch(verifyEmail(email))
        if (results?.success){
            navigate('/verify-email')
        }
    }, 1000);
    }else if (result?.error) {
      toast.error(result.error)
    }
   
    
    
  } catch (err) {
    console.error(err);
    toast.error("Registration Failed")
  }

  };

  return (
    <main className="container flex min-h-[80vh] items-center justify-center py-12">
      <section className="w-full max-w-md rounded-xl border bg-card p-8 shadow">
        <FaUserPlus className="text-primary text-4xl ml-40 " />
        <h1 className="text-2xl font-bold text-center mt-3 font-heading">
          Sign Up for Trackademy</h1>
      
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="secretKey">SecretKey</Label>
            <div className="relative">
            < FaShieldAlt className="absolute inset-y-0 left-4 top-1 pr-3  text-2xl flex items-center" />
            <Input type="password" id="secretKey" placeholder="1234" name="secretKey" value={secretKey}  onChange={onChange} className='pr-10 pl-10'  />
             </div>
          </div>
          <div className="space-y-2"> 
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <FaEnvelope className="absolute inset-y-0 left-4 top-2 pr-3  text-2xl flex items-center" />
            <Input id="email" name="email" type="email" placeholder="you@example.com" value={email} onChange={onChange} className='pr-10 pl-10' />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <FaLock className="absolute inset-y-0 left-4 top-1 pr-3  text-2xl flex items-center" />
            <Input id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={onChange} className='pr-10 pl-10' />
            <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3  flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            >
               {showPassword ? <FaEyeSlash /> : <FaEye />}

            </button>
            </div>
            {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <div className="relative">
            <FaLock className="absolute inset-y-0 left-4 top-1 pr-3  text-2xl flex items-center" />
            <Input id="password2" type={showPassword ? "text" : "password"} name="password2"  value={password2} onChange={onChange} className="pl-10 pr-10"  />
                {password2 && !errors.password2 && password2 === password && (
                  <div className="absolute inset-y-0 right-0 pr-3  flex items-center">
                     <FaCheck className="text-green-400" />
                  </div>
              )}
            {errors.password2 && (
                  <p className="text-sm text-destructive">{errors.password2}</p>
                )}
          </div>
          <Button type="submit" className="w-full " disabled={loading}>
            {loading  ? (
              <div className="flex items-center justify-center ">
                  <FaSpinner className="animate-spin mr-2" />
                      Creating Account...
              </div>
            ): (
              <div className=" flex items-center justify-center ">
                <FaUserPlus className="mr-2" />
                      Create Account
              </div>
            )
          }
          </Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Login
          </Link>
        </p>
        </form>
      </section>
    </main>
  );
};

export default Register;
