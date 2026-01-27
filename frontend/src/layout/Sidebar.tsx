import { useAuth } from "../auth/AuthContext"

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <div className="w-64 bg-gray-900 text-white p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold mb-6">FixHub</h1>
        <nav className="space-y-2">
          <div className="cursor-pointer">Dashboard</div>
        </nav>
      </div>

      <button
        onClick={logout}
        className="bg-red-600 py-2 rounded text-sm"
      >
        Logout
      </button>
    </div>
  )
}
