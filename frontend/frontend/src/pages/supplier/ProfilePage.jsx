import { useEffect, useState } from "react";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getProfile } from "../../api/supplierProfile.js";
import Tabs from "../../components/ui/Tabs.jsx";
import TaxDetailTab from "../../components/supplier/TaxDetailTab.jsx";
import DocumentsTab from "../../components/supplier/DocumentsTab.jsx";
import LicensesTab from "../../components/supplier/LicensesTab.jsx";
import BankAccountsTab from "../../components/supplier/BankAccountsTab.jsx";
import ContactsTab from "../../components/supplier/ContactsTab.jsx";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tax");

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) => showToast(err.message, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    { key: "tax", label: t("tabTaxDetail") },
    { key: "documents", label: t("tabDocuments") },
    { key: "licenses", label: t("tabLicenses") },
    { key: "bank", label: t("tabBankInvoicing") },
    { key: "contacts", label: t("tabContacts") },
  ];

  if (loading) return <p className={styles.loading}>{t("loadingLabel")}</p>;
  if (!profile) return null;

  return (
    <div>
      <div className={styles.head}>
        <h1>{t("profileTitle")}</h1>
        <p>{t("profileSubtitle")}</p>
      </div>

      <Tabs steps={steps} activeKey={activeTab} onChange={setActiveTab} numbered={false} />

      {activeTab === "tax" && (
        <TaxDetailTab taxDetail={profile.taxDetail} onUpdated={(tax) => setProfile((p) => ({ ...p, taxDetail: tax }))} />
      )}

      {activeTab === "documents" && (
        <DocumentsTab
          documents={profile.documents}
          onAdded={(doc) => setProfile((p) => ({ ...p, documents: [...p.documents, doc] }))}
          onRemoved={(id) => setProfile((p) => ({ ...p, documents: p.documents.filter((d) => d.id !== id) }))}
        />
      )}

      {activeTab === "licenses" && (
        <LicensesTab
          licenses={profile.licenses}
          onAdded={(lic) => setProfile((p) => ({ ...p, licenses: [...p.licenses, lic] }))}
          onRemoved={(id) => setProfile((p) => ({ ...p, licenses: p.licenses.filter((l) => l.id !== id) }))}
        />
      )}

      {activeTab === "bank" && (
        <BankAccountsTab
          bankAccounts={profile.bankAccounts}
          onAdded={(acc) => setProfile((p) => ({ ...p, bankAccounts: [...p.bankAccounts, acc] }))}
          onRemoved={(id) => setProfile((p) => ({ ...p, bankAccounts: p.bankAccounts.filter((a) => a.id !== id) }))}
        />
      )}

      {activeTab === "contacts" && (
        <ContactsTab
          contacts={profile.contacts}
          onAdded={(c) => setProfile((p) => ({ ...p, contacts: [...p.contacts, c] }))}
          onRemoved={(id) => setProfile((p) => ({ ...p, contacts: p.contacts.filter((c) => c.id !== id) }))}
        />
      )}
    </div>
  );
}
