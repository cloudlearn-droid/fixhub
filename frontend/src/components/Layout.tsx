import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const logout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-6 py-3 flex justify-between">
        <h1 className="font-semibold text-lg">FixHub</h1>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
};

export default Layout;
