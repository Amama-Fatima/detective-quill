import Header from "@/components/layout/header";

const NonWorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <Header />
      {children}
    </div>
  );
};

export default NonWorkspaceLayout;
