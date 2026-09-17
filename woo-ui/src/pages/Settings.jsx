import MainLayout from "../components/layout/MainLayout";
import SavedStoresSection from "../components/settings/SavedStoresSection";
import ThemeSection from "../components/settings/ThemeSection";
import BackendInfoSection from "../components/settings/BackendInfoSection";
import DangerZoneSection from "../components/settings/DangerZoneSection";

function Settings() {
  return (
    <MainLayout
      title="Settings"
      subtitle="Stores, appearance, and backend status"
    >
      <div className="space-y-5 max-w-3xl">
        <SavedStoresSection />
        <ThemeSection />
        <BackendInfoSection />
        <DangerZoneSection />
      </div>
    </MainLayout>
  );
}

export default Settings;
