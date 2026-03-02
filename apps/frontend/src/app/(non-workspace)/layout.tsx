import Header from "@/components/layout/header";

const NonWorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mt-17">{children}</main>
    </div>
  );
};

export default NonWorkspaceLayout;
