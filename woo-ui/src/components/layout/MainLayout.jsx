import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ActivityPanel from "./ActivityPanel";

function MainLayout({ title, subtitle, children }) {
  return (
    <div className="flex bg-[#F5F7FB] dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 min-w-0 min-h-screen flex flex-col">
        <Navbar />

        <div className="flex flex-1 min-w-0">
          <div className="flex-1 min-w-0 p-8 dark:bg-slate-950">
            {title && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>

          <ActivityPanel />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
