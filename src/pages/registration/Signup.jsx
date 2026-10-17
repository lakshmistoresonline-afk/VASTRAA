import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MyContext from '../../context/data/myContext';
import { toast } from 'react-toastify';
import { auth, fireDB } from '../../firebase/FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import Loader from '../../components/loader/Loader';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const context = useContext(MyContext);
  const { loading, setLoading } = context;

  const navigate = useNavigate();

  const signUp = async (e) => {
    if (e) e.preventDefault();
    if (name === '' || email === '' || password === '') {
      return toast.error("All fields are required.");
    }

    setLoading(true);
    try {
      const users = await createUserWithEmailAndPassword(auth, email, password);

      const user = {
        name: name,
        uid: users.user.uid,
        email: users.user.email,
        createdAt: new Date().toISOString()
      };

      const userRef = collection(fireDB, "users");
      await addDoc(userRef, user);

      setName('');
      setEmail('');
      setPassword('');
      toast.success("Account created successfully!");
      navigate('/login');
    } catch (err) {
      console.warn("Firebase Auth Signup notice:", err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 px-4">
      {loading && <Loader />}
      <div className="bg-gray-800 p-8 sm:p-10 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl space-y-6">

        <div className="text-center space-y-2">
          <div className="bg-[#800020] text-[#D4AF37] w-14 h-14 rounded-xl mx-auto flex items-center justify-center text-2xl font-serif font-bold shadow border border-[#D4AF37]">
            LS
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Lakshmi Stores</h1>
          <p className="text-xs text-amber-200/80">Create Customer Account</p>
        </div>

        <form onSubmit={signUp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-700 px-3 py-2.5 w-full rounded-xl text-white text-xs placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="e.g. Ananya Nair"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700 px-3 py-2.5 w-full rounded-xl text-white text-xs placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="ananya@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 px-3 py-2.5 w-full rounded-xl text-white text-xs placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#800020] hover:bg-[#67001a] text-amber-100 font-bold py-3 rounded-xl text-xs transition-colors shadow"
          >
            Create Account
          </button>
        </form>

        <div className="border-t border-gray-700 pt-4 text-center text-xs text-gray-400">
          Already have an account? <Link className="text-[#D4AF37] font-bold" to="/login">Sign In</Link>
        </div>

      </div>
    </div>
  );
}

export default Signup;
