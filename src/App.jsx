import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import PersonalAnalysis from './Components/PersonalAnalysis/PersonalAnalysis';
import Navbar from './Components/Navbar/Navbar'
import Signup from './Components/Signup/Signup'
import Login from './Components/Login/Login'
import RecruitmentAnalysis from './Components/RecruitmentAnalysis/RecruitmentAnalysis';
import Dashboard from './Components/Dashboard/Dashboard';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
          <>
          <Navbar />
          <Dashboard />
          </>
        }
        />
        <Route
          path="/signup"
          element={
            <>
              <Navbar />
              <Signup />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <Login />
            </>
          }
        />
        <Route
          path="/personalAnalysis"
          element={
            <>
              <Navbar />
              <PersonalAnalysis />
            </>
          }
        />
        <Route
          path="/recruitmentAnalysis"
          element={
            <>
              <Navbar />
              <RecruitmentAnalysis />
            </>
          }
        />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </>
  )
}

export default App
