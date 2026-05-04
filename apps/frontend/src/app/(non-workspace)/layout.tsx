import Header from "@/components/layout/header";
import { AppFooter } from "@/components/layout/app-footer";

const NonWorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mt-17 flex-1">{children}</main>
      <AppFooter />
    </div>
  );
};

export default NonWorkspaceLayout;
