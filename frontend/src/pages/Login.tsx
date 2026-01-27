import { useState } from "react"
import { api } from "../api/client"
import { useAuth } from "../auth/AuthContext"
import { useNavigate } from "react-router-dom"


export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const { login } = useAuth()
  
  const navigate = useNavigate()
  
  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password })
      login(res.data.access_token)
      navigate("/")
      } catch {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-96 bg-white p-6 rounded shadow space-y-4">
        <h1 className="text-2xl font-bold">FixHub Login</h1>

        {error && <p className="text-red-600">{error}</p>}

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-black text-white py-2 rounded"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  )
}
